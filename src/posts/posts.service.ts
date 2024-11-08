import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { PostStatus, UserRequest } from 'src/types';
import { UpdatePostDto } from './dto/update-post.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postRepository: Repository<Post>,
    private userRepository: UsersService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    author: UserRequest,
  ): Promise<Post> {
    const post = new Post();
    Object.assign(post, createPostDto);

    const user = await this.userRepository.findById(author.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate unique slug
    post.slug = await this.generateUniqueSlug(createPostDto.title);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    post.author = safeUser;

    // Calculate reading time (assuming average reading speed of 200 words per minute)
    const wordCount = post.content.split(/\s+/).length;
    post.readingTime = Math.ceil(wordCount / 200);

    return this.postRepository.save(post);
  }

  async findAll(query: {
    status?: PostStatus;
    type?: string;
    category?: number;
    tag?: number;
    author?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.category', 'category')
      .leftJoinAndSelect('post.tags', 'tags');

    if (query.status) {
      qb.andWhere('post.status = :status', { status: query.status });
    }

    if (query.type) {
      qb.andWhere('post.type = :type', { type: query.type });
    }

    if (query.category) {
      qb.andWhere('category.id = :categoryId', { categoryId: query.category });
    }

    if (query.tag) {
      qb.andWhere('tags.id = :tagId', { tagId: query.tag });
    }

    if (query.author) {
      qb.andWhere('author.id = :authorId', { authorId: query.author });
    }

    if (query.search) {
      qb.andWhere('(post.title ILIKE :search OR post.content ILIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    qb.skip(skip).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      posts: items.map(({ author, ...post }) => ({
        ...post,
        author: {
          id: author.id,
          username: author.username,
          name: author.name,
          avatar: author.avatar,
        },
      })),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'category', 'tags', 'series'],
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { slug },
      relations: ['author', 'category', 'tags', 'series'],
    });

    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }

    return post;
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
    user: UserRequest,
  ): Promise<Post> {
    const post = await this.findOne(id);

    // Check if user is the author
    if (post.author.id !== user.userId) {
      throw new BadRequestException('You can only edit your own posts');
    }

    // If title is being updated, generate new slug
    if (updatePostDto.title) {
      post.slug = await this.generateUniqueSlug(updatePostDto.title);
    }

    // If content is being updated, recalculate reading time
    if (updatePostDto.content) {
      const wordCount = updatePostDto.content.split(/\s+/).length;
      post.readingTime = Math.ceil(wordCount / 200);
    }

    Object.assign(post, updatePostDto);
    return this.postRepository.save(post);
  }

  async remove(id: number, user: UserRequest): Promise<void> {
    const post = await this.findOne(id);

    if (post.author.id !== user.userId) {
      throw new BadRequestException('You can only delete your own posts');
    }

    await this.postRepository.softDelete(id);
  }

  async incrementViews(id: number): Promise<void> {
    await this.postRepository.increment({ id }, 'views', 1);
  }

  async like(id: number, userId: string) {
    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (!post.likedBy) {
      post.likedBy = [];
    }

    if (post.likedBy.includes(userId)) {
      throw new BadRequestException('Post already liked');
    }

    if (!post.likedBy.includes(userId)) {
      post.likedBy.push(userId);
      post.likes += 1;
      await this.postRepository.save(post);

      return {
        message: 'Post liked',
      };
    }
  }

  async unlike(id: number, userId: string) {
    const post = await this.findOne(id);

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    if (post.likedBy?.includes(userId)) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.likes -= 1;
      await this.postRepository.save(post);

      return {
        message: 'Post unliked',
      };
    }
  }

  async getLikedPosts(
    userId: string,
    query: { page?: number; limit?: number },
  ) {
    const page = parseInt(query.page as any, 10) || 1;
    const limit = parseInt(query.limit as any, 10) || 10;

    if (isNaN(page) || isNaN(limit)) {
      throw new BadRequestException('Page and limit must be valid numbers');
    }

    const queryBuilder = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .where('CAST(post.likedBy AS JSONB) @> :userId', {
        userId: JSON.stringify([userId]),
      })
      .orderBy('post.createdAt', 'DESC');

    // Get total count
    const totalItems = await queryBuilder.getCount();
    const totalPages = Math.ceil(totalItems / limit);

    // Validate page number
    if (page > totalPages && totalItems > 0) {
      throw new NotFoundException(
        `Page ${page} not found. Total pages: ${totalPages}`,
      );
    }

    // Get paginated results
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      posts: data.map(({ author, ...post }) => ({
        ...post,
        author: {
          id: author.id,
          username: author.username,
          name: author.name,
          avatar: author.avatar,
        },
      })),
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
  private async generateUniqueSlug(title: string): Promise<string> {
    const slug = slugify(title, { lower: true, strict: true });
    let counter = 0;
    let uniqueSlug = slug;

    while (true) {
      const existingPost = await this.postRepository.findOne({
        where: { slug: uniqueSlug },
      });

      if (!existingPost) {
        return uniqueSlug;
      }

      counter += 1;
      uniqueSlug = `${slug}-${counter}`;
    }
  }
}

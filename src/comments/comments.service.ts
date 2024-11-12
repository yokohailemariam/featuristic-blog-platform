import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Comment } from './comment.entity';
import {
  CommentFilters,
  CommentStatus,
  CreateCommentDto,
  PaginationParams,
  UpdateCommentDto,
} from 'src/types';
import { UsersService } from 'src/users/users.service';
import { PostsService } from 'src/posts/posts.service';
import { plainToClass, plainToInstance } from 'class-transformer';
import {
  CommentResponseDto,
  CreateCommentResponseDto,
  LikeCommentResponseDto,
  SingleCommentResponseDto,
} from './dto/comment-response.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    private userRepository: UsersService,

    private postRepository: PostsService,
  ) {}

  // Core CRUD Operations
  async create(dto: CreateCommentDto) {
    const author = await this.userRepository.findById(dto.authorId);

    if (!author) throw new NotFoundException('Author not found');

    const post = await this.postRepository.findOne(dto.postId);

    if (!post) throw new NotFoundException('Post not found');

    const comment = new Comment();
    comment.content = dto.content;
    comment.originalContent = dto.content;
    comment.author = author;
    comment.post = post;
    comment.attachments = dto.attachments;
    comment.mentions = dto.mentions;
    comment.metadata = dto.metadata;
    comment.ipAddress = dto.ipAddress;

    if (dto.parentCommentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: dto.parentCommentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.isReply) {
        throw new BadRequestException('Cannot reply to a reply');
      }

      comment.parentComment = parentComment;
      comment.isReply = true;
    }

    const res = await this.commentRepository.save(comment);

    return plainToClass(CreateCommentResponseDto, res, {
      excludeExtraneousValues: true,
    });
  }
  async getReplies(commentId: number, paginationParams: PaginationParams) {
    const page = paginationParams.page || 1;
    const limit = paginationParams.limit || 10;

    const comment = await this.findOne(commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const skip = (page - 1) * limit;

    const [replies, total] = await this.commentRepository.findAndCount({
      where: { parentComment: { id: commentId } },
      relations: ['author', 'likedBy', 'dislikedBy', 'flaggedBy'],
      order: {
        createdAt: 'ASC',
      },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    const response = {
      items: replies,
      metadata: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };

    return plainToInstance(CommentResponseDto, response, {
      excludeExtraneousValues: true,
    });
  }

  async findAll(filters: CommentFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;

    const where: FindOptionsWhere<Comment> = { isReply: false };

    // Apply filters
    if (filters.status) where.status = filters.status;
    if (filters.isReply !== undefined) where.isReply = filters.isReply;
    if (filters.authorId) where.author = { id: filters.authorId };
    if (filters.postId) where.post = { id: filters.postId };
    if (filters.isFlagged !== undefined) where.isFlagged = filters.isFlagged;
    if (filters.isPinned !== undefined) where.isPinned = filters.isPinned;
    if (filters.isHighlighted !== undefined)
      where.isHighlighted = filters.isHighlighted;

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const total = await this.commentRepository.count({ where });

    // Get paginated results
    const items = await this.commentRepository.find({
      where,
      relations: ['author', 'replies', 'likedBy', 'dislikedBy', 'flaggedBy'],
      order: {
        createdAt: 'DESC',
      },
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    const comments = {
      items,
      metadata: {
        total,
        page: page,
        limit: limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };

    return plainToInstance(CommentResponseDto, comments, {
      excludeExtraneousValues: true,
    });
  }

  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'replies', 'likedBy', 'dislikedBy', 'flaggedBy'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async update(id: number, dto: UpdateCommentDto, userId: number) {
    const comment = await this.findOne(id);

    if (!comment.editHistory) {
      comment.editHistory = [];
    }

    comment.editHistory.push({
      timestamp: new Date(),
      editorId: userId,
      previousContent: comment.content,
    });

    comment.content = dto.content ?? comment.content;
    comment.attachments = dto.attachments ?? comment.attachments;
    comment.mentions = dto.mentions ?? comment.mentions;
    comment.metadata = dto.metadata ?? comment.metadata;
    comment.isEdited = true;

    const res = await this.commentRepository.save(comment);

    return plainToClass(SingleCommentResponseDto, res, {
      excludeExtraneousValues: true,
    });
  }

  // Engagement Operations
  async like(
    commentId: number,
    userId: string,
  ): Promise<LikeCommentResponseDto> {
    const comment = await this.findOne(commentId);
    const user = await this.userRepository.findById(userId);

    if (!comment.likedBy) comment.likedBy = [];
    if (!comment.dislikedBy) comment.dislikedBy = [];

    // Remove dislike if exists
    const dislikeIndex = comment.dislikedBy.findIndex((u) => u.id === userId);
    if (dislikeIndex > -1) {
      comment.dislikedBy.splice(dislikeIndex, 1);
      comment.dislikes--;
    }

    // Toggle like
    const likeIndex = comment.likedBy.findIndex((u) => u.id === userId);
    if (likeIndex > -1) {
      comment.likedBy.splice(likeIndex, 1);
      comment.likes--;
    } else {
      comment.likedBy.push(user);
      comment.likes++;
    }

    const likeComment = await this.commentRepository.save(comment);

    return plainToClass(LikeCommentResponseDto, likeComment, {
      excludeExtraneousValues: true,
    });
  }

  async dislike(
    commentId: number,
    userId: string,
  ): Promise<LikeCommentResponseDto> {
    const comment = await this.findOne(commentId);
    const user = await this.userRepository.findById(userId);

    if (!comment.likedBy) comment.likedBy = [];
    if (!comment.dislikedBy) comment.dislikedBy = [];

    // Remove like if exists
    const likeIndex = comment.likedBy.findIndex((u) => u.id === userId);
    if (likeIndex > -1) {
      comment.likedBy.splice(likeIndex, 1);
      comment.likes--;
    }

    // Toggle dislike
    const dislikeIndex = comment.dislikedBy.findIndex((u) => u.id === userId);
    if (dislikeIndex > -1) {
      comment.dislikedBy.splice(dislikeIndex, 1);
      comment.dislikes--;
    } else {
      comment.dislikedBy.push(user);
      comment.dislikes++;
    }

    const dislikeComment = await this.commentRepository.save(comment);

    return plainToClass(LikeCommentResponseDto, dislikeComment, {
      excludeExtraneousValues: true,
    });
  }

  // Moderation Operations
  async flag(
    commentId: number,
    userId: string,
    reason?: string,
  ): Promise<Comment> {
    const comment = await this.findOne(commentId);
    const user = await this.userRepository.findOne(userId);

    if (!comment.flaggedBy) comment.flaggedBy = [];

    if (!comment.flaggedBy.some((u) => u.id === userId)) {
      comment.flaggedBy.push(user);
      comment.flagCount++;
      comment.isFlagged = true;

      if (reason) {
        comment.moderationReason = reason;
      }
    }

    return this.commentRepository.save(comment);
  }

  async moderate(
    commentId: number,
    status: CommentStatus,
    moderatorId: string,
    reason?: string,
  ): Promise<Comment> {
    const comment = await this.findOne(commentId);
    const moderator = await this.userRepository.findOne(moderatorId);

    comment.status = status;
    comment.moderatedBy = moderator;
    if (reason) {
      comment.moderationReason = reason;
    }

    if (status === CommentStatus.DELETED) {
      comment.deletedAt = new Date();
    }

    return this.commentRepository.save(comment);
  }

  // Administrative Operations
  async pin(commentId: number): Promise<Comment> {
    const comment = await this.findOne(commentId);
    comment.isPinned = !comment.isPinned;
    return this.commentRepository.save(comment);
  }

  async highlight(commentId: number): Promise<Comment> {
    const comment = await this.findOne(commentId);
    comment.isHighlighted = !comment.isHighlighted;
    return this.commentRepository.save(comment);
  }

  async markAsStaffResponse(commentId: number): Promise<Comment> {
    const comment = await this.findOne(commentId);
    comment.isStaffResponse = !comment.isStaffResponse;
    return this.commentRepository.save(comment);
  }

  // Analytics Operations
  async getCommentStats(postId: number) {
    const comments = await this.commentRepository.find({
      where: { post: { id: postId } },
    });

    return {
      totalComments: comments.length,
      topLevelComments: comments.filter((c) => !c.isReply).length,
      replies: comments.filter((c) => c.isReply).length,
      flaggedComments: comments.filter((c) => c.isFlagged).length,
      deletedComments: comments.filter(
        (c) => c.status === CommentStatus.DELETED,
      ).length,
      averageLikes:
        comments.reduce((acc, c) => acc + c.likes, 0) / comments.length,
    };
  }

  // Soft Delete
  async softDelete(id: number): Promise<void> {
    const comment = await this.findOne(id);
    comment.status = CommentStatus.DELETED;
    comment.deletedAt = new Date();
    await this.commentRepository.save(comment);
  }

  // Hard Delete
  async hardDelete(id: number): Promise<void> {
    await this.commentRepository.delete(id);
  }

  // Bulk Operations
  async bulkModerate(
    commentIds: number[],
    status: CommentStatus,
    moderatorId: string,
  ): Promise<void> {
    await this.commentRepository
      .createQueryBuilder()
      .update(Comment)
      .set({
        status,
        moderatedBy: { id: moderatorId },
        updatedAt: new Date(),
      })
      .whereInIds(commentIds)
      .execute();
  }
}

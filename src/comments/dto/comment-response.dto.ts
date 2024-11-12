import { Expose, Transform, Type } from 'class-transformer';

export class AuthorDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  username: string;

  @Expose()
  avatar: string;
}

export class PostDto {
  @Expose()
  id: number;

  @Expose()
  title: string;

  @Expose()
  slug: string;
}

export class MetadataDto {
  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;

  @Expose()
  hasNext: boolean;

  @Expose()
  hasPrevious: boolean;
}

export class CommentResponseDto {
  @Expose()
  @Type(() => CommentDto)
  items: CommentDto[];
  @Expose()
  metadata: MetadataDto;
}

export class CommentDto {
  @Expose()
  id: number;

  @Expose()
  content: string;

  @Expose()
  @Type(() => AuthorDto)
  author: AuthorDto;

  @Expose()
  @Type(() => PostDto)
  post: PostDto;

  @Expose()
  isReply: boolean;

  @Expose()
  likes: number;

  @Expose()
  dislikes: number;

  @Expose()
  isPinned: boolean;

  @Expose()
  isHighlighted: boolean;

  @Expose()
  isStaffResponse: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  // Only include if they exist
  @Expose()
  @Transform(({ value }) => value || undefined)
  attachments?: string[];

  @Expose()
  @Transform(({ value }) => value || undefined)
  mentions?: string[];

  @Expose()
  @Transform(({ value }) => value || undefined)
  editHistory?: any[];
}

export class CreateCommentResponseDto extends CommentDto {}

export class SingleCommentResponseDto extends CommentDto {
  @Expose()
  @Type(() => CommentDto)
  replies: CommentDto[];
}

export class LikeCommentResponseDto extends CommentDto {
  @Expose()
  @Type(() => CommentDto)
  replies: CommentDto[];

  @Expose()
  @Type(() => AuthorDto)
  likedBy: AuthorDto[];
}

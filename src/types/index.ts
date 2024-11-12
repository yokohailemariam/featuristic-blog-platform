export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  EDITOR = 'editor',
  ADMIN = 'admin',
}
export enum PostStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum PostType {
  ARTICLE = 'article',
  NEWS = 'news',
  TUTORIAL = 'tutorial',
  REVIEW = 'review',
}

export enum CommentStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',
  DELETED = 'deleted',
  PENDING_REVIEW = 'pending_review',
}

export interface UserRequest {
  userId: string;
  email: string;
}

// comments

export interface CreateCommentDto {
  content: string;
  authorId: string;
  postId: number;
  parentCommentId?: number;
  attachments?: any;
  mentions?: string[];
  metadata?: any;
  ipAddress?: string;
}

export interface UpdateCommentDto {
  content?: string;
  attachments?: any;
  mentions?: string[];
  metadata?: any;
}

export interface CommentFilters {
  status?: CommentStatus;
  isReply?: boolean;
  authorId?: string;
  postId?: number;
  isFlagged?: boolean;
  isPinned?: boolean;
  isHighlighted?: boolean;
  fromDate?: Date;
  toDate?: Date;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

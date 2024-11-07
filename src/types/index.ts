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

export interface UserRequest {
  userId: string;
  email: string;
}

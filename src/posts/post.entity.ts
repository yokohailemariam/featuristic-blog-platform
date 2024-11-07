import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  BaseEntity,
  DeleteDateColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Comment } from 'src/comments/comment.entity';
import { Tag } from 'src/tags/tag.entity';
import { Category } from 'src/categories/category.entity';
import { Series } from 'src/series/series.entity'; // New Series entity
import { Revision } from 'src/revisions/revision.entity'; // New Revision entity
import { PostStatus, PostType } from 'src/types';

@Entity()
@Index(['title', 'content'])
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ unique: true })
  @Index()
  slug: string;

  @Column('text')
  content: string;

  @Column('text', { nullable: true })
  richContent?: string;

  @Column({ length: 160, nullable: true })
  metaDescription?: string;

  @Column({ default: true })
  isPublished: boolean;

  @Column({ type: 'enum', enum: PostStatus, default: PostStatus.DRAFT })
  status: PostStatus;

  @Column({ type: 'enum', enum: PostType, default: PostType.ARTICLE })
  type: PostType;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likes: number;

  @Column('simple-array', { nullable: true })
  images?: string[];

  @Column({ nullable: true })
  featuredImage?: string;

  @Column({ nullable: true })
  publishedAt?: Date;

  @Column({ type: 'int', nullable: true })
  readingTime?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @ManyToOne(() => Category, (category) => category.posts)
  category: Category;

  @ManyToOne(() => Series, (series) => series.posts, { nullable: true })
  series?: Series;

  @OneToMany(() => Revision, (revision) => revision.post)
  revisions: Revision[];

  @Column('simple-json', { nullable: true })
  likedBy?: string[];

  @Column('simple-json', { nullable: true })
  savedBy?: string[];

  @Column('simple-json', { nullable: true })
  sharedBy?: string[];

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @Column({ nullable: true })
  scheduledPublishDate?: Date;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ default: false })
  allowComments: boolean;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ nullable: true })
  lastCommentAt?: Date;

  @Column({ default: 0 })
  commentCount: number;

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ nullable: true })
  parentPostId?: number;

  @ManyToOne(() => Post, (post) => post.childPosts)
  parentPost?: Post;

  @OneToMany(() => Post, (post) => post.parentPost)
  childPosts: Post[];

  @Column('simple-array', { nullable: true })
  relatedPostIds?: number[];

  @Column({ type: 'jsonb', nullable: true })
  seoMetadata?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  accessibility?: {
    altText?: string;
    transcription?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  translations?: Record<
    string,
    {
      title: string;
      content: string;
      metaDescription?: string;
    }
  >;
}

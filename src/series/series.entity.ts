import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
  Index,
  VersionColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';
import { Category } from '../categories/category.entity';
import { Tag } from '../tags/tag.entity';

export enum SeriesStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled',
}

@Entity()
@Index(['title', 'description']) // Add full-text search index
export class Series extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  @Index() // Add index for faster title lookups
  title: string;

  @Column({ unique: true })
  @Index() // Add index for faster slug lookups
  slug: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: SeriesStatus, default: SeriesStatus.PLANNING })
  status: SeriesStatus;

  @Column({ nullable: true })
  coverImage?: string;

  @Column({ type: 'int', default: 0 })
  expectedParts: number;

  @Column({ type: 'int', default: 0 })
  completedParts: number;

  @Column({ nullable: true })
  startDate?: Date;

  @Column({ nullable: true })
  endDate?: Date;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  likes: number;

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  ratingCount: number;

  @Column({ length: 160, nullable: true }) // For SEO
  metaDescription?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @VersionColumn()
  version: number;

  @ManyToOne(() => User, (user) => user.series)
  author: User;

  @OneToMany(() => Post, (post) => post.series)
  posts: Post[];

  @ManyToOne(() => Category, (category) => category.series, { nullable: true })
  category?: Category;

  @ManyToMany(() => Tag, { cascade: true })
  @JoinTable()
  tags: Tag[];

  @Column('simple-json', { nullable: true })
  likedBy?: string[];

  @Column('simple-json', { nullable: true })
  savedBy?: string[];

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @Column({ default: false })
  isFeatured: boolean;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

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
      description: string;
      metaDescription?: string;
    }
  >;

  @Column({ type: 'simple-array', nullable: true })
  relatedSeriesIds?: number[];

  @Column({ nullable: true })
  lastPostPublishedAt?: Date;

  @Column({ type: 'int', default: 0 })
  totalReadingTime?: number;

  @Column({ type: 'simple-array', nullable: true })
  contributors?: string[];

  @Column({ nullable: true })
  scheduledPublishDate?: Date;

  @Column({ type: 'jsonb', nullable: true })
  seriesOutline?: {
    parts: Array<{
      title: string;
      description?: string;
      status: 'planned' | 'in_progress' | 'completed';
    }>;
  };
}

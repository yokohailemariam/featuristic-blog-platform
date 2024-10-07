import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  BaseEntity,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';

export enum RevisionType {
  MINOR = 'minor',
  MAJOR = 'major',
  CONTENT = 'content',
  METADATA = 'metadata',
  PUBLISH = 'publish',
  UNPUBLISH = 'unpublish',
}

@Entity()
@Index(['postId', 'createdAt']) // Add index for faster lookups
export class Revision extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postId: number;

  @ManyToOne(() => Post, (post) => post.revisions)
  post: Post;

  @Column({ type: 'enum', enum: RevisionType, default: RevisionType.CONTENT })
  type: RevisionType;

  @Column('text')
  content: string;

  @Column('jsonb', { nullable: true })
  metadata?: {
    title?: string;
    slug?: string;
    metaDescription?: string;
    tags?: string[];
    categoryId?: number;
    status?: string;
    [key: string]: any; // Allow for additional metadata fields
  };

  @Column('text', { nullable: true })
  changeDescription?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.revisions)
  author: User;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column({ default: false })
  isRevertedTo: boolean;

  @Column('jsonb', { nullable: true })
  diff?: {
    added: string[];
    removed: string[];
    modified: string[];
  };

  @Column({ type: 'int', nullable: true })
  wordCount?: number;

  @Column({ type: 'int', nullable: true })
  characterCount?: number;

  @Column({ nullable: true })
  revisionDuration?: number; // Time spent editing in seconds

  @Column('simple-array', { nullable: true })
  affectedSections?: string[]; // List of section headers that were modified

  @Column({ nullable: true })
  parentRevisionId?: number; // For tracking revision history tree

  @Column('simple-array', { nullable: true })
  relatedRevisionIds?: number[]; // For linking related revisions (e.g., simultaneous edits to multiple posts)

  @Column({ type: 'jsonb', nullable: true })
  automatedChecks?: {
    spellCheck?: boolean;
    grammarCheck?: boolean;
    plagiarismCheck?: boolean;
    seoScore?: number;
    readabilityScore?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  approvalWorkflow?: {
    status: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: Date;
    comments?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isMajorVersion: boolean;

  @Column({ nullable: true })
  publishedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  rollbackInfo?: {
    rolledBackFrom: number;
    rolledBackAt: Date;
    rolledBackBy: string;
    reason?: string;
  };
}

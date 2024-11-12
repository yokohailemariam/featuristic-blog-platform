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
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';
import { CommentStatus } from 'src/types';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  originalContent: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  author: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  // For tracking if this is a reply to another comment
  @ManyToOne(() => Comment, (comment) => comment.replies, { nullable: true })
  parentComment: Comment;

  // For storing replies to this comment
  @OneToMany(() => Comment, (comment) => comment.parentComment)
  replies: Comment[];

  // To prevent nested replies
  @Column({ default: false })
  isReply: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  deletedAt: Date;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: 0 })
  dislikes: number;

  @ManyToMany(() => User)
  @JoinTable({ name: 'comment_likes' })
  likedBy: User[];

  @ManyToMany(() => User)
  @JoinTable({ name: 'comment_dislikes' })
  dislikedBy: User[];

  @Column({ type: 'enum', enum: CommentStatus, default: CommentStatus.ACTIVE })
  status: CommentStatus;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: false })
  isFlagged: boolean;

  @Column({ default: 0 })
  flagCount: number;

  @ManyToMany(() => User)
  @JoinTable({ name: 'comment_flags' })
  flaggedBy: User[];

  @Column({ nullable: true })
  moderationReason: string;

  @ManyToOne(() => User, { nullable: true })
  moderatedBy: User;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: false })
  isHighlighted: boolean;

  @Column({ default: false })
  isStaffResponse: boolean;

  @Column({ type: 'jsonb', nullable: true })
  attachments: any;

  @Column({ type: 'simple-array', nullable: true })
  mentions: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ type: 'jsonb', nullable: true })
  editHistory: {
    timestamp: Date;
    editorId: number;
    previousContent: string;
  }[];
}

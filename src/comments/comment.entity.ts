import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Post } from '../posts/post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, (user) => user.comments, { eager: true })
  author: User;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 0 })
  likes: number;

  @Column({ default: false })
  isEdited: boolean;

  @Column({ default: false })
  isFlagged: boolean;
}

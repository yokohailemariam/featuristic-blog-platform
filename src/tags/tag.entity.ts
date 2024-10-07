import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Post } from 'src/posts/post.entity';

@Entity()
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ default: 0 })
  postCount: number;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => Tag, (tag) => tag.children, { nullable: true })
  parent?: Tag;

  @OneToMany(() => Tag, (tag) => tag.parent)
  children: Tag[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BaseEntity,
} from 'typeorm';

import { Post } from 'src/posts/post.entity';
import { Series } from 'src/series/series.entity';

@Entity()
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ length: 255, unique: true })
  slug: string;

  @Column('text', { nullable: true })
  metaDescription?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    nullable: true,
  })
  parent?: Category;

  @OneToMany(() => Category, (category) => category.parent)
  subcategories: Category[];

  @OneToMany(() => Post, (post) => post.category)
  posts: Post[];

  @OneToMany(() => Series, (series) => series.category)
  series: Series[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ default: 0 })
  postCount: number;

  @Column({ default: true })
  isVisible: boolean;

  @Column('simple-json', { nullable: true })
  customMetadata?: Record<string, any>;
}

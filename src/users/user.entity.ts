import { Post } from 'src/posts/post.entity';
import { Comment } from 'src/comments/comment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
} from 'typeorm';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsDate,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Revision } from 'src/revisions/revision.entity';
import { Series } from 'src/series/series.entity';

export enum UserRole {
  USER = 'user',
  AUTHOR = 'author',
  EDITOR = 'editor',
  ADMIN = 'admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @IsNotEmpty()
  @MinLength(2)
  @Column({ length: 100 })
  name: string;

  @IsOptional()
  @MinLength(3)
  @Index({ unique: true })
  @Column({ length: 50, nullable: true })
  username?: string;

  @IsEmail()
  @Index({ unique: true })
  @Column({
    length: 100,
    transformer: {
      to: (value: string) => value.toLowerCase(),
      from: (value) => value,
    },
  })
  email: string;

  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  isEmailVerified?: boolean;

  @Column({ length: 255, nullable: true })
  password?: string;

  @IsOptional()
  @Column({ type: 'text', nullable: true })
  bio?: string;

  @IsOptional()
  @Column({ nullable: true })
  avatar?: string;

  @IsEnum(UserRole)
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @IsBoolean()
  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, select: false })
  otp?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  otpExpiresAt?: Date;

  @Column({ nullable: true, select: false })
  passwordResetToken?: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  passwordResetTokenExpiresAt?: Date;

  @Column({ nullable: true })
  lastLoginIP?: string;

  @IsOptional()
  @IsDate()
  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @IsBoolean()
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @IsBoolean()
  @Column({ type: 'boolean', default: true })
  emailNotifications: boolean;

  // Social login fields
  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  facebookId?: string;

  // Additional features
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ nullable: true, select: false })
  twoFactorSecret?: string;

  @Column({ type: 'int', nullable: true })
  profileCompleteness: number;

  @Column('json', { nullable: true })
  preferences?: object;

  @Column('text', { array: true, nullable: true })
  linkedProviders?: string[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone' })
  deletedAt?: Date;

  // Login attempts
  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastFailedLoginAttempt: Date;

  // Terms of service
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  hasAcceptedTerms: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  termsAcceptedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastPasswordChange: Date;

  // Relationships
  @OneToMany(() => Post, (post) => post.author)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];

  @ManyToMany(() => Post, { cascade: true })
  @JoinTable()
  favorites: Post[];

  @ManyToMany(() => User, (user) => user.following)
  @JoinTable()
  followers: User[];

  @ManyToMany(() => User, (user) => user.followers)
  following: User[];

  @OneToMany(() => Revision, (revision) => revision.author)
  revisions: Revision[];

  @OneToMany(() => Series, (series) => series.author)
  series: Series[];
}

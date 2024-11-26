import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { SeriesModule } from './series/series.module';
import { RevisionsModule } from './revisions/revisions.module';
import { Category } from './categories/category.entity';
import { User } from './users/user.entity';
import { Revision } from './revisions/revision.entity';
import { Series } from './series/series.entity';
import { Tag } from './tags/tag.entity';
import { Post } from './posts/post.entity';
import { Comment } from './comments/comment.entity';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DBHOST,
      port: parseInt(process.env.DBPORT) || 5432,
      username: process.env.DBUSERNAME,
      password: process.env.DBPASSWORD,
      database: process.env.DBNAME,
      entities: [Category, Comment, Post, Revision, Series, Tag, User],
      autoLoadEntities: true,
      logging: false,
      synchronize: true,
    }),
    CategoriesModule,
    CommentsModule,
    PostsModule,
    RevisionsModule,
    SeriesModule,
    TagsModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

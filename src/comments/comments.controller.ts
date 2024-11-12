import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
} from '@nestjs/common';
import {
  CommentFilters,
  CommentStatus,
  CreateCommentDto,
  PaginationParams,
  UpdateCommentDto,
} from 'src/types';
import { CommentsService } from './comments.service';
import { plainToClass } from 'class-transformer';
import { SingleCommentResponseDto } from './dto/comment-response.dto';
import { Public } from 'src/auth/auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post()
  async create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    createCommentDto.authorId = req.user.userId;
    return this.commentsService.create(createCommentDto);
  }

  @Public()
  @Get()
  async findAll(@Query() filters: CommentFilters) {
    return this.commentsService.findAll(filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const comment = await this.commentsService.findOne(id);

    return plainToClass(SingleCommentResponseDto, comment, {
      excludeExtraneousValues: true,
    });
  }

  @Public()
  @Get(':id/replies')
  async getReplies(
    @Param('id') id: number,
    @Query() paginationParams: PaginationParams,
  ) {
    return this.commentsService.getReplies(id, paginationParams);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user.userId);
  }

  @Post(':id/like')
  async like(@Param('id') id: number, @Request() req) {
    return this.commentsService.like(id, req.user.userId);
  }

  @Post(':id/dislike')
  async dislike(@Param('id') id: number, @Request() req) {
    return this.commentsService.dislike(id, req.user.userId);
  }

  @Post(':id/flag')
  async flag(
    @Param('id') id: number,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.commentsService.flag(id, req.user.userId, reason);
  }

  @Post(':id/moderate')
  async moderate(
    @Param('id') id: number,
    @Body('status') status: CommentStatus,
    @Request() req,
    @Body('reason') reason?: string,
  ) {
    return this.commentsService.moderate(id, status, req.user.userId, reason);
  }

  @Post(':id/pin')
  async pin(@Param('id') id: number) {
    return this.commentsService.pin(id);
  }

  @Post(':id/highlight')
  async highlight(@Param('id') id: number) {
    return this.commentsService.highlight(id);
  }

  @Post(':id/staff-response')
  async markAsStaffResponse(@Param('id') id: number) {
    return this.commentsService.markAsStaffResponse(id);
  }

  @Get('stats/:postId')
  async getCommentStats(@Param('postId') postId: number) {
    return this.commentsService.getCommentStats(postId);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: number) {
    return this.commentsService.softDelete(id);
  }

  @Delete(':id/hard')
  async hardDelete(@Param('id') id: number) {
    return this.commentsService.hardDelete(id);
  }

  @Post('bulk-moderate')
  async bulkModerate(
    @Body('commentIds') commentIds: number[],
    @Body('status') status: CommentStatus,
    @Query('moderatorId') moderatorId: string,
  ) {
    return this.commentsService.bulkModerate(commentIds, status, moderatorId);
  }
}

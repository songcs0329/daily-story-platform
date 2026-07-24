import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CommentsService } from './comments.service';
import type { AuthedUser } from '../auth/auth.guard';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('posts/:postId/comments')
  getComments(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.getComments(postId);
  }

  @Post('posts/:postId/comments')
  @UseGuards(AuthGuard)
  createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body('content') content: string,
    @CurrentUser() user: AuthedUser,
  ) {
    return this.commentsService.createComment(postId, user.id, content);
  }

  @Delete('comments/:commentId')
  @UseGuards(AuthGuard)
  deleteComment(@Param('commentId', ParseIntPipe) commentId: number, @CurrentUser() user: AuthedUser) {
    return this.commentsService.deleteComment(commentId, user.id);
  }
}

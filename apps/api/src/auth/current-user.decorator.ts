import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthedUser } from './auth.guard';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthedUser | undefined => {
  const request = ctx.switchToHttp().getRequest<Request & { user?: AuthedUser }>();
  return request.user;
});

import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedUser } from '../types';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();

    if (!request.user)
      throw new UnauthorizedException('User not authenticated');

    return data ? request.user?.[data] : request.user;
  },
);

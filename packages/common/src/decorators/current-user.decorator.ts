import { AuthenticatedUser } from '@hris/contracts';
import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

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

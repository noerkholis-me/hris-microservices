import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { CookiesDto } from '@hris/contracts';

export interface CookiesOptions {
  key: keyof CookiesDto;
  required?: boolean;
  errorMessage?: string;
}

export const Cookies = createParamDecorator(
  (data: keyof CookiesDto | CookiesOptions, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ cookies: CookiesDto }>();

    if (typeof data === 'string') {
      return data ? request.cookies?.[data] : request.cookies;
    }

    const { key, required = false, errorMessage } = data;
    const value = request.cookies?.[key];

    if (required && !value) {
      throw new UnauthorizedException(
        errorMessage || `${String(key)} is required`,
      );
    }

    return value;
  },
);

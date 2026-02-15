import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { SUCCESS_MESSAGE_KEY } from '../decorators/success-message.decorator';
import { ApiResponse } from '../types';
import { RENDER_METADATA } from '@nestjs/common/constants';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T> | T
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T> | T> {
    const renderTemplate = this.reflector.get<string>(
      RENDER_METADATA,
      context.getHandler(),
    );
    if (renderTemplate) {
      return next.handle();
    }

    const res = context.switchToHttp().getResponse<ApiResponse<T>>();
    const customMessage = this.reflector.getAllAndOverride<string>(
      SUCCESS_MESSAGE_KEY,
      [context.getHandler(), context.getClass()],
    );

    return next.handle().pipe(
      map((data: T) => ({
        statusCode: res.statusCode,
        message: customMessage ?? 'Request successful',
        data,
      })),
    );
  }
}

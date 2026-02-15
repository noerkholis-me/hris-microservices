import { HttpException } from '@nestjs/common';

export function extractErrorMessage(err: unknown): string {
  if (err instanceof HttpException) {
    const response = err.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object') {
      const payload = response as { message?: string | string[] };
      if (Array.isArray(payload.message)) {
        return payload.message.join(', ');
      }
      return payload.message || err.message;
    }
  }

  if (err instanceof Error) {
    return err.message;
  }

  return 'An unexpected error occurred';
}

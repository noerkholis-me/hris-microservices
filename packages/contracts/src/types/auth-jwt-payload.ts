export interface JwtPayload {
  sub: string;
  email: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export type AuthenticatedUser = JwtPayload;

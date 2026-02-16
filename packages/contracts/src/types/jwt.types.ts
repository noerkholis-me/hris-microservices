export interface JwtPayload {
  sub: string; // User ID
  email: string;
  permissions: string[]; // Array of permission strings
  roles: string[]; // Array of role names
  employeeId?: string; // Optional employee reference
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

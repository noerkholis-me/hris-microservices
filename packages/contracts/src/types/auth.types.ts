export interface AuthenticatedUser {
  sub: string; // User ID
  email: string;
  permissions: string[]; // Flattened permissions
  roles: string[]; // Role names
  employeeId?: string; // Employee reference
  iat?: number;
  exp?: number;
}

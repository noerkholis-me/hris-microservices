export const AUTH_EVENTS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  PASSWORD_CHANGED: 'password.changed',
  PASSWORD_RESET_REQUESTED: 'password_reset.requested',
} as const;

export interface UserCreatedEvent {
  userId: string;
  email: string;
  roles: string[];
}

export const EMPLOYEE_EVENTS = {
  CREATED: 'employee.created',
  UPDATED: 'employee.updated',
  DELETED: 'employee.deleted',
  ONBOARDED: 'employee.onboarded',
} as const;

export interface EmployeeCreatedEvent {
  employeeId: string;
  name: string;
  email: string;
  departmentId: string;
}

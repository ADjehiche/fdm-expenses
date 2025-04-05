import { EmployeeType } from "./employee/employeeRole";

/**
 * Serializable version of the User class that can be safely passed to client components
 */
export interface SerializedUser {
  id: string;
  firstName: string;
  familyName: string;
  fullName: string;
  email: string;
  employeeClassification: string;
  region: string;
  employeeRoleType: string;
  createdAt: string;
}

/**
 * Convert a backend User instance to a serializable plain object
 */
export function serializeUser(user: any): SerializedUser {
  return {
    id: user.getId().toString(),
    firstName: user.getFirstName(),
    familyName: user.getFamilyName(),
    fullName: `${user.getFirstName()} ${user.getFamilyName()}`,
    email: user.getEmail(),
    employeeClassification: user.getEmployeeClassification() === 0 ? "Internal" : "External",
    region: user.getRegion(),
    employeeRoleType: user.getEmployeeRole().getType(),
    createdAt: user.getCreatedAt().toISOString(),
  };
}

import { EmployeeType } from "./employee/employeeRole";
import { ClaimStatus } from "./claims/claim";

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
 * Serializable version of the Claim class that can be safely passed to client components
 */
export interface SerializedClaim {
  id: string;
  employeeId: number;
  amount: number;
  status: ClaimStatus;
  title: string;
  description: string;
  category: string;
  currency: string;
  createdAt: string;
  lastUpdated: string;
  attemptCount: number;
  feedback: string;
  evidence?: Array<{
    name: string;
    url: string;
  }>;
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
    employeeClassification:
      user.getEmployeeClassification() === 0 ? "Internal" : "External",
    region: user.getRegion(),
    employeeRoleType: user.getEmployeeRole().getType(),
    createdAt: user.getCreatedAt().toISOString(),
  };
}

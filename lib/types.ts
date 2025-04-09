export type UserRole =
  | "employee"
  | "lineManager"
  | "payrollOfficer"
  | "administrator";

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  lineManagerId?: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ExpenseStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "paid";

// Add ClaimStatus enum for client components to use
export enum ClaimStatus {
  DRAFT = "Draft",
  PENDING = "Pending",
  REJECTED = "Rejected",
  ACCEPTED = "Accepted",
  REIMBURSED = "Reimbursed",
}

// Add SerializedClaim interface for client components to use
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
}

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

export interface ExpenseClaim {
  id: string;
  userId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  date: Date;
  category: string;
  status: ExpenseStatus;
  evidence: Evidence[];
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  paidAt?: Date;
}

export interface Evidence {
  id: string;
  expenseClaimId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
}

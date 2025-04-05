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

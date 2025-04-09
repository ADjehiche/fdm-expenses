import { newAdmin, newConsultant, newGeneralUser, newLineManager, newPayrollOfficer } from "@/backend/createEmployee";

const getDefaultPassword = (): string => {
  const pass = process.env.DEFAULT_PASS;
  if (!pass) {
    return "pass123";
  }

  return pass;
}

export const defaultPassword = getDefaultPassword();
export const defaultRegion = "UK";

export const usernames = {
  general: "general@test.com",
  consultant: "consultant@test.com",
  payroll: "payroll@test.com",
  lineManager: "line@test.com",
  admin: "admin@test.com",
}

export const userDetails = {
  generalEmployee: newGeneralUser("Dave", "Smith", usernames.general, defaultRegion),
  consultant: newConsultant("Consultant", "Smith", usernames.consultant, defaultRegion),
  payrollOfficer: newPayrollOfficer("Accountant", "Smith", usernames.payroll, defaultRegion),
  lineManager: newLineManager("Manager", "Smith", usernames.lineManager, defaultRegion),
  admin: newAdmin("Administrator", "Smith", usernames.admin, defaultRegion),
};

export type BackendResult = {
  success: boolean;
  message: string;
}

export enum DatabaseManagerError {
  UserNotFound = "Failed to find user.",
  UserFailedToUpdate = "Failed to update.",
  UserFailedToSetLineManager = "Failed to set user's line manager."

}

export function CreateBackendResult(
  success: boolean,
  message: string
): BackendResult {
  return { success, message };
}
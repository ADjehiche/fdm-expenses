import { newAdmin, newConsultant, newGeneralUser, newLineManager, newPayrollOfficer } from "@/backend/createEmployee";

export const defaultPassword = "pass123";
export const defaultRegion = "UK";

export const usernames = {
    general: "general@test.com", 
    consultant: "consultant@test.com", 
    payroll: "payroll@test.com", 
    lineManager: "line@test.com", 
    admin: "admin@test.com",
}

export const userDetails = {
  generalEmployee: newGeneralUser("dave", "smith", usernames.general, defaultRegion),
  consultant: newConsultant("consultancy", "dave", usernames.consultant, defaultRegion),
  payrollOfficer: newPayrollOfficer("payroll", "dave", usernames.payroll, defaultRegion),
  lineManager: newLineManager("line man", "dave", usernames.lineManager, defaultRegion),
  admin: newAdmin("admin", "dave", usernames.admin, defaultRegion),
};

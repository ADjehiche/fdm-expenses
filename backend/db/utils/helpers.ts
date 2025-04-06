import { User } from "@/backend/user";
import { DatabaseManager } from "../databaseManager";
import { Administrator } from "@/backend/employee/administrator";
import { LineManager } from "@/backend/employee/lineManager";
import { PayrollOfficer } from "@/backend/employee/payrollOfficer";
import { defaultPassword, userDetails } from "./consts";

const create_temp = async (db: DatabaseManager): Promise<string> => {
  return "sdf";
};

const createEmployee = async (
  db: DatabaseManager,
  user: User,
  failMessage: string
): Promise<User> => {
  const employee = await db.addAccount(user, defaultPassword);

  if (!employee) {
    throw new Error(failMessage);
  }

  return employee;
};

export const createGeneralEmployee = async (
  db: DatabaseManager
): Promise<User> => {
  const employeeDetails = userDetails.generalEmployee;
  const emp = await createEmployee(
    db,
    employeeDetails,
    "General Staff Insert failed"
  );

  console.log("General Staff Insert successful", `id: ${emp.getId()}`);
  return emp;
};

export const createConsultant = async (db: DatabaseManager): Promise<User> => {
  const employeeDetails = userDetails.consultant;

  const emp = await createEmployee(
    db,
    employeeDetails,
    "Consultant Insert failed"
  );

  console.log("Consultant Insert successful", `id: ${emp.getId()}`);
  return emp;
};

export const createPayroll = async (db: DatabaseManager): Promise<User> => {
  const employeeDetails = userDetails.payrollOfficer;
  const emp = await createEmployee(
    db,
    employeeDetails,
    "Payroll Officer Insert failed"
  );

  const payrollOfficerRole = emp.getEmployeeRole();
  if (!(payrollOfficerRole instanceof PayrollOfficer)) {
    throw new Error("payrollOfficerRole is not instance of PayrollOfficer");
  }

  console.log("Payroll Officer successful", `id: ${emp.getId()}`);
  return emp;
};

export const createAdmin = async (db: DatabaseManager): Promise<User> => {
  const employeeDetails = userDetails.admin;
  const administrator = await createEmployee(
    db,
    employeeDetails,
    "Administrator Insert failed"
  );
  const administratorRole = administrator.getEmployeeRole();

  if (!(administratorRole instanceof Administrator)) {
    throw new Error("administratorRole is not instance of Administrator");
  }
  console.log(
    "Administrator Insert successful",
    `id: ${administrator.getId()}`
  );

  return administrator;
};

export const createLineManager = async (db: DatabaseManager): Promise<User> => {
  const employeeDetails = userDetails.lineManager;
  const emp = await createEmployee(
    db,
    employeeDetails,
    "LineManager Insert failed"
  );

  const lineManagerRole = emp.getEmployeeRole();

  if (!(lineManagerRole instanceof LineManager)) {
    throw new Error("lineManagerRole is not instance of LineManager");
  }

  console.log("LineManager Insert successful", `id: ${emp.getId()}`);
  return emp;
};

import { User } from "@/backend/user";
import { DatabaseManager } from "../databaseManager";
import { Administrator } from "@/backend/employee/administrator";
import { LineManager } from "@/backend/employee/lineManager";
import { PayrollOfficer } from "@/backend/employee/payrollOfficer";
import { defaultPassword, userDetails } from "./consts";
import { Claim } from "@/backend/claims/claim";

const create_temp = async (db: DatabaseManager): Promise<string> => {
  return "sdf";
};

// Create Employees
const createEmployee = async (
  db: DatabaseManager,
  user: User
): Promise<User> => {
  const employee = await db.addAccount(user, defaultPassword);

  if (!employee) {
    throw new Error(
      `Insert ${user.getEmployeeType()} failed for ${user.getFirstName()}`
    );
  }

  return employee;
};

export const createGeneralEmployee = async (
  db: DatabaseManager
): Promise<User> => {
  const employeeDetails = userDetails.generalEmployee;
  const emp = await createEmployee(db, employeeDetails);

  console.log("General Staff Insert successful", `id: ${emp.getId()}`);
  return emp;
};

export const createConsultant = async (db: DatabaseManager): Promise<User> => {
  const employeeDetails = userDetails.consultant;

  const emp = await createEmployee(db, employeeDetails);

  console.log("Consultant Insert successful", `id: ${emp.getId()}`);
  return emp;
};

export const createPayroll = async (db: DatabaseManager): Promise<User> => {
  const employeeDetails = userDetails.payrollOfficer;
  const emp = await createEmployee(db, employeeDetails);

  const payrollOfficerRole = emp.getEmployeeRole();
  if (!(payrollOfficerRole instanceof PayrollOfficer)) {
    throw new Error("payrollOfficerRole is not instance of PayrollOfficer");
  }

  console.log("Payroll Officer successful", `id: ${emp.getId()}`);
  return emp;
};

export const createAdmin = async (db: DatabaseManager): Promise<User> => {
  const employeeDetails = userDetails.admin;
  const administrator = await createEmployee(db, employeeDetails);
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
  const emp = await createEmployee(db, employeeDetails);

  const lineManagerRole = emp.getEmployeeRole();

  if (!(lineManagerRole instanceof LineManager)) {
    throw new Error("lineManagerRole is not instance of LineManager");
  }

  console.log("LineManager Insert successful", `id: ${emp.getId()}`);
  return emp;
};

// Create Claims

const updateClaim = async (
  emp: User,
  claim: Claim,
  newValue: number
): Promise<Claim> => {
  const updatedClaim = await emp
    .getEmployeeRole()
    .updateClaimAmount(claim, 100);
  if (!updatedClaim) {
    throw new Error(`${emp.getEmployeeType()} Claim Update failed`);
  }
  console.log(
    `${emp.getEmployeeType()} ${updatedClaim.getStatus()} Claim Update successful`,
    `id: ${updatedClaim.getId()}, amount: ${updatedClaim.getAmount()}`
  );

  return updatedClaim;
};

const submitClaim = async (emp: User, claim: Claim): Promise<Claim> => {
  const submittedClaim = await emp.getEmployeeRole().submitClaim(claim);
  if (!submittedClaim) {
    throw new Error(`G${emp.getEmployeeType()} Pending Claim Submit failed`);
  }
  console.log(
    "General Staff Pending Claim Submit successful",
    `id: ${submittedClaim.getId()}, amount: ${submittedClaim.getAmount()} status: ${submittedClaim.getStatus()}`
  );

  return submittedClaim;
};

const lineManagerApproveClaim = async (
  lineManager: User,
  claimToAccept: Claim
): Promise<Claim> => {
  const lineManagerRole = lineManager.getEmployeeRole() as LineManager;

  const managersClaims = await lineManagerRole.getEmployeeSubmittedClaims();
  if (managersClaims.length !== 2) {
    throw new Error(
      `Line Manager Claims Insert failed length: ${managersClaims.length}`
    );
  }
  const acceptedClaim = await lineManagerRole.approveClaim(claimToAccept);
  if (!acceptedClaim) {
    throw new Error("Line Manager Accepted Claim Insert failed");
  }
  console.log(
    "Line Manager Accepted Claim Insert successful",
    `id: ${acceptedClaim.getId()}, amount: ${acceptedClaim.getAmount()} status: ${acceptedClaim.getStatus()}`
  );

  return claimToAccept;
};

const lineManagerRejectClaim = async (
  lineManager: User,
  claimToReject: Claim,
  reason: string
): Promise<Claim> => {
  const lineManagerRole = lineManager.getEmployeeRole() as LineManager;

  const managersClaims = await lineManagerRole.getEmployeeSubmittedClaims();
  if (managersClaims.length !== 2) {
    throw new Error("Line Manager Claims Insert failed");
  }
  const rejectedClaim2 = await lineManagerRole.rejectClaim(
    claimToReject,
    reason
  );
  if (!rejectedClaim2) {
    throw new Error("Line Manager Rejected Claim Insert failed");
  }
  console.log(
    "Line Manager Rejected Claim Insert successful",
    `id: ${rejectedClaim2.getId()}, amount: ${rejectedClaim2.getAmount()} status: ${rejectedClaim2.getStatus()}`
  );

  return claimToReject;
};

const payrollReimburseClaim = async (
  payrollOfficer: User,
  claimToReimburse: Claim
): Promise<Claim> => {
  const payrollOfficerRole =
    (await payrollOfficer.getEmployeeRole()) as PayrollOfficer;
  if (!payrollOfficerRole) {
    throw new Error("Payroll Officer Claim Insert failed");
  }

  const reimbursedClaim = await payrollOfficerRole.reimburseExpense(
    claimToReimburse
  );
  if (!reimbursedClaim) {
    throw new Error(
      `Payroll Officer ${payrollOfficer.getFirstName()} cannot reimburse claim ${claimToReimburse.getId()}`
    );
  }

  console.log(
    "Payroll Officer Claim Insert successful, claim:",
    `id: ${reimbursedClaim.getId()}, amount: ${reimbursedClaim.getAmount()} status: ${reimbursedClaim.getStatus()}`
  );

  return reimbursedClaim;
};

export const createDraftClaim = async (emp: User): Promise<Claim> => {
  const claim = await emp.getEmployeeRole().createDraftClaim({
    title: "string",
    description: "string",
    category: "test",
    currency: "GBP",
  });

  if (!claim) {
    throw new Error(`Claim Insert failed for ${emp.getEmployeeType()}`);
  }

  console.log(
    `${emp.getEmployeeType()} Draft Claim Insert successful`,
    `id: ${claim.getId()}`
  );

  return claim;
};

export const createPendingClaim = async (
  emp: User,
  updatedValue: number
): Promise<Claim> => {
  const draftClaim = await createDraftClaim(emp);
  const updatedClaim = await updateClaim(emp, draftClaim, updatedValue);

  // Submit claim
  return await submitClaim(emp, updatedClaim);
};

export const createApprovedClaim = async (
  emp: User,
  updatedValue: number,
  lineManager: User
): Promise<Claim> => {
  const claimToApprove = await createPendingClaim(emp, updatedValue);
  return lineManagerApproveClaim(lineManager, claimToApprove);
};

export const createRejectedClaim = async (
  emp: User,
  updatedValue: number,
  lineManager: User
): Promise<Claim> => {
  const claimToReject = await createPendingClaim(emp, updatedValue);
  return lineManagerRejectClaim(
    lineManager,
    claimToReject,
    "Value requested too high, receipt says 50"
  );
};

export const createReimbusedClaim = async (
  emp: User,
  updatedValue: number,
  lineManager: User,
  payrollOfficer: User
): Promise<Claim> => {
  const claimToReimburse = await createApprovedClaim(
    emp,
    updatedValue,
    lineManager
  );

  return claimToReimburse;
};

import { DatabaseManager } from "../databaseManager";
import { Administrator } from "@/backend/employee/administrator";
import { LineManager } from "@/backend/employee/lineManager";
import { PayrollOfficer } from "@/backend/employee/payrollOfficer";
import {
  createAdmin,
  createApprovedClaim,
  createConsultant,
  createDraftClaim,
  createGeneralEmployee,
  createLineManager,
  createPayroll,
  createPendingClaim,
  createRejectedClaim,
} from "@/backend/db/utils/helpers";
import { Claim, ClaimStatus } from "@/backend/claims/claim";
import { User } from "@/backend/user";

async function InsertDefaultData() {
  const db = DatabaseManager.getInstance();
  if (!db) {
    throw new Error("DatabaseManager instance is not available");
  }

  // Create general employees
  const general = await createGeneralEmployee(db);
  const consultant = await createConsultant(db);
  const payroll = await createPayroll(db);
  const lineManager = await createLineManager(db);
  const admin = await createAdmin(db);

  const payrollOfficerRole = payroll.getEmployeeRole() as PayrollOfficer;
  const lineManagerRole = lineManager.getEmployeeRole() as LineManager;
  const adminRole = admin.getEmployeeRole() as Administrator;

  adminRole.setEmployeesLineManager(general.getId(), lineManager.getId());
  adminRole.setEmployeesLineManager(consultant.getId(), lineManager.getId());

  // Create a draft claim
  await createDraftClaim(general);

  // Create a pending claim
  await createPendingClaim(general, 100);

  // Create a accepted claim
  await createApprovedClaim(general, 500, lineManager);

  // Create a rejected claim
  await createRejectedClaim(general, 1500, lineManager);

  // Create a reimbursed claim

  const acceptedEmployeeClaim2 = await general
    .getEmployeeRole()
    .createDraftClaim();
  if (!acceptedEmployeeClaim2) {
    throw new Error("General Staff Accepted Claim Insert failed");
  }
  console.log(
    "General Staff Accepted Claim Insert successful",
    `id: ${acceptedEmployeeClaim2.getId()}`
  );

  const updatedAcceptedEmployeeClaim2 = await general
    .getEmployeeRole()
    .updateClaimAmount(acceptedEmployeeClaim2, 1000);
  if (!updatedAcceptedEmployeeClaim2) {
    throw new Error("General Staff Accepted Claim Update failed");
  }
  console.log(
    "General Staff Accepted Claim Update successful",
    `id: ${updatedAcceptedEmployeeClaim2.getId()}, amount: ${updatedAcceptedEmployeeClaim2.getAmount()}`
  );

  const acceptedEmployeeClaimSubmit2 = await general
    .getEmployeeRole()
    .submitClaim(updatedAcceptedEmployeeClaim2);
  if (!acceptedEmployeeClaimSubmit2) {
    throw new Error("General Staff Accepted Claim Submit failed");
  }
  console.log(
    "General Staff Accepted Claim Submit successful",
    `id: ${acceptedEmployeeClaimSubmit2.getId()}, amount: ${acceptedEmployeeClaimSubmit2.getAmount()} status: ${acceptedEmployeeClaimSubmit2.getStatus()}`
  );

  const lineManagerClaims2 = await lineManagerRole.getEmployeeSubmittedClaims();
  if (lineManagerClaims2.length !== 2) {
    throw new Error("Line Manager Claims Insert failed");
  }
  const acceptedClaim2 = await lineManagerRole.approveClaim(
    acceptedEmployeeClaimSubmit2
  );
  if (!acceptedClaim2) {
    throw new Error("Line Manager Accepted Claim Insert failed");
  }
  console.log(
    "Line Manager Accepted Claim Insert successful",
    `id: ${acceptedClaim2.getId()}, amount: ${acceptedClaim2.getAmount()} status: ${acceptedClaim2.getStatus()}`
  );

  const payrollOfficerClaims = await payrollOfficerRole.reimburseExpense(
    acceptedClaim2
  );
  if (!payrollOfficerClaims) {
    throw new Error("Payroll Officer Claim Insert failed");
  }
  console.log(
    "Payroll Officer Claim Insert successful",
    `id: ${payrollOfficerClaims.getId()}, amount: ${payrollOfficerClaims.getAmount()} status: ${payrollOfficerClaims.getStatus()}`
  );
}

InsertDefaultData();

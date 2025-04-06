import { DatabaseManager } from "../databaseManager";
import { Administrator } from "@/backend/employee/administrator";
import { LineManager } from "@/backend/employee/lineManager";
import { PayrollOfficer } from "@/backend/employee/payrollOfficer";
import { createAdmin, createConsultant, createGeneralEmployee, createLineManager, createPayroll } from "@/backend/db/utils/helpers"


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

  // Create a draft claim for the general employee

  const draftClaim = await general.getEmployeeRole().createDraftClaim();
  if (!draftClaim) {
    throw new Error("General Staff Claim Insert failed");
  }
  console.log(
    "General Staff Draft Claim Insert successful",
    `id: ${draftClaim.getId()}`
  );

  // Create a submitted claim for the consultant employee

  const generalEmployeeClaim = await general
    .getEmployeeRole()
    .createDraftClaim();
  if (!generalEmployeeClaim) {
    throw new Error("General Staff Pending Claim Insert failed");
  }
  console.log(
    "General Staff Pending Claim Insert successful",
    `id: ${generalEmployeeClaim.getId()}`
  );

  const updatedGeneralEmployeeClaim = await general
    .getEmployeeRole()
    .updateClaimAmount(generalEmployeeClaim, 100);
  if (!updatedGeneralEmployeeClaim) {
    throw new Error("General Staff Pending Claim Update failed");
  }
  console.log(
    "General Staff Pending Claim Update successful",
    `id: ${updatedGeneralEmployeeClaim.getId()}, amount: ${updatedGeneralEmployeeClaim.getAmount()}`
  );

  const submittedGeneralEmployeeClaim = await general
    .getEmployeeRole()
    .submitClaim(updatedGeneralEmployeeClaim);
  if (!submittedGeneralEmployeeClaim) {
    throw new Error("General Staff Pending Claim Submit failed");
  }
  console.log(
    "General Staff Pending Claim Submit successful",
    `id: ${submittedGeneralEmployeeClaim.getId()}, amount: ${submittedGeneralEmployeeClaim.getAmount()} status: ${submittedGeneralEmployeeClaim.getStatus()}`
  );

  // Create a accepted claim

  const acceptedEmployeeClaim = await general
    .getEmployeeRole()
    .createDraftClaim();
  if (!acceptedEmployeeClaim) {
    throw new Error("General Staff Accepted Claim Insert failed");
  }
  console.log(
    "General Staff Accepted Claim Insert successful",
    `id: ${acceptedEmployeeClaim.getId()}`
  );

  const updatedAcceptedEmployeeClaim = await general
    .getEmployeeRole()
    .updateClaimAmount(acceptedEmployeeClaim, 500);
  if (!updatedAcceptedEmployeeClaim) {
    throw new Error("General Staff Accepted Claim Update failed");
  }
  console.log(
    "General Staff Accepted Claim Update successful",
    `id: ${updatedAcceptedEmployeeClaim.getId()}, amount: ${updatedAcceptedEmployeeClaim.getAmount()}`
  );

  const acceptedEmployeeClaimSubmit = await general
    .getEmployeeRole()
    .submitClaim(updatedAcceptedEmployeeClaim);
  if (!acceptedEmployeeClaimSubmit) {
    throw new Error("General Staff Accepted Claim Submit failed");
  }
  console.log(
    "General Staff Accepted Claim Submit successful",
    `id: ${acceptedEmployeeClaimSubmit.getId()}, amount: ${acceptedEmployeeClaimSubmit.getAmount()} status: ${acceptedEmployeeClaimSubmit.getStatus()}`
  );

  const lineManagerClaims = await lineManagerRole.getEmployeeSubmittedClaims();
  if (lineManagerClaims.length !== 2) {
    throw new Error(
      `Line Manager Claims Insert failed length: ${lineManagerClaims.length}`
    );
  }
  const acceptedClaim = await lineManagerRole.approveClaim(
    acceptedEmployeeClaimSubmit
  );
  if (!acceptedClaim) {
    throw new Error("Line Manager Accepted Claim Insert failed");
  }
  console.log(
    "Line Manager Accepted Claim Insert successful",
    `id: ${acceptedClaim.getId()}, amount: ${acceptedClaim.getAmount()} status: ${acceptedClaim.getStatus()}`
  );

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

  // Create a rejected claim

  const rejectedClaim = await general.getEmployeeRole().createDraftClaim();
  if (!rejectedClaim) {
    throw new Error("General Staff Rejected Claim Insert failed");
  }
  console.log(
    "General Staff Rejected Claim Insert successful",
    `id: ${rejectedClaim.getId()}`
  );
  const updatedRejectedClaim = await general
    .getEmployeeRole()
    .updateClaimAmount(rejectedClaim, 1500);
  if (!updatedRejectedClaim) {
    throw new Error("General Staff Rejected Claim Update failed");
  }
  console.log(
    "General Staff Rejected Claim Update successful",
    `id: ${updatedRejectedClaim.getId()}, amount: ${updatedRejectedClaim.getAmount()}`
  );
  const rejectedClaimSubmit = await general
    .getEmployeeRole()
    .submitClaim(updatedRejectedClaim);
  if (!rejectedClaimSubmit) {
    throw new Error("General Staff Rejected Claim Submit failed");
  }
  console.log(
    "General Staff Rejected Claim Submit successful",
    `id: ${rejectedClaimSubmit.getId()}, amount: ${rejectedClaimSubmit.getAmount()} status: ${rejectedClaimSubmit.getStatus()}`
  );
  const lineManagerClaims3 = await lineManagerRole.getEmployeeSubmittedClaims();
  if (lineManagerClaims3.length !== 2) {
    throw new Error("Line Manager Claims Insert failed");
  }
  const rejectedClaim2 = await lineManagerRole.rejectClaim(
    rejectedClaimSubmit,
    "Rejected for testing"
  );
  if (!rejectedClaim2) {
    throw new Error("Line Manager Rejected Claim Insert failed");
  }
  console.log(
    "Line Manager Rejected Claim Insert successful",
    `id: ${rejectedClaim2.getId()}, amount: ${rejectedClaim2.getAmount()} status: ${rejectedClaim2.getStatus()}`
  );
}

InsertDefaultData();
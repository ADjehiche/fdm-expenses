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
  createReimbusedClaim,
  createRejectedClaim,
} from "@/backend/db/utils/helpers";

async function InsertDefaultData() {
  const db = DatabaseManager.getInstance();
  if (!db) {
    throw new Error("DatabaseManager instance is not available");
  }

  // Create general employees
  const general = await createGeneralEmployee(db);
  const consultant = await createConsultant(db);
  const payrollOfficer = await createPayroll(db);
  const lineManager = await createLineManager(db);
  const admin = await createAdmin(db);

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
  await createReimbusedClaim(general, 1000, lineManager, payrollOfficer);
}

InsertDefaultData();

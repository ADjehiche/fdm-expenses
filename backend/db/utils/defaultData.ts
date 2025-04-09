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
  await createDraftClaim(general, "Dinner reservation at the Gall");

  // Create a pending claim
  await createPendingClaim(general, "Lunch break with Client", 100);

  // Create a accepted claim
  await createApprovedClaim(general, "Valid Dinner Reservation", 500, lineManager);

  // Create a rejected claim
  await createRejectedClaim(general, "Fraudulent Dinner Reservation", 1500, lineManager);

  // Create a reimbursed claim
  await createReimbusedClaim(general, "Travel Costs for Work Sanctioned Conference Trip", 1000, lineManager, payrollOfficer);

  await createPendingClaim(consultant, "Buy Adobe", 10000000000000);
  await createApprovedClaim(consultant, "Lunch Break", 10, lineManager);
  await createApprovedClaim(consultant, "Breakfast", 5, lineManager);
}

InsertDefaultData();

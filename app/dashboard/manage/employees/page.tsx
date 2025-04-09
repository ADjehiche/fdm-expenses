"use server";

import { getCurrentUser } from "@/actions/loginauth";
import {
  getSubmittedClaims,
  approveClaimAction,
  rejectClaimAction,
} from "@/actions/claimActions";
import EmployeeList from "./EmployeeList";
import { redirect } from "next/navigation";
import { User } from "@/backend/user";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { EmployeeType } from "@/backend/employee/employeeRole";
import { SerializedClaim, SerializedUser, serializeUser } from "@/backend/serializedTypes";

// Create properly marked server actions for passing to client components
async function approveAction(id: string) {
  "use server";
  return approveClaimAction(parseInt(id));
}

async function rejectAction(id: string, feedback: string) {
  "use server";
  return rejectClaimAction(parseInt(id), feedback);
}

export default async function ManagePage() {
  const serializedUser = await getCurrentUser();
  if (!serializedUser) {
    redirect("/login");
  }

  // Get the full User object from the database
  const db = DatabaseManager.getInstance();
  const user = await db.getAccount(parseInt(serializedUser.id));

  if (!user) {
    redirect("/login");
  }

  // Ensure user has appropriate permissions (is a manager)
  if (user.getEmployeeRole().getType() !== EmployeeType.LineManager) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  // Get claims submitted by employees for review
  const claims = await getSubmittedClaims(user);

  // Fetch employee names for each claim
  const employees = await db.getAllAccounts();

  const serializedEmployees: SerializedUser[] = employees.map((employee, index) => (serializeUser(employee)));
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Employees you manage</h1>
      <EmployeeList
        employees={serializedEmployees}
        approveClaimAction={approveAction}
        rejectClaimAction={rejectAction}
      />
    </div>
  );
}

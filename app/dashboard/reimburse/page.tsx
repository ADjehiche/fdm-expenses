"use server";

import { getCurrentUser } from "@/actions/loginauth";
import {
  getApprovedClaims,
  reimburseClaimAction,
} from "@/actions/claimActions";
import ReimburseClaimsReview from "./ReimburseClaimsReview";
import { redirect } from "next/navigation";
import { User } from "@/backend/user";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { EmployeeType } from "@/backend/employee/utils";
import { SerializedClaim } from "@/backend/serializedTypes";

// Create properly marked server actions for passing to client components
async function approveAction(id: string) {
  "use server";
  return reimburseClaimAction(parseInt(id));
}

async function rejectAction(id: string, feedback: string) {
  "use server";
  // return rejectClaimAction(parseInt(id), feedback);
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
  if (user.getEmployeeRole().getType() !== EmployeeType.PayrollOfficer) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  // Get claims that have been approved and need reimbursement
  const claims = await getApprovedClaims(user);

  // Convert the claims to SerializedClaim format expected by the component
  const serializedClaims: SerializedClaim[] = claims.map((claim) => ({
    id: claim.getId().toString(),
    employeeId: claim.getEmployeeId(),
    amount: claim.getAmount(),
    status: claim.getStatus(),
    title: claim.getTitle(),
    description: claim.getDescription(),
    category: claim.getCategory(),
    currency: claim.getCurrency(),
    createdAt: claim.getCreatedAt().toISOString(),
    lastUpdated: claim.getLastUpdated().toISOString(),
    attemptCount: claim.getAttemptCount(),
    feedback: claim.getFeedback(),
  }));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Reimburse Claims</h1>
      <ReimburseClaimsReview
        claims={serializedClaims}
        approveClaimAction={approveAction}
      />
    </div>
  );
}

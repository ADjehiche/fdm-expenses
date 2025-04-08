"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { ClaimStatus } from "@/backend/claims/claim";
import ClaimViewClient from "./ClaimViewClient";

/**
 * This page is responsible for fetching and displaying a single claim
 * It will check if the user is authorized to view the claim
 */
export default async function ClaimViewPage({
  params,
}: {
  params: { id: string };
}) {
  // Get current user
  const user = await getCurrentUser();

  if (!user || !user.id) {
    console.error("User not authenticated or missing ID");
    redirect("/login");
  }

  const employeeId = parseInt(user.id);
  const claimId = parseInt(params.id);

  if (isNaN(claimId)) {
    redirect("/dashboard/claims"); // Redirect if ID is invalid
  }

  try {
    // Get database instance
    const db = DatabaseManager.getInstance();

    // Get the user to determine their role
    const userAccount = await db.getAccount(employeeId);
    if (!userAccount) {
      redirect("/login"); // Redirect if user account not found
    }

    // Get their role for permission checking
    const employeeRole = userAccount.getEmployeeRole();
    const userRole = employeeRole ? employeeRole.getType() : null;

    // Fetch the claim
    const claim = await db.getClaim(claimId);

    if (!claim) {
      redirect("/dashboard/claims"); // Redirect if claim not found
    }

    // Security check - ensure the user can view this claim
    // Either they own it or they are a line manager/admin who has access
    const canView =
      claim.getEmployeeId() === employeeId ||
      (userRole &&
        ["Line Manager", "Administrator", "Payroll Officer"].includes(
          userRole
        ));

    if (!canView) {
      redirect("/dashboard/claims"); // Redirect if not authorized
    }

    // Check if this is the user's own claim
    const isOwnClaim = claim.getEmployeeId() === employeeId;

    // Get the employee details (claim submitter)
    const employee = await db.getAccount(claim.getEmployeeId());
    const employeeInfo = employee
      ? {
          id: employee.getId(),
          name: `${employee.getFirstName()} ${employee.getFamilyName()}`,
          email: employee.getEmail(),
        }
      : null;

    // Format evidence files
    const evidenceFiles = claim.getAllEvidence().map((filename) => ({
      name: filename,
      url: `/api/claims/${claimId}/evidence/${encodeURIComponent(filename)}`,
    }));

    // Get bank details if present
    const bankInfo = {
      accountName: claim.getAccountName(),
      accountNumber: claim.getAccountNumber(),
      sortCode: claim.getSortCode(),
    };

    // Format the claim data for the client component
    const claimData = {
      id: claim.getId(),
      title: claim.getTitle(),
      description: claim.getDescription(),
      category: claim.getCategory(),
      amount: claim.getAmount(),
      currency: claim.getCurrency(),
      status: claim.getStatus(),
      feedback: claim.getFeedback(),
      attemptCount: claim.getAttemptCount(),
      createdAt: claim.getCreatedAt().toISOString(),
      lastUpdated: claim.getLastUpdated().toISOString(),
      evidence: evidenceFiles,
      bankInfo: bankInfo,
      employee: employeeInfo,
    };

    return (
      <ClaimViewClient
        claim={claimData}
        userRole={userRole}
        isOwnClaim={isOwnClaim}
      />
    );
  } catch (error) {
    console.error("Error fetching claim:", error);
    redirect("/dashboard/claims");
  }
}

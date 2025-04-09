"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { SerializedClaim } from "@/backend/serializedTypes";
import { ClaimStatus } from "@/backend/claims/claim";
import EditClaimForm from "./EditClaimForm";

export default async function EditClaimPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    console.error("User not authenticated or missing ID");
    redirect("/login");
  }

  const claimId = parseInt(params.id);
  if (isNaN(claimId)) {
    redirect("/dashboard/claims");
  }

  const db = DatabaseManager.getInstance();
  const claim = await db.getClaim(claimId);

  if (!claim) {
    redirect("/dashboard/claims");
  }

  if (claim.getEmployeeId() !== parseInt(user.id)) {
    redirect("/dashboard/claims");
  }

  // Check if the claim is in Draft or Rejected status
  // Only these statuses can be edited
  if (
    claim.getStatus() !== ClaimStatus.DRAFT &&
    claim.getStatus() !== ClaimStatus.REJECTED
  ) {
    console.error(
      "Claim cannot be edited because it's not in Draft or Rejected status"
    );
    redirect("/dashboard/claims/view/" + claimId); // Redirect to view page instead
  }

  // Format evidence files for the client component
  const evidenceFiles = claim.getAllEvidence().map((filename) => ({
    name: filename,
    url: `/api/claims/${claimId}/evidence/${encodeURIComponent(filename)}`,
  }));

  const serializedClaim: SerializedClaim = {
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
    evidence: evidenceFiles, // Add evidence files to the serialized claim
  };

  return <EditClaimForm claim={serializedClaim} />;
}

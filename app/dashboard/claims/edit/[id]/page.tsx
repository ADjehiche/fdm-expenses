"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { SerializedClaim } from "@/backend/serializedTypes";
import EditClaimForm from "./EditClaimForm";
/**
 * This page is responsible for fetching the claim data for editing
 * It will check if the user is authorized to edit the claim
 */
export default async function EditClaimPage({
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

  const claimId = parseInt(params.id);
  if (isNaN(claimId)) {
    redirect("/dashboard/claims"); // Redirect if ID is invalid
  }

  // Get the claim from database
  const db = DatabaseManager.getInstance();
  const claim = await db.getClaim(claimId);

  if (!claim) {
    redirect("/dashboard/claims"); // Redirect if claim not found
  }

  // Check if the user is authorized to edit this claim
  // Only the claim owner can edit it
  if (claim.getEmployeeId() !== parseInt(user.id)) {
    redirect("/dashboard/claims"); // Redirect if not authorized
  }

  // Convert the claim to a serialized format to pass to the client component
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
  };

  return <EditClaimForm claim={serializedClaim} />;
}

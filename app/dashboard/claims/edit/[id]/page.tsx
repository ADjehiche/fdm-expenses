"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { SerializedClaim } from "@/backend/serializedTypes";
import EditClaimForm from "./EditClaimForm";

// ✅ Explicitly declare a default export with the correct signature
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

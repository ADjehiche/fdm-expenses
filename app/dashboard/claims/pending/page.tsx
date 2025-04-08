import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
import { getPendingClaims } from "@/actions/claimActions";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { ClaimStatus } from "@/backend/claims/claim";
import PendingClaimsClient from "./PendingClaimsClient";

export default async function PendingClaimsPage() {
  // Get current user
  const user = await getCurrentUser();

  if (!user || !user.id) {
    console.error("User not authenticated or missing ID");
    redirect("/login");
  }

  // Fetch real draft claims from database
  const response = await getPendingClaims(parseInt(user.id));
  const pendingClaims = response.success ? response.claims || [] : [];

  return <PendingClaimsClient claims={pendingClaims} />;
}

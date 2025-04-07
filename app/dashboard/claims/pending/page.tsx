import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
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

  const userId = parseInt(user.id);
  const db = DatabaseManager.getInstance();

  // Get all claims for this user with status PENDING
  const pendingClaims = await db.getOwnClaimsByStatus(
    userId,
    ClaimStatus.PENDING
  );

  // Format the claims for the client component
  const formattedClaims =
    pendingClaims?.map((claim) => {
      // Parse the feedback which contains the metadata
      let title = "Expense Claim";
      let date = "";
      let category = "";

      try {
        const metadata = JSON.parse(claim.getFeedback());
        title = metadata.title || title;
        date = metadata.date || "";
        category = metadata.category || "";
      } catch (e) {
        // If feedback is not in JSON format, use it as the title
        title = claim.getFeedback() || title;
      }

      // Format the lastUpdated date as a string
      let lastUpdatedStr = "";
      try {
        const lastUpdated = claim.getLastUpdated();
        lastUpdatedStr =
          lastUpdated instanceof Date
            ? lastUpdated.toISOString()
            : new Date(lastUpdated).toISOString();
      } catch (e) {
        console.error("Error formatting lastUpdated date:", e);
        lastUpdatedStr = new Date().toISOString(); // Fallback to current date
      }

      return {
        id: claim.getId(),
        title,
        date,
        amount: claim.getAmount(),
        category,
        lastUpdated: lastUpdatedStr,
        attemptCount: claim.getAttemptCount(),
      };
    }) || [];

  return <PendingClaimsClient claims={formattedClaims} />;
}

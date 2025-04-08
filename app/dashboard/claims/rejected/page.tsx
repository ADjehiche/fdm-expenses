import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { ClaimStatus } from "@/backend/claims/claim";
import { getRejectedClaims } from "@/actions/claimActions";
import ApprovedClaimsClient from "./RejectedClaimsClient";

export default async function RejectedClaimsPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    console.error("User not authenticated or missing ID");
    redirect("/login");
  }

  // Fetch real draft claims from database
  const response = await getRejectedClaims(parseInt(user.id));
  const rejectedClaims = response.success ? response.claims || [] : [];

  // Pass the data to the client component
  return <ApprovedClaimsClient claims={rejectedClaims} />;
}

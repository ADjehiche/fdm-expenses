import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { ClaimStatus } from "@/backend/claims/claim";
import { getAcceptedClaims } from "@/actions/claimActions";
import ApprovedClaimsClient from "./ApprovedClaimsClient";

export default async function AcceptedClaimsPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    console.error("User not authenticated or missing ID");
    redirect("/login");
  }

  // Fetch real draft claims from database
  const response = await getAcceptedClaims(parseInt(user.id));
  const acceptedClaims = response.success ? response.claims || [] : [];

  // Pass the data to the client component
  return <ApprovedClaimsClient claims={acceptedClaims} />;
}

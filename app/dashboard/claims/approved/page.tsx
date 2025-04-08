import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
import { getAcceptedClaims, getReimbursedClaim } from "@/actions/claimActions";
import ApprovedClaimsClient from "./ApprovedClaimsClient";
import { ClaimStatus } from "@/backend/claims/claim";

export default async function AcceptedClaimsPage() {
  const user = await getCurrentUser();

  if (!user || !user.id) {
    console.error("User not authenticated or missing ID");
    redirect("/login");
  }

  // Fetch real draft claims from database
  const responseAccepted = await getAcceptedClaims(parseInt(user.id));
  const acceptedClaims = responseAccepted.success
    ? responseAccepted.claims?.map((claim) => ({
        ...claim,
        status: "ACCEPTED" as const,
      })) || []
    : [];

  const responseReimbursed = await getReimbursedClaim(parseInt(user.id));
  const reimbursedClaims = responseReimbursed.success
    ? responseReimbursed.claims?.map((claim) => ({
        ...claim,
        status: "REIMBURSED" as const,
      })) || []
    : [];

  const claims = [...acceptedClaims, ...reimbursedClaims];
  return <ApprovedClaimsClient claims={claims} />;
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/loginauth";
import { getDraftClaims } from "@/actions/claimActions";
import DraftClaimsClient from "./DraftClaimsClient";

export default async function DraftClaimsPage() {
  // Get current user
  const user = await getCurrentUser();

  if (!user || !user.id) {
    console.error("User not authenticated or missing ID");
    redirect("/login");
  }

  // Fetch real draft claims from database
  const response = await getDraftClaims(parseInt(user.id));
  const draftClaims = response.success ? response.claims || [] : [];

  // Pass the data to the client component
  return <DraftClaimsClient claims={draftClaims} />;
}

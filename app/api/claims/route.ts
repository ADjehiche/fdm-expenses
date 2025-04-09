import { NextRequest, NextResponse } from "next/server";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { ClaimStatus } from "@/backend/claims/claim";
import { cookies } from "next/headers";

async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const userId = cookieStore.get("user_id")?.value;

  if (!userId) {
    return null;
  }

  const dbManager = DatabaseManager.getInstance();
  return await dbManager.getAccount(parseInt(userId));
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbManager = DatabaseManager.getInstance();
  // Get all claims for the user
  const draftClaims = await dbManager.getOwnClaimsByStatus(
    user.getId(),
    ClaimStatus.DRAFT
  );
  const pendingClaims = await dbManager.getOwnClaimsByStatus(
    user.getId(),
    ClaimStatus.PENDING
  );
  const acceptedClaims = await dbManager.getOwnClaimsByStatus(
    user.getId(),
    ClaimStatus.ACCEPTED
  );
  const rejectedClaims = await dbManager.getOwnClaimsByStatus(
    user.getId(),
    ClaimStatus.REJECTED
  );
  const reimbursedClaims = await dbManager.getOwnClaimsByStatus(
    user.getId(),
    ClaimStatus.REIMBURSED
  );

  const allClaims = [
    ...draftClaims,
    ...pendingClaims,
    ...acceptedClaims,
    ...rejectedClaims,
    ...reimbursedClaims,
  ];

  return NextResponse.json({
    claims: allClaims.map((claim) => ({
      id: claim.getId(),
      amount: claim.getAmount(),
      description: claim.getDescription(),
      title: claim.getTitle(),
      category: claim.getCategory(),
      status: claim.getStatus(),
      createdAt: claim.getCreatedAt(),
      lastUpdated: claim.getLastUpdated(),
    })),
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { amount, description, title, category, currency } =
    await request.json();

  const employeeRole = user.getEmployeeRole();
  const newClaim = await employeeRole.createDraftClaim({
    title,
    description,
    category,
    currency,
    amount,
  });

  if (!newClaim) {
    return NextResponse.json(
      { error: "Failed to create claim" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    claim: {
      id: newClaim.getId(),
      amount: newClaim.getAmount(),
      description: newClaim.getDescription(),
      title: newClaim.getTitle(),
      category: newClaim.getCategory(),
      status: newClaim.getStatus(),
      createdAt: newClaim.getCreatedAt(),
      lastUpdated: newClaim.getLastUpdated(),
    },
  });
}

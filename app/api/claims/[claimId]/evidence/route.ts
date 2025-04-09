import { NextRequest, NextResponse } from "next/server";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { getCurrentUser } from "@/actions/loginauth";
import { ClaimStatus } from "@/backend/claims/claim";

/**
 * API route for managing evidence files for claims
 *
 * DELETE: Remove evidence from a claim
 * POST: Add new evidence to a claim
 */

// Handle evidence file uploads
export async function POST(
  request: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    // Authenticate the user
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(user.id);
    const claimId = parseInt(params.claimId);

    if (isNaN(claimId)) {
      return NextResponse.json({ error: "Invalid claim ID" }, { status: 400 });
    }

    // Get database instance and claim
    const db = DatabaseManager.getInstance();
    const claim = await db.getClaim(claimId);

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Verify ownership of the claim
    if (claim.getEmployeeId() !== userId) {
      return NextResponse.json(
        { error: "You don't own this claim" },
        { status: 403 }
      );
    }

    // Verify claim status is appropriate for editing (can only edit Draft or Rejected claims)
    if (
      claim.getStatus() !== ClaimStatus.DRAFT &&
      claim.getStatus() !== ClaimStatus.REJECTED
    ) {
      return NextResponse.json(
        { error: "Can only add evidence to Draft or Rejected claims" },
        { status: 400 }
      );
    }

    // Process the multipart form data to get the file
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Add the evidence file to the claim
    const success = await claim.addEvidence(file);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to add evidence file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Evidence file added successfully",
      filename: file.name,
    });
  } catch (error) {
    console.error("Error adding evidence file:", error);
    return NextResponse.json(
      { error: "Failed to add evidence file" },
      { status: 500 }
    );
  }
}

// Handle evidence deletion
export async function DELETE(
  request: NextRequest,
  { params }: { params: { claimId: string } }
) {
  try {
    // Authenticate the user
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(user.id);
    const claimId = parseInt(params.claimId);

    // The filename is passed as a query parameter
    const searchParams = request.nextUrl.searchParams;
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json(
        { error: "No filename provided" },
        { status: 400 }
      );
    }

    if (isNaN(claimId)) {
      return NextResponse.json({ error: "Invalid claim ID" }, { status: 400 });
    }

    // Get database instance and claim
    const db = DatabaseManager.getInstance();
    const claim = await db.getClaim(claimId);

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Verify ownership of the claim
    if (claim.getEmployeeId() !== userId) {
      return NextResponse.json(
        { error: "You don't own this claim" },
        { status: 403 }
      );
    }

    // Verify claim status is appropriate for editing
    if (
      claim.getStatus() !== ClaimStatus.DRAFT &&
      claim.getStatus() !== ClaimStatus.REJECTED
    ) {
      return NextResponse.json(
        { error: "Can only delete evidence from Draft or Rejected claims" },
        { status: 400 }
      );
    }

    // Remove the evidence file
    const success = await claim.removeEvidence(filename);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete evidence file" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Evidence file deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting evidence file:", error);
    return NextResponse.json(
      { error: "Failed to delete evidence file" },
      { status: 500 }
    );
  }
}

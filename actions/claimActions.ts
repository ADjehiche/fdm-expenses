"use server";

import { DatabaseManager } from "@/backend/db/databaseManager";
import { Claim, ClaimStatus } from "@/backend/claims/claim";

/**
 * Server action to create a new claim and save it to the database
 * This handles all the file system operations on the server
 */
export async function createClaim(data: {
  employeeId: number;
  amount: number;
  metadata: string;
}): Promise<{ success: boolean; claimId?: number; error?: string }> {
  try {
    // Create a new claim object
    const now = new Date();
    const claim = new Claim({
      id: -1, // Will be assigned by the database
      createdAt: now,
      lastUpdated: now,
      amount: data.amount,
      employeeId: data.employeeId,
      attemptCount: 0,
      status: ClaimStatus.DRAFT,
      evidence: [], // Will add evidence files after claim is created
      feedback: data.metadata,
      accountName: null,
      accountNumber: null,
      sortCode: null,
    });

    // Save the claim to the database
    const db = DatabaseManager.getInstance();
    const savedClaim = await db.addClaim(claim);

    if (!savedClaim) {
      return { success: false, error: "Failed to save claim" };
    }

    return { success: true, claimId: savedClaim.getId() };
  } catch (error) {
    console.error("Error saving claim:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server action to add evidence to an existing claim
 * This handles file system operations on the server side
 */
export async function addEvidenceToClaimServer(
  claimId: number,
  file: File
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const db = DatabaseManager.getInstance();
    const claim = await db.getClaim(claimId);

    if (!claim) {
      return { success: false, error: "Claim not found" };
    }

    const result = await claim.addEvidence(file);

    if (!result) {
      return { success: false, error: "Failed to add evidence to claim" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error adding evidence:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

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

/**
 * Server action to get all draft claims for a specific employee
 */
export async function getDraftClaims(employeeId: number): Promise<{
  success: boolean;
  claims?: Array<{
    id: number;
    title: string;
    date: string;
    amount: number;
    category: string;
    lastUpdated: string; // Changed from Date to string to ensure safe serialization
  }>;
  error?: string;
}> {
  try {
    // Get database instance
    const db = DatabaseManager.getInstance();

    // Fetch draft claims for this employee
    const claims = await db.getOwnClaimsByStatus(employeeId, ClaimStatus.DRAFT);

    if (!claims) {
      return { success: true, claims: [] };
    }

    // Transform the claims to the format needed by the UI
    const formattedClaims = claims.map((claim) => {
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

      // Format the lastUpdated date as an ISO string to ensure safe serialization
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
      };
    });

    return { success: true, claims: formattedClaims };
  } catch (error) {
    console.error("Error fetching draft claims:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

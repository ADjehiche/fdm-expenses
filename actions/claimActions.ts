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

/**
 * Server action to update a claim's status from Draft to Pending
 */
export async function submitDraftClaim(claimId: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const db = DatabaseManager.getInstance();
    const claim = await db.getClaim(claimId);

    if (!claim) {
      return { success: false, error: "Claim not found" };
    }

    if (claim.getStatus() !== ClaimStatus.DRAFT) {
      return {
        success: false,
        error: "Only draft claims can be submitted",
      };
    }

    // Update the attempt count
    const newAttemptCount = claim.getAttemptCount() + 1;
    await db.updateClaimAttemptCount(claimId, newAttemptCount);

    // Update the claim status to PENDING
    const result = await db.updateClaimStatus(claimId, ClaimStatus.PENDING);

    if (!result) {
      return { success: false, error: "Failed to update claim status" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error submitting claim:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server action to get all pending claims for a specific employee
 */
export async function getPendingClaims(employeeId: number): Promise<{
  success: boolean;
  claims?: Array<{
    id: number;
    title: string;
    date: string;
    amount: number;
    category: string;
    lastUpdated: string;
    attemptCount: number;
  }>;
  error?: string;
}> {
  try {
    // Get database instance
    const db = DatabaseManager.getInstance();

    // Fetch pending claims for this employee
    const claims = await db.getOwnClaimsByStatus(
      employeeId,
      ClaimStatus.PENDING
    );

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
        attemptCount: claim.getAttemptCount(),
      };
    });

    return { success: true, claims: formattedClaims };
  } catch (error) {
    console.error("Error fetching pending claims:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Server action to get recent claims (across all statuses) for a specific employee
 */
export async function getRecentClaims(employeeId: number): Promise<{
  success: boolean;
  claims?: Array<{
    id: number;
    title: string;
    date: string;
    amount: number;
    category: string;
    lastUpdated: string;
    status: ClaimStatus;
  }>;
  error?: string;
}> {
  try {
    // Get database instance
    const db = DatabaseManager.getInstance();

    // We need to get claims from all statuses, so we'll fetch them individually and combine
    const draftClaims =
      (await db.getOwnClaimsByStatus(employeeId, ClaimStatus.DRAFT)) || [];
    const pendingClaims =
      (await db.getOwnClaimsByStatus(employeeId, ClaimStatus.PENDING)) || [];
    const acceptedClaims =
      (await db.getOwnClaimsByStatus(employeeId, ClaimStatus.ACCEPTED)) || [];
    const rejectedClaims =
      (await db.getOwnClaimsByStatus(employeeId, ClaimStatus.REJECTED)) || [];
    const reimbursedClaims =
      (await db.getOwnClaimsByStatus(employeeId, ClaimStatus.REIMBURSED)) || [];

    // Combine all claims
    const allClaims = [
      ...draftClaims,
      ...pendingClaims,
      ...acceptedClaims,
      ...rejectedClaims,
      ...reimbursedClaims,
    ];

    if (allClaims.length === 0) {
      return { success: true, claims: [] };
    }

    // Sort claims by last updated date (most recent first)
    const sortedClaims = [...allClaims].sort((a, b) => {
      const dateA = new Date(a.getLastUpdated()).getTime();
      const dateB = new Date(b.getLastUpdated()).getTime();
      return dateB - dateA;
    });

    // Take only the most recent claims (up to 5)
    const recentClaims = sortedClaims.slice(0, 5);

    // Transform the claims to the format needed by the UI
    const formattedClaims = recentClaims.map((claim) => {
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
        status: claim.getStatus(),
      };
    });

    return { success: true, claims: formattedClaims };
  } catch (error) {
    console.error("Error fetching recent claims:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

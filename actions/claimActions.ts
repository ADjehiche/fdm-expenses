"use server";

import { DatabaseManager } from "@/backend/db/databaseManager";
import { Claim, ClaimStatus } from "@/backend/claims/claim";
import { EmployeeType } from "@/backend/employee/employeeRole";
import { get } from "http";

/**
 * Server action to create a new claim and save it to the database
 * This handles all the file system operations on the server
 */
export async function createClaim(data: {
  employeeId: number;
  amount: number;
  title: string;
  description: string;
  category: string;
  currency: string;
}): Promise<{ success: boolean; claimId?: number; error?: string }> {
  try {
    // Create a new claim object
    const now = new Date();
    const claim = new Claim({
      id: -1, // Will be assigned by the database
      employeeId: data.employeeId,
      amount: data.amount,
      attemptCount: 0,
      status: ClaimStatus.DRAFT,
      evidence: [], // Will add evidence files after claim is created
      feedback: "", // No longer storing metadata here, using an empty string

      accountName: null,
      accountNumber: null,
      sortCode: null,

      title: data.title,
      description: data.description,
      category: data.category,
      currency: data.currency,

      createdAt: now,
      lastUpdated: now,
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
      // Use direct column values instead of parsing from feedback
      const title = claim.getTitle() || "Expense Claim";
      const category = claim.getCategory() || "";
      // For date, we'll use createdAt formatted as a string
      const date = new Date(claim.getCreatedAt()).toLocaleDateString();

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

export async function getAcceptedClaims(employeeId: number): Promise<{
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
    const claims = await db.getOwnClaimsByStatus(
      employeeId,
      ClaimStatus.ACCEPTED
    );

    if (!claims) {
      return { success: true, claims: [] };
    }

    // Transform the claims to the format needed by the UI
    const formattedClaims = claims.map((claim) => {
      // Use direct column values instead of parsing from feedback
      const title = claim.getTitle() || "Expense Claim";
      const category = claim.getCategory() || "";
      // For date, we'll use createdAt formatted as a string
      const date = new Date(claim.getCreatedAt()).toLocaleDateString();

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

export async function getRejectedClaims(employeeId: number): Promise<{
  success: boolean;
  claims?: Array<{
    id: number;
    title: string;
    date: string;
    amount: number;
    feedback: string;
    category: string;
    lastUpdated: string;
  }>;
  error?: string;
}> {
  try {
    // Get database instance
    const db = DatabaseManager.getInstance();

    // Fetch draft claims for this employee
    const claims = await db.getOwnClaimsByStatus(
      employeeId,
      ClaimStatus.REJECTED
    );

    if (!claims) {
      return { success: true, claims: [] };
    }

    // Transform the claims to the format needed by the UI
    const formattedClaims = claims.map((claim) => {
      // Use direct column values instead of parsing from feedback
      const title = claim.getTitle() || "Expense Claim";
      const category = claim.getCategory() || "";
      // For date, we'll use createdAt formatted as a string
      const date = new Date(claim.getCreatedAt()).toLocaleDateString();

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
        feedback: claim.getFeedback() || "",
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
      // Use direct column values instead of parsing from feedback
      const title = claim.getTitle() || "Expense Claim";
      const category = claim.getCategory() || "";
      // For date, we'll use createdAt formatted as a string
      const date = new Date(claim.getCreatedAt()).toLocaleDateString();

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
      // Use direct column values instead of parsing from feedback
      const title = claim.getTitle() || "Expense Claim";
      const category = claim.getCategory() || "";
      // For date, we'll use createdAt formatted as a string
      const date = new Date(claim.getCreatedAt()).toLocaleDateString();

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

/**
 * Server action to get all submitted (pending) claims for a line manager to review
 */
export async function getSubmittedClaims(user: any): Promise<Array<Claim>> {
  try {
    if (!user || !user.getEmployeeRole) {
      console.error("No authenticated user found or invalid user object");
      return [];
    }

    const employeeRole = user.getEmployeeRole();
    if (!employeeRole || employeeRole.getType() !== EmployeeType.LineManager) {
      console.error(
        "User is not a line manager or invalid line manager object"
      );
      return [];
    }

    // Use the correct method to get claims submitted by employees for this line manager
    const pendingClaims = await employeeRole.getEmployeeSubmittedClaims();
    return pendingClaims || [];
  } catch (error) {
    console.error("Error fetching submitted claims:", error);
    return [];
  }
}

/**
 * Server action to get all approved (accepted) claims for a payroll officer to review and reimburse
 */
export async function getApprovedClaims(user: any): Promise<Array<Claim>> {
  try {
    if (!user || !user.getEmployeeRole) {
      console.error("No authenticated user found or invalid user object");
      return [];
    }

    const employeeRole = user.getEmployeeRole();
    if (
      !employeeRole ||
      employeeRole.getType() !== EmployeeType.PayrollOfficer
    ) {
      console.error(
        "User is not a payroll officer or an invalid payroll officer object"
      );
      return [];
    }

    // Get database instance
    const db = DatabaseManager.getInstance();

    // Get all claims with ACCEPTED status
    const acceptedClaims = await db.getAllAcceptedClaims();
    return acceptedClaims || [];
  } catch (error) {
    console.error("Error fetching approved claims:", error);
    return [];
  }
}

/**
 * Server action to approve a claim
 */
export async function approveClaimAction(claimId: number): Promise<boolean> {
  try {
    const db = DatabaseManager.getInstance();
    const claim = await db.getClaim(claimId);

    if (!claim) {
      console.error("Claim not found");
      return false;
    }

    // Update the claim status to ACCEPTED
    const result = await db.updateClaimStatus(claimId, ClaimStatus.ACCEPTED);

    if (!result) {
      console.error("Failed to approve claim");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error approving claim:", error);
    return false;
  }
}

/**
 * Server action to reimburse a claim
 */
export async function reimburseClaimAction(claimId: number): Promise<boolean> {
  try {
    const db = DatabaseManager.getInstance();
    const claim = await db.getClaim(claimId);

    if (!claim) {
      console.error("Claim not found");
      return false;
    }

    // Check that the claim is in ACCEPTED status
    if (claim.getStatus() !== ClaimStatus.ACCEPTED) {
      console.error("Only accepted claims can be reimbursed");
      return false;
    }

    // Update the claim status to REIMBURSED
    const result = await db.updateClaimStatus(claimId, ClaimStatus.REIMBURSED);

    if (!result) {
      console.error("Failed to reimburse claim");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error reimbursing claim:", error);
    return false;
  }
}

/**
 * Server action to reject a claim with feedback
 */
export async function rejectClaimAction(
  claimId: number,
  feedback: string
): Promise<boolean> {
  try {
    if (!feedback || feedback.trim() === "") {
      console.error("Feedback is required when rejecting a claim");
      return false;
    }

    const db = DatabaseManager.getInstance();
    const claim = await db.getClaim(claimId);

    if (!claim) {
      console.error("Claim not found");
      return false;
    }

    // Set feedback
    await db.updateClaimFeedback(claimId, feedback);

    // Update the claim status to REJECTED
    const result = await db.updateClaimStatus(claimId, ClaimStatus.REJECTED);

    if (!result) {
      console.error("Failed to reject claim");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error rejecting claim:", error);
    return false;
  }
}

/**
 * Server action to update an existing claim
 */
export async function updateClaim(data: {
  claimId: number;
  employeeId: number;
  amount: number;
  title: string;
  description: string;
  category: string;
  currency: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Get database instance
    const db = DatabaseManager.getInstance();

    // Get the existing claim
    const claim = await db.getClaim(data.claimId);

    if (!claim) {
      return { success: false, error: "Claim not found" };
    }

    // Check if the user is authorized to update this claim
    if (claim.getEmployeeId() !== data.employeeId) {
      return {
        success: false,
        error: "You are not authorized to update this claim",
      };
    }

    // Update the claim details
    await db.updateClaimDetails(
      data.claimId,
      data.title,
      data.description,
      data.amount,
      data.category,
      data.currency
    );

    // Update the lastUpdated timestamp
    const timestampResult = await db.updateClaimLastUpdated(data.claimId);

    if (!timestampResult) {
      console.warn("Failed to update timestamp for claim:", data.claimId);
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating claim:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

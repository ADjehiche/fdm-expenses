// Types
export type ClaimStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "paid";

export interface Claim {
  id: string;
  title: string;
  date: string;
  amount: string;
  category: string;
  status: ClaimStatus;
  lastUpdated?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}

// Helper function to get base URL
function getBaseUrl() {
  if (typeof window !== "undefined") {
    // Browser environment
    return window.location.origin;
  }
  // Server environment - we need absolute URLs for server components
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";
}

// API functions
export async function fetchClaimCounts(): Promise<{
  drafts: number;
  pending: number;
  approved: number;
  rejected: number;
}> {
  try {
    // For server components, use the node-fetch compatible API with absolute URLs
    const response = await fetch(`${getBaseUrl()}/api/stats`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch claim counts: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching claim counts:", error);
    // Return fallback data if API call fails
    return {
      drafts: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
    };
  }
}

export async function fetchRecentClaims(limit = 5): Promise<Claim[]> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/claims?limit=${limit}`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch recent claims: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recent claims:", error);
    return [];
  }
}

export async function fetchPendingClaims(limit = 5): Promise<Claim[]> {
  try {
    const response = await fetch(
      `${getBaseUrl()}/api/claims?status=pending&limit=${limit}`,
      {
        cache: "no-store",
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch pending claims: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching pending claims:", error);
    return [];
  }
}

export async function fetchClaimsByStatus(
  status: ClaimStatus,
  limit?: number
): Promise<Claim[]> {
  try {
    const url = new URL("/api/claims", getBaseUrl());
    url.searchParams.append("status", status);
    if (limit) {
      url.searchParams.append("limit", limit.toString());
    }

    const response = await fetch(url.toString(), {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${status} claims: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${status} claims:`, error);
    return [];
  }
}

export async function createClaim(
  claimData: Omit<Claim, "id" | "date" | "status" | "lastUpdated">
): Promise<Claim> {
  try {
    const response = await fetch(`${getBaseUrl()}/api/claims`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(claimData),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Unknown error" }));
      throw new Error(
        errorData.error ||
          `Failed to create claim: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating claim:", error);
    throw error;
  }
}

import type { Claim, ClaimStatus } from "./api";

// Mock database
const mockClaims: Claim[] = [
  {
    id: "1",
    title: "Client Meeting Lunch",
    date: "Mar 15, 2025",
    amount: "£45.00",
    category: "Meals & Entertainment",
    status: "approved",
    lastUpdated: "2 days ago",
  },
  {
    id: "2",
    title: "Office Supplies",
    date: "Mar 10, 2025",
    amount: "£120.75",
    category: "Office Supplies",
    status: "approved",
    lastUpdated: "1 week ago",
  },
  {
    id: "3",
    title: "Conference Registration",
    date: "Mar 5, 2025",
    amount: "£350.00",
    category: "Training & Development",
    status: "pending",
    lastUpdated: "3 days ago",
  },
  {
    id: "4",
    title: "Travel Expenses",
    date: "Feb 28, 2025",
    amount: "£215.50",
    category: "Travel",
    status: "rejected",
    lastUpdated: "5 days ago",
  },
  {
    id: "5",
    title: "Software Subscription",
    date: "Feb 20, 2025",
    amount: "£89.99",
    category: "Software & Subscriptions",
    status: "approved",
    lastUpdated: "1 day ago",
  },
  {
    id: "6",
    title: "Client Dinner",
    date: "Mar 2, 2025",
    amount: "£125.30",
    category: "Meals & Entertainment",
    status: "pending",
    lastUpdated: "4 days ago",
  },
  {
    id: "7",
    title: "Training Course",
    date: "Mar 8, 2025",
    amount: "£199.99",
    category: "Training & Development",
    status: "draft",
    lastUpdated: "1 day ago",
  },
  {
    id: "8",
    title: "Business Cards",
    date: "Mar 12, 2025",
    amount: "£35.00",
    category: "Office Supplies",
    status: "draft",
    lastUpdated: "3 days ago",
  },
  {
    id: "9",
    title: "Team Building Event",
    date: "Mar 18, 2025",
    amount: "£250.00",
    category: "Team Events",
    status: "draft",
    lastUpdated: "Yesterday",
  },
];

// Mock functions that return data directly (no API calls)
export function getClaimCounts() {
  const counts = {
    drafts: mockClaims.filter((claim) => claim.status === "draft").length,
    pending: mockClaims.filter((claim) => claim.status === "pending").length,
    approved: mockClaims.filter((claim) => claim.status === "approved").length,
    rejected: mockClaims.filter((claim) => claim.status === "rejected").length,
  };

  return counts;
}

export function getRecentClaims(limit = 5) {
  return mockClaims.slice(0, limit);
}

export function getPendingClaims(limit = 5) {
  return mockClaims
    .filter((claim) => claim.status === "pending")
    .slice(0, limit);
}

export function getClaimsByStatus(status: ClaimStatus, limit?: number) {
  const filtered = mockClaims.filter((claim) => claim.status === status);
  return limit ? filtered.slice(0, limit) : filtered;
}

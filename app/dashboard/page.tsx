"use client";
import { useEffect, useState } from "react";
import type React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  ArrowRight,
  AlertTriangle,
  FileIcon,
} from "lucide-react";
import { type ClaimStatus } from "@/lib/api";
import {
  getPendingClaims,
  getRecentClaims,
  getDraftClaims,
} from "@/actions/claimActions";

import { useUser } from "@/app/contexts/UserContext";

export default function dashboardPage() {
  const { user, loading } = useUser();
  const [counts, setCounts] = useState({
    drafts: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [pendingClaims, setPendingClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user || !user.id) return;

      setIsLoading(true);

      const userId = parseInt(user.id);

      // Fetch real data from the server
      const recentResponse = await getRecentClaims(userId);
      if (recentResponse.success) {
        setRecentClaims(recentResponse.claims || []);
      }

      const pendingResponse = await getPendingClaims(userId);
      if (pendingResponse.success) {
        setPendingClaims(pendingResponse.claims || []);
      }

      const draftResponse = await getDraftClaims(userId);
      const draftCount = draftResponse.success
        ? (draftResponse.claims || []).length
        : 0;
      const pendingCount = pendingResponse.success
        ? (pendingResponse.claims || []).length
        : 0;

      // For now, we'll use dummy counts for approved and rejected until those endpoints are added
      setCounts({
        drafts: draftCount,
        pending: pendingCount,
        approved: 0,
        rejected: 0,
      });

      setIsLoading(false);
    }

    if (user && user.id) {
      fetchData();
    }
  }, [user]);

  if (loading || isLoading) return <div className="text-white">Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild className="bg-[#c3fa04] hover:bg-[#c3fa04]/90">
          <Link href="/dashboard/claims/new">
            <Plus className="mr-2 h-4 2-4" />
            New Expense Claim
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Draft Claims"
          value={counts.drafts.toString()}
          description="Claims in progress"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          href="/dashboard/claims/drafts"
        />
        <StatsCard
          title="Pending Claims"
          value={counts.pending.toString()}
          description="Awaiting Approval"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          href="/dashboard/claims/pending"
        />
        <StatsCard
          title="Approved Claims"
          value={counts.approved.toString()}
          description="Ready for payment"
          icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
          href="/dashboard/claims/approved"
        />
        <StatsCard
          title="Rejected Claims"
          value={counts.rejected.toString()}
          description="Requires Attention"
          icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
          href="/dashboard/claims/rejected"
        />
      </div>

      <Tabs defaultValue="recent">
        <TabsList className="bg-gray-100 border border-gray-200 rounded-md p-1">
          <TabsTrigger value="recent">Recent Claims</TabsTrigger>
          <TabsTrigger value="pending">Pending Claims</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card className="border border-gray-200 border-solid">
            <CardHeader className="pb-2">
              <CardTitle>Recent Expense Claims</CardTitle>
              <CardDescription>
                Your most recently submitted expense claims
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentClaims.length > 0 ? (
                <div className="space-y-2">
                  {recentClaims.map((claim) => (
                    <ClaimItem
                      key={claim.id}
                      title={claim.title}
                      date={claim.date}
                      amount={formatAmount(claim.amount)}
                      status={claim.status}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
                  <h3 className="font-medium text-lg">
                    No recent claims found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any recent expense claims.
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4 bg-[#c3fa04]"
                asChild
              >
                <Link href="/dashboard/claims">
                  View all claims <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="space-y-4">
          <Card className="border border-gray-200 border-solid">
            <CardHeader className="pb-2">
              <CardTitle>Pending Expense Claims</CardTitle>
              <CardDescription>
                Claims awaiting approval from your manager
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingClaims.length > 0 ? (
                <div className="space-y-2">
                  {pendingClaims.map((claim) => (
                    <ClaimItem
                      key={claim.id}
                      title={claim.title}
                      date={claim.date}
                      amount={formatAmount(claim.amount)}
                      status="pending"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <FileIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">
                    No pending claims
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any expense claims waiting for approval.
                  </p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full mt-4 bg-[#c3fa04]"
                asChild
              >
                <Link href="/dashboard/claims/pending">
                  View all pending claims{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Function to format amount with currency symbol
function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

function StatsCard({ title, value, description, icon, href }: StatsCardProps) {
  return (
    <Card className="border border-gray-200 border-solid">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Button variant="link" className="px-0 mt-2" asChild>
          <Link href={href}>
            View details <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

interface ClaimItemProps {
  title: string;
  date: string;
  amount: string;
  status: ClaimStatus;
}
function ClaimItem({ title, date, amount, status }: ClaimItemProps) {
  // Map the ClaimStatus enum values to our display values
  const normalizedStatus = status.toLowerCase() as keyof typeof statusColors;

  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    rejected: "bg-red-100 text-red-800",
    accepted: "bg-green-100 text-green-800", // Changed from approved to accepted
    reimbursed: "bg-blue-100 text-blue-800", // Changed from paid to reimbursed
  };

  const statusLabels = {
    draft: "Draft",
    pending: "Pending",
    rejected: "Rejected",
    accepted: "Approved", // Using "Approved" as the display label for accepted status
    reimbursed: "Paid", // Using "Paid" as the display label for reimbursed status
  };

  // Handle cases where we might not have a matching status
  const statusColor =
    statusColors[normalizedStatus] || "bg-gray-100 text-gray-800";
  const statusLabel = statusLabels[normalizedStatus] || String(status);

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50">
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="font-medium">{amount}</span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

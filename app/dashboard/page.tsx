"use client";
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
} from "lucide-react";
import { type ClaimStatus } from "@/lib/api";
import {
  getClaimCounts,
  getRecentClaims,
  getPendingClaims,
} from "@/lib/mock-data";


import { useUser } from "@/app/contexts/UserContext";
export default function dashboardPage() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  const counts = getClaimCounts();
  const recentClaims = getRecentClaims();
  const pendingClaims = getPendingClaims();
  return (
    <div className="space-y-6 text-black">

      <Button asChild className="bg-[#c3fa04] hover:bg-[#c3fa04]/90">
        <Link href="/dashboard/admin">
          <Plus className="mr-2 h-4 2-4" />
          Administrator View
        </Link>
      </Button>
      
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
          title="Accepted Claims"
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

      <Tabs>
        <TabsList>
          <TabsTrigger value="recent">Recent Claims</TabsTrigger>
          <TabsTrigger value="pendig">Pending Claims</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card>
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
                      amount={claim.amount}
                      status={claim.status}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py -6 text-center">
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
      </Tabs>
    </div>
  );
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
    <Card>
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
  const statusColors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    paid: "bg-blue-100 text-blue-800",
  };

  const statusLabels = {
    draft: "Draft",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    paid: "Paid",
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-sm text-muted-foreground">{date}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="font-medium">{amount}</span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
        >
          {statusLabels[status]}
        </span>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/use-toast";

// Helper function for safe date formatting
function formatRelativeDate(dateString: string): string {
  try {
    // Only try to format if we have a string
    if (!dateString) return "Unknown";

    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) return "Unknown";

    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown";
  }
}

// Status Badge component to display claim status
function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;

  const getStatusStyles = () => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-none";
      case "REIMBURSED":
        return "bg-blue-100 text-blue-800 border-none";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "ACCEPTED":
        return "Accepted";
      case "REIMBURSED":
        return "Paid";
      default:
        return status;
    }
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}
    >
      {getStatusLabel()}
    </span>
  );
}

interface ApprovedClaimsProps {
  claims: Array<{
    id: number;
    title: string;
    date: string;
    amount: number;
    category: string;
    lastUpdated: string;
    status?: "ACCEPTED" | "REIMBURSED"; // Add status field
  }>;
}

export default function ApprovedClaimsClient({
  claims: initialClaims,
}: ApprovedClaimsProps) {
  const [claims] = useState(initialClaims);
  const { toast } = useToast();

  // Function to format amount with currency symbol
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  return (
    <div className="space-y-6 text-black">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Approved Claims</h1>
        <p className="text-muted-foreground">
          Your expense claims that have been approved by your manager
        </p>
      </div>

      <Card className="border-gray-200 border-solid border-2">
        <CardHeader className="pb-3">
          <CardTitle>Approved Expense Claims</CardTitle>
          <CardDescription>
            These claims have been approved by your manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          {claims.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.title}</TableCell>
                    <TableCell>{claim.date}</TableCell>
                    <TableCell>{claim.category}</TableCell>
                    <TableCell>{formatAmount(claim.amount)}</TableCell>
                    <TableCell>
                      {formatRelativeDate(claim.lastUpdated)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={claim.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          title="View"
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/dashboard/claims/view/${claim.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No approved claims</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any expense claims that have been approved
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

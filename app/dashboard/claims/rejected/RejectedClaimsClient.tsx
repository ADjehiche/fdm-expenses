"use client";

import Link from "next/link";
import { Edit, Send, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

import { submitDraftClaim } from "@/actions/claimActions";

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

interface RejectedClaimsProps {
  claims: Array<{
    id: number;
    title: string;
    date: string;
    amount: number;
    feedback: string;
    category: string;
    lastUpdated: string;
  }>;
}

export default function RejectedClaimsClient({
  claims: initialClaims,
}: RejectedClaimsProps) {
  const [claims, setClaims] = useState(initialClaims);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Function to format amount with currency symbol
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const handleSubmit = async (claimId: number) => {
    setSubmitting(claimId);
    try {
      const response = await submitDraftClaim(claimId);

      if (response.success) {
        toast({
          title: "Claim submitted successfully",
          description: "Your claim has been submitted for approval",
        });

        // Remove the submitted claim from the list
        setClaims(claims.filter((claim) => claim.id !== claimId));

        // Force a page refresh to update the data
        router.refresh();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to submit claim",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting claim:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6 text-black">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rejected Claims</h1>
        <p className="text-muted-foreground">
          Your expense claims that have been rejected by your manager
        </p>
      </div>

      <Card className="border-gray-200 border-solid border-2">
        <CardHeader className="pb-3">
          <CardTitle>Rejected Expense Claims</CardTitle>
          <CardDescription>
            These claims have been rejected by your manager
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
                  <TableHead>Feedback</TableHead>
                  <TableHead>Last Updated</TableHead>
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
                    <TableCell>{claim.feedback}</TableCell>
                    <TableCell>
                      {formatRelativeDate(claim.lastUpdated)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          title="Resubmit Claim"
                          variant="outline"
                          size="icon"
                          onClick={() => handleSubmit(claim.id)}
                          disabled={submitting === claim.id}
                          className="text-green-600 border-none bg-gray-50 cursor-pointer"
                        >
                          {submitting === claim.id ? (
                            <span className="flex items-center">
                              <svg
                                className="animate-spin h-4 w-4 text-green-600"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Send className="mr-2 h-4 w-4 cursor-pointer" />
                            </span>
                          )}
                        </Button>
                        <Button
                          title="Edit claim"
                          variant="ghost"
                          size="icon"
                          asChild
                        >
                          <Link href={`/dashboard/claims/edit/${claim.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          title="Delete claim"
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
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
              <h3 className="text-lg font-semibold mb-1">No rejected claims</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any expense claims that have been rejected
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

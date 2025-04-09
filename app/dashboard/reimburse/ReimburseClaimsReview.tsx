"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import { Send } from "lucide-react";
import { ClaimStatus } from "@/backend/claims/claim";
import { SerializedClaim } from "@/backend/serializedTypes";

interface PendingClaimsReviewProps {
  claims: SerializedClaim[];
  approveClaimAction: (id: string) => Promise<boolean>;
}

export default function ReimburseClaimsReview({
  claims,
  approveClaimAction,
}: PendingClaimsReviewProps) {
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Convert date string to formatted date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Format currency based on claim's currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const handleReimburse = async (claimId: string) => {
    setSubmitting(claimId);
    setIsLoading((prev) => ({ ...prev, [claimId]: true }));
    try {
      const result = await approveClaimAction(claimId);
      if (result) {
        toast({
          title: "Claim Reimbursed",
          description: "The claim has been successfully reimbursed.",
        });
        // Refresh page to update the claims list
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to reimburse the claim. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, [claimId]: false }));
    }
  };

  const handleFeedbackChange = (claimId: string, feedback: string) => {
    setFeedbackMap((prev) => ({
      ...prev,
      [claimId]: feedback,
    }));
  };
  return (
    <Card className="w-full border-2 border-gray-200 border-solid">
      <CardHeader>
        <CardTitle>Claims Pending Review</CardTitle>
      </CardHeader>
      <CardContent>
        {claims.length === 0 ? (
          <p className="text-center py-4">No approved claims to review</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.title}</TableCell>
                  <TableCell>{claim.employeeId}</TableCell>
                  <TableCell>{formatDate(claim.lastUpdated)}</TableCell>
                  <TableCell>
                    {formatCurrency(claim.amount, claim.currency || "GBP")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        claim.status === ClaimStatus.ACCEPTED
                          ? "bg-green-100 text-green-800"
                          : ""
                      }`}
                    >
                      {claim.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      title="Reimburse Claim"
                      variant="outline"
                      size="icon"
                      onClick={() => handleReimburse(claim.id)}
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

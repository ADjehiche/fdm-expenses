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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SerializedClaim, ClaimStatus } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";

interface PendingClaimsReviewProps {
  claims: SerializedClaim[];
  approveClaimAction: (id: string) => Promise<boolean>;
  rejectClaimAction: (id: string, feedback: string) => Promise<boolean>;
}

export default function PendingClaimsReview({
  claims,
  approveClaimAction,
  rejectClaimAction,
}: PendingClaimsReviewProps) {
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Convert date string to formatted date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleApprove = async (claimId: string) => {
    setIsLoading((prev) => ({ ...prev, [claimId]: true }));
    try {
      const result = await approveClaimAction(claimId);
      if (result) {
        toast({
          title: "Claim Approved",
          description: "The claim has been successfully approved.",
        });
        // Refresh page to update the claims list
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to approve the claim. Please try again.",
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

  const handleReject = async (claimId: string) => {
    const feedback = feedbackMap[claimId];
    if (!feedback || feedback.trim() === "") {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback when rejecting a claim.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading((prev) => ({ ...prev, [claimId]: true }));
    try {
      const result = await rejectClaimAction(claimId, feedback);
      if (result) {
        toast({
          title: "Claim Rejected",
          description: "The claim has been rejected with feedback.",
        });
        // Refresh page to update the claims list
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to reject the claim. Please try again.",
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Claims Pending Review</CardTitle>
      </CardHeader>
      <CardContent>
        {claims.length === 0 ? (
          <p className="text-center py-4">No pending claims to review</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
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
                  <TableCell className="font-medium">{claim.id}</TableCell>
                  <TableCell>{claim.employeeId}</TableCell>
                  <TableCell>{formatDate(claim.lastUpdated)}</TableCell>
                  <TableCell>${claim.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        claim.status === ClaimStatus.PENDING
                          ? "bg-yellow-100 text-yellow-800"
                          : ""
                      }`}
                    >
                      {claim.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Tabs defaultValue="approve" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="approve">Approve</TabsTrigger>
                        <TabsTrigger value="reject">Reject</TabsTrigger>
                      </TabsList>
                      <TabsContent value="approve" className="mt-2">
                        <Button
                          onClick={() => handleApprove(claim.id)}
                          disabled={isLoading[claim.id]}
                          className="w-full"
                        >
                          {isLoading[claim.id]
                            ? "Processing..."
                            : "Approve Claim"}
                        </Button>
                      </TabsContent>
                      <TabsContent value="reject" className="space-y-2 mt-2">
                        <Textarea
                          placeholder="Provide feedback on why the claim is being rejected"
                          value={feedbackMap[claim.id] || ""}
                          onChange={(e) =>
                            handleFeedbackChange(claim.id, e.target.value)
                          }
                          className="min-h-[80px]"
                        />
                        <Button
                          onClick={() => handleReject(claim.id)}
                          disabled={isLoading[claim.id]}
                          variant="destructive"
                          className="w-full"
                        >
                          {isLoading[claim.id]
                            ? "Processing..."
                            : "Reject Claim"}
                        </Button>
                      </TabsContent>
                    </Tabs>
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

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
import { Textarea } from "@/components/ui/textarea";
import { SerializedClaim } from "@/lib/types";
import { ClaimStatus } from "@/backend/claims/claim";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle, AlertCircle, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

var currency_symbols = {
  USD: "$", // US Dollar
  EUR: "€", // Euro
  CRC: "₡", // Costa Rican Colón
  GBP: "£", // British Pound Sterling
  ILS: "₪", // Israeli New Sheqel
  INR: "₹", // Indian Rupee
  JPY: "¥", // Japanese Yen
  KRW: "₩", // South Korean Won
  NGN: "₦", // Nigerian Naira
  PHP: "₱", // Philippine Peso
  PLN: "zł", // Polish Zloty
  PYG: "₲", // Paraguayan Guarani
  THB: "฿", // Thai Baht
  UAH: "₴", // Ukrainian Hryvnia
  VND: "₫", // Vietnamese Dong
};

interface PendingClaimsReviewProps {
  claims: SerializedClaim[];
  approveClaimAction: (id: string) => Promise<boolean>;
  rejectClaimAction: (id: string, feedback: string) => Promise<boolean>;
}
import Link from "next/link";

export default function PendingClaimsReview({
  claims,
  approveClaimAction,
  rejectClaimAction,
}: PendingClaimsReviewProps) {
  const [feedback, setFeedback] = useState<string>("");
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

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

  const openRejectDialog = (claimId: string) => {
    setSelectedClaimId(claimId);
    setFeedback(""); // Reset feedback when opening dialog
    setIsRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedClaimId) return;

    if (!feedback || feedback.trim() === "") {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback when rejecting a claim.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading((prev) => ({ ...prev, [selectedClaimId]: true }));
    try {
      const result = await rejectClaimAction(selectedClaimId, feedback);
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
      setIsLoading((prev) => ({ ...prev, [selectedClaimId]: false }));
      setIsRejectDialogOpen(false);
    }
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
                <TableHead>Title</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempt count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">{claim.title}</TableCell>
                  <TableCell>{claim.employeeName || "Unknown"}</TableCell>
                  <TableCell>{formatDate(claim.lastUpdated)}</TableCell>
                  <TableCell>
                    {currency_symbols[
                      claim.currency as keyof typeof currency_symbols
                    ] || ""}
                    {claim.amount.toFixed(2)}
                  </TableCell>
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        claim.attemptCount > 2
                          ? "bg-red-100 text-red-800"
                          : claim.attemptCount > 1
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      Attempt count: {claim.attemptCount}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleApprove(claim.id)}
                        disabled={isLoading[claim.id]}
                        className="h-8 w-8 hover:bg-green-100 text-green-600 bg-gray-50 border-none cursor-pointer"
                        title="Approve Claim"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openRejectDialog(claim.id)}
                        disabled={isLoading[claim.id]}
                        className="h-8 w-8 bg-gray-50 hover:bg-red-100 text-red-600 border-none cursor-pointer"
                        title="Reject Claim"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-gray-50 hover:bg-gray-100 text-gray-600 border-none cursor-pointer"
                        title="Reject Claim"
                      >
                        <Link href={`/dashboard/claims/view/${claim.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Rejection Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="bg-gray-50">
            <DialogHeader>
              <DialogTitle>Reject Claim</DialogTitle>
              <DialogDescription>
                Please provide feedback explaining why this claim is being
                rejected.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Enter rejection feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] bg-gray-50"
            />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={isLoading[selectedClaimId || ""]}
                className="bg-gray-200 hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-500 hover:bg-red-600 cursor-pointer"
                onClick={handleReject}
                disabled={isLoading[selectedClaimId || ""]}
              >
                {isLoading[selectedClaimId || ""]
                  ? "Processing..."
                  : "Reject Claim"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

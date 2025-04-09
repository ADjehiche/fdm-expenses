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

var currency_symbols = {
    'USD': '$', // US Dollar
    'EUR': '€', // Euro
    'CRC': '₡', // Costa Rican Colón
    'GBP': '£', // British Pound Sterling
    'ILS': '₪', // Israeli New Sheqel
    'INR': '₹', // Indian Rupee
    'JPY': '¥', // Japanese Yen
    'KRW': '₩', // South Korean Won
    'NGN': '₦', // Nigerian Naira
    'PHP': '₱', // Philippine Peso
    'PLN': 'zł', // Polish Zloty
    'PYG': '₲', // Paraguayan Guarani
    'THB': '฿', // Thai Baht
    'UAH': '₴', // Ukrainian Hryvnia
    'VND': '₫', // Vietnamese Dong
};

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
  console.log(claims);
  return (
    <div>
      {claims.map((claim) => (
        <div
          className="rounded-lg bg-white text-card-foreground shadow-sm border border-gray-200 border-solid mb-4"
          key={claim.id}
        >
          {/* Header Section */}
          <div className="bg-gray-100 p-4 rounded-t-lg">
            <h1 className="text-lg font-bold">{claim.title}</h1>
          </div>

          {/* Body Section */}
          <div className="p-6 flex flex-col justify-between space-y-2">
            <p><b>Description:</b> {claim.description}</p>
            <p><b>Employee:</b> {claim.employeeName}</p>
            <p><b>Last updated: </b> {formatDate(claim.lastUpdated)}</p>
            <p>
              <b>Amount:</b>{" "}
              {currency_symbols[claim.currency as keyof typeof currency_symbols] ||
                ""}
              {claim.amount.toFixed(2)}
            </p>
            <p><b>Category:</b> {claim.category}</p>
            <p>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  claim.status === ClaimStatus.PENDING
                    ? "bg-yellow-100 text-yellow-800"
                    : ""
                }`}
              >
                {claim.status}
              </span>
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
            </p>

            {/* Approve/Reject Tabs */}
            <div id="approveBox">
              <Tabs defaultValue="approve" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-md">
                  <TabsTrigger
                    value="approve"
                    className="py-2 text-center hover:bg-gray-200 focus:bg-gray-300"
                  >
                    Approve
                  </TabsTrigger>
                  <TabsTrigger
                    value="reject"
                    className="py-2 text-center hover:bg-gray-200 focus:bg-gray-300"
                  >
                    Reject
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="approve" className="mt-2">
                  <Button
                    onClick={() => handleApprove(claim.id)}
                    disabled={isLoading[claim.id]}
                    className="w-full bg-green-300  hover:bg-green-600 hover:text-white"
                  >
                    {isLoading[claim.id] ? "Processing..." : "Approve Claim"}
                  </Button>
                </TabsContent>
                <TabsContent value="reject" className="space-y-2 mt-2">
                  <Textarea
                    placeholder="Provide feedback on why the claim is being rejected"
                    value={feedbackMap[claim.id] || ""}
                    onChange={(e) =>
                      handleFeedbackChange(claim.id, e.target.value)
                    }
                    className="min-h-[80px] bg-white"
                  />
                  <Button
                    onClick={() => handleReject(claim.id)}
                    disabled={isLoading[claim.id]}
                    variant="destructive"
                    className="w-full bg-red-300 hover:bg-red-600 hover:text-white"
                  >
                    {isLoading[claim.id] ? "Processing..." : "Reject Claim"}
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

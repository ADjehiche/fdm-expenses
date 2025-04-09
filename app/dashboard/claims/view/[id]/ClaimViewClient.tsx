"use client";

import React, { useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Upload,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  approveClaimAction,
  rejectClaimAction,
  reimburseClaimAction,
  submitDraftClaim,
} from "@/actions/claimActions";
import { useToast } from "@/components/ui/use-toast";

// Define ClaimStatus enum in the client component to avoid importing server-side code
enum ClaimStatus {
  DRAFT = "Draft",
  PENDING = "Pending",
  ACCEPTED = "Accepted",
  REJECTED = "Rejected",
  REIMBURSED = "Reimbursed",
}

// Helper function for formatting currency
const formatCurrency = (amount: number, currency: string = "GBP") => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
};

// Helper function for formatting dates
function formatRelativeDate(dateString: string): string {
  try {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Unknown";
  }
}

// Map status to UI elements
const statusConfig: Record<
  ClaimStatus,
  { color: string; icon: React.ReactNode }
> = {
  [ClaimStatus.DRAFT]: {
    color: "bg-gray-100 text-gray-800",
    icon: <FileText className="h-4 w-4 mr-1" />,
  },
  [ClaimStatus.PENDING]: {
    color: "bg-yellow-100 text-yellow-800",
    icon: <AlertCircle className="h-4 w-4 mr-1" />,
  },
  [ClaimStatus.ACCEPTED]: {
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="h-4 w-4 mr-1" />,
  },
  [ClaimStatus.REJECTED]: {
    color: "bg-red-100 text-red-800",
    icon: <XCircle className="h-4 w-4 mr-1" />,
  },
  [ClaimStatus.REIMBURSED]: {
    color: "bg-blue-100 text-blue-800",
    icon: <CheckCircle className="h-4 w-4 mr-1" />,
  },
};

// Interface for the client component props
interface ClaimViewClientProps {
  claim: {
    id: number;
    title: string;
    description: string;
    category: string;
    amount: number;
    currency: string;
    status: ClaimStatus;
    feedback: string;
    attemptCount: number;
    createdAt: string;
    lastUpdated: string;
    evidence: Array<{
      name: string;
      url: string;
    }>;
    bankInfo: {
      accountName: string | null;
      accountNumber: string | null;
      sortCode: string | null;
    };
    employee: {
      id: number;
      name: string;
      email: string;
    } | null;
  };
  userRole?: string;
  isOwnClaim?: boolean;
}

export default function ClaimViewClient({
  claim,
  userRole,
  isOwnClaim = false,
}: ClaimViewClientProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingFile, setDeletingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine user permissions based on role
  const isLineManager = userRole === "Line Manager";
  const isPayrollOfficer = userRole === "Payroll Officer";

  // Format the creation date
  const formattedDate = new Date(claim.createdAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  //  claim approval
  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const result = await approveClaimAction(claim.id);
      if (result) {
        toast({
          title: "Claim approved",
          description: "The claim has been approved successfully.",
          variant: "default",
        });
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to approve the claim. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving claim:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle claim rejection
  const handleReject = async () => {
    if (!rejectFeedback.trim()) {
      toast({
        title: "Feedback required",
        description:
          "Please provide feedback explaining why the claim is being rejected.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await rejectClaimAction(claim.id, rejectFeedback);
      if (result) {
        toast({
          title: "Claim rejected",
          description: "The claim has been rejected with feedback.",
          variant: "default",
        });
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to reject the claim. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error rejecting claim:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsRejectDialogOpen(false);
    }
  };

  // Handle claim reimbursement
  const handleReimburse = async () => {
    setIsSubmitting(true);
    try {
      const result = await reimburseClaimAction(claim.id);
      if (result) {
        toast({
          title: "Claim reimbursed",
          description: "The claim has been marked as reimbursed successfully.",
          variant: "default",
        });
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: "Failed to reimburse the claim. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error reimbursing claim:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle evidence file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);

      const response = await fetch(`/api/claims/${claim.id}/evidence`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "File uploaded",
          description: "Evidence file has been added successfully.",
        });
        window.location.reload(); // Refresh to show new file
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload evidence file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred during file upload.",
        variant: "destructive",
      });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input
      }
    }
  };

  // Handle evidence file deletion
  const handleDeleteFile = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    setDeletingFile(filename);

    try {
      const response = await fetch(
        `/api/claims/${claim.id}/evidence?filename=${encodeURIComponent(
          filename
        )}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "File deleted",
          description: "Evidence file has been removed successfully.",
        });
        window.location.reload(); // Refresh to update file list
      } else {
        toast({
          title: "Deletion failed",
          description: result.error || "Failed to delete evidence file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Deletion failed",
        description: "An unexpected error occurred while deleting the file.",
        variant: "destructive",
      });
    } finally {
      setDeletingFile(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          asChild
          className="mb-4 bg-[#c3fa04] cursor-pointer"
          onClick={() => router.back()}
        >
          <div>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Claims
          </div>
        </Button>

        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            statusConfig[claim.status].color
          }`}
        >
          {statusConfig[claim.status].icon}
          {claim.status}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{claim.title}</CardTitle>
            <CardDescription>
              Submitted {formattedDate} • Last updated{" "}
              {formatRelativeDate(claim.lastUpdated)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Category</h3>
              <p>{claim.category}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Amount</h3>
              <p className="text-lg font-bold">
                {formatCurrency(claim.amount, claim.currency)}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="whitespace-pre-wrap">{claim.description}</p>
            </div>

            {claim.feedback && (
              <div className="p-4 border rounded-md bg-amber-50 border-amber-200">
                <h3 className="text-sm font-medium text-gray-700 mb-1">
                  Feedback
                </h3>
                <p className="text-sm text-gray-600">{claim.feedback}</p>
              </div>
            )}

            {claim.status === ClaimStatus.PENDING && claim.attemptCount > 1 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-700">
                  Submission attempt: {claim.attemptCount} of 3
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Evidence Files Card */}
          <Card>
            <CardHeader>
              <CardTitle>Evidence</CardTitle>
              <CardDescription>
                Supporting documents for this claim
              </CardDescription>
            </CardHeader>
            <CardContent>
              {claim.evidence.length > 0 ? (
                <ul className="space-y-2">
                  {claim.evidence.map((file, index) => (
                    <li
                      key={index}
                      className="p-3 border rounded-md flex items-center justify-between"
                    >
                      <span className="truncate max-w-[200px]">
                        {file.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          View
                        </a>
                        {/* Only allow deletion if user owns the claim and it's in Draft or Rejected status */}
                        {isOwnClaim &&
                          (claim.status === ClaimStatus.DRAFT ||
                            claim.status === ClaimStatus.REJECTED) && (
                            <Button
                              variant="destructive"
                              className="text-red-500 cursor-pointer"
                              onClick={() => handleDeleteFile(file.name)}
                              disabled={deletingFile === file.name}
                            >
                              {deletingFile === file.name ? (
                                <svg
                                  className="animate-spin h-4 w-4"
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
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">
                  No evidence files attached
                </p>
              )}
              {/* Only show upload button if user owns the claim and it's in Draft or Rejected status */}
              {isOwnClaim &&
                (claim.status === ClaimStatus.DRAFT ||
                  claim.status === ClaimStatus.REJECTED) && (
                  <div className="mt-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFile}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingFile ? "Uploading..." : "Upload Evidence"}
                    </Button>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Employee Details Card (only visible to managers/admins) */}
          {claim.employee && (isLineManager || isPayrollOfficer) && (
            <Card>
              <CardHeader>
                <CardTitle>Employee Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p>{claim.employee.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p>{claim.employee.email}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Details Card (only visible for accepted/reimbursed claims to payroll officers) */}
          {isPayrollOfficer &&
            (claim.status === ClaimStatus.ACCEPTED ||
              claim.status === ClaimStatus.REIMBURSED) && (
              <Card>
                <CardHeader>
                  <CardTitle>Bank Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {claim.bankInfo.accountName ? (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Account Name
                        </h3>
                        <p>{claim.bankInfo.accountName}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Account Number
                        </h3>
                        <p>{claim.bankInfo.accountNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          Sort Code
                        </h3>
                        <p>{claim.bankInfo.sortCode}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">
                      Bank details not provided
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      {/* Action buttons based on user role and claim status */}
      {isLineManager && claim.status === ClaimStatus.PENDING && !isOwnClaim && (
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Claim
          </Button>
          <Button
            onClick={() => setIsRejectDialogOpen(true)}
            variant="destructive"
            disabled={isSubmitting}
            className="bg-red-600 hover:bg-red-700"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject Claim
          </Button>

          {/* Rejection Dialog */}
          <Dialog
            open={isRejectDialogOpen}
            onOpenChange={setIsRejectDialogOpen}
          >
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
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                className="min-h-[100px] bg-gray-50"
              />
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(false)}
                  disabled={isSubmitting}
                  className="bg-gray-200 hover:bg-gray-300 text-black"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-500 hover:bg-red-600 cursor-pointer"
                  onClick={handleReject}
                  disabled={isSubmitting || !rejectFeedback.trim()}
                >
                  {isSubmitting ? "Processing..." : "Reject Claim"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isLineManager && claim.status === ClaimStatus.PENDING && isOwnClaim && (
        <div className="p-4 border rounded-md bg-yellow-50 border-yellow-200 mt-6">
          <p className="text-sm text-yellow-800">
            <AlertCircle className="h-4 w-4 inline mr-2" />
            You cannot approve or reject your own claim. It must be reviewed by
            another manager.
          </p>
        </div>
      )}

      {isPayrollOfficer &&
        claim.status === ClaimStatus.ACCEPTED &&
        !isOwnClaim && (
          <div className="mt-6">
            <Button
              onClick={handleReimburse}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Reimbursed
            </Button>
          </div>
        )}

      {isPayrollOfficer &&
        claim.status === ClaimStatus.ACCEPTED &&
        isOwnClaim && (
          <div className="p-4 border rounded-md bg-yellow-50 border-yellow-200 mt-6">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              You cannot mark your own claim as reimbursed. It must be processed
              by another payroll officer.
            </p>
          </div>
        )}

      {!isLineManager && claim.status === ClaimStatus.REJECTED && (
        <div className="mt-6 flex flex-row gap-2">
          <Button
            asChild
            className="bg-green-200 hover:bg-green-300 cursor-pointer"
            onClick={async () => {
              await submitDraftClaim(claim.id);
              router.refresh();
            }}
          >
            <p>Resubmit Claim</p>
          </Button>
          <Button asChild className="bg-gray-200 hover:bg-gray-300">
            <Link href={`/dashboard/claims/edit/${claim.id}`}>Edit Claim</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

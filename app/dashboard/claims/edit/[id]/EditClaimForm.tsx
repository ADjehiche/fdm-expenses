"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as zod from "zod";
import { useUser } from "@/app/contexts/UserContext";
import { SerializedClaim } from "@/backend/serializedTypes";
// Import server actions
import { updateClaim, addEvidenceToClaimServer } from "@/actions/claimActions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/use-toast";
import { Camera, Download, Eye, Upload, X } from "lucide-react";

const expenseFormSchema = zod.object({
  title: zod.string().min(3, "Title must be at least 3 characters"),
  description: zod
    .string()
    .min(10, "Description must be at least 10 characters"),
  amount: zod
    .string()
    .refine(
      (val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0,
      {
        message: "Amount must be a positive number",
      }
    ),
  currency: zod.string().min(1, "Please select a currency"),
  category: zod.string().min(1, "Please select a category"),
  date: zod.string().min(1, "Please select a date"),
});

interface EditClaimFormProps {
  claim: SerializedClaim;
}

export default function EditClaimForm({ claim }: EditClaimFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize evidence files from the claim data
  const [evidence, setEvidence] = useState<
    { name: string; url?: string; preview?: string }[]
  >([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Initialize evidence files from the claim
  useEffect(() => {
    if (claim.evidence && claim.evidence.length > 0) {
      setEvidence(
        claim.evidence.map((file) => ({
          name: file.name,
          url: file.url,
        }))
      );
    }
  }, [claim.evidence]);

  const [realFiles, setRealFiles] = useState<File[]>([]);

  // Parse the claim date from ISO string to YYYY-MM-DD format
  const claimDate = new Date(claim.createdAt).toISOString().split("T")[0];

  const form = useForm<zod.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: claim.title || "",
      description: claim.description || "",
      amount: claim.amount.toString() || "",
      currency: claim.currency || "GBP",
      category: claim.category || "",
      date: claimDate,
    },
  });

  async function onSubmit(values: zod.infer<typeof expenseFormSchema>) {
    setIsSubmitting(true);

    try {
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Update the existing claim using server action
      const response = await updateClaim({
        claimId: parseInt(claim.id),
        employeeId: parseInt(user.id),
        amount: parseFloat(values.amount),
        title: values.title,
        description: values.description,
        category: values.category,
        currency: values.currency,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update claim");
      }

      toast({
        title: "Expense claim updated",
        description: "Your expense claim has been successfully updated",
      });

      router.push("/dashboard/claims/drafts");
    } catch (error) {
      console.error("Error updating claim:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "There was an error updating your expense claim",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle file change - matching the new page implementation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploading(true);

      const files = Array.from(e.target.files);
      const newEvidenceFiles = files.map((file) => ({
        name: file.name,
        preview: URL.createObjectURL(file),
      }));

      // Upload each file using the server action
      const uploadPromises = files.map(async (file) => {
        try {
          const result = await addEvidenceToClaimServer(
            parseInt(claim.id),
            file
          );

          if (!result.success) {
            toast({
              title: "Error",
              description: result.error || `Failed to upload ${file.name}`,
              variant: "destructive",
            });
            return null;
          }
          return file.name;
        } catch (error) {
          console.error("Error uploading file:", error);
          toast({
            title: "Upload Error",
            description: `Error uploading ${file.name}`,
            variant: "destructive",
          });
          return null;
        }
      });

      Promise.all(uploadPromises).then((results) => {
        // Filter out failed uploads
        const successfulUploads = results.filter(Boolean);

        if (successfulUploads.length > 0) {
          setEvidence((prev) => [
            ...prev,
            ...newEvidenceFiles.filter((f) =>
              successfulUploads.includes(f.name)
            ),
          ]);

          toast({
            title: "Files uploaded",
            description: `Successfully uploaded ${successfulUploads.length} file(s)`,
          });
        }

        setUploading(false);
      });
    }
  };

  const handleCameraCapture = () => {
    // This would be implemented with device camera API
    toast({
      title: "Camera feature",
      description: "Camera capture would be implemented here",
    });
  };

  // Handle file deletion for newly added files that haven't been uploaded yet
  const handleRemoveLocalEvidence = (index: number) => {
    const newEvidence = [...evidence];
    // If it's a local file with preview URL, revoke it to free memory
    if (newEvidence[index].preview) {
      URL.revokeObjectURL(newEvidence[index].preview!);
    }

    // Remove the file from state
    newEvidence.splice(index, 1);
    setEvidence(newEvidence);

    toast({
      title: "Evidence removed",
      description: `File has been removed from your draft claim`,
    });
  };

  // Handle file deletion for already uploaded evidence files
  const handleRemoveEvidence = async (index: number) => {
    const file = evidence[index];

    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

    setDeleting(file.name);

    try {
      // Use fetch to call our API endpoint for deleting evidence
      const response = await fetch(
        `/api/claims/${claim.id}/evidence?filename=${encodeURIComponent(
          file.name
        )}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        // If the preview URL exists, revoke it to free memory
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }

        // Remove the file from state
        const newEvidence = [...evidence];
        newEvidence.splice(index, 1);
        setEvidence(newEvidence);

        toast({
          title: "Evidence removed",
          description: `File "${file.name}" has been removed from your claim`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete evidence file",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the file",
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800">
            Edit Expense Claim
          </h1>
          <p className="text-muted-foreground">
            Update your expense claim details
          </p>
        </div>
      </div>

      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 border-b border-gray-200">
          <CardTitle className="text-gray-800 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-receipt"
            >
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
              <path d="M16 8h-6" />
              <path d="M16 12h-6" />
              <path d="M16 16h-6" />
            </svg>
            Edit Expense Claim Form
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="transition-all">
                      <FormLabel className="text-gray-700 font-medium">
                        Expense Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="E.g., Client Meeting Lunch"
                          className="focus-within:border-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Date of Expense
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="focus-within:border-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide details about this expense"
                        className="min-h-[120px] focus-within:border-gray-400 resize-none bg-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Amount
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="focus-within:border-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium bg-white">
                        Currency
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="focus-within:border-gray-400 focus:ring-gray-400 bg-white">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">
                            GBP - British Pound
                          </SelectItem>
                          <SelectItem value="CAD">
                            CAD - Canadian Dollar
                          </SelectItem>
                          <SelectItem value="AUD">
                            AUD - Australian Dollar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="focus-within:border-gray-400 focus:ring-gray-400 bg-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="meals">
                            Meals & Entertainment
                          </SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="accommodation">
                            Accommodation
                          </SelectItem>
                          <SelectItem value="office">
                            Office Supplies
                          </SelectItem>
                          <SelectItem value="software">
                            Software & Subscriptions
                          </SelectItem>
                          <SelectItem value="training">
                            Training & Development
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Evidence Section - Replacing with the exact implementation from new page */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <FormLabel className="text-gray-700 font-medium">
                  Evidence (Optional)
                </FormLabel>
                <FormDescription className="text-sm text-gray-500 mb-3">
                  Upload receipts or other supporting documents
                </FormDescription>
                <div className="mt-2 flex flex-wrap gap-4">
                  {evidence.map((file, index) => (
                    <div
                      key={index}
                      className="relative border border-gray-200 bg-white shadow-sm rounded-md p-2 w-32 hover:shadow-md transition-shadow"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white hover:bg-destructive/90"
                        onClick={() =>
                          file.url
                            ? handleRemoveEvidence(index)
                            : handleRemoveLocalEvidence(index)
                        }
                        disabled={deleting === file.name}
                      >
                        {deleting === file.name ? (
                          <svg
                            className="animate-spin h-3 w-3"
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
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                      {file.preview ? (
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="h-20 w-full object-cover rounded"
                        />
                      ) : (
                        <div className="h-20 w-full flex items-center justify-center bg-muted rounded">
                          <FileIcon />
                        </div>
                      )}
                      <p className="text-xs mt-1 truncate font-medium">
                        {file.name}
                      </p>
                      {file.url && (
                        <div className="mt-2 flex justify-center">
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <div className="border border-gray-200 bg-white border-dashed hover:border-gray-400 hover:text-gray-700 rounded-md p-4 flex flex-col items-center justify-center w-32 h-32 transition-colors cursor-pointer">
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                      >
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-sm text-center block">
                          Upload Files
                        </span>
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={uploading}
                        />
                      </label>
                    </div>
                    <div className="border border-gray-200 bg-white border-dashed hover:border-gray-400 hover:text-gray-700 rounded-md p-4 flex flex-col items-center justify-center w-32 h-32 transition-colors cursor-pointer">
                      <button
                        type="button"
                        className="cursor-pointer w-full h-full flex flex-col items-center justify-center"
                        onClick={handleCameraCapture}
                      >
                        <Camera className="h-8 w-8 mb-2" />
                        <span className="text-sm text-center block">
                          Take Photo
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                {uploading && (
                  <div className="flex items-center justify-center mt-4">
                    <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm">
                      <svg
                        className="animate-spin h-4 w-4"
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
                      <span>Uploading files...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="min-w-[100px] transition-all bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="min-w-[140px] bg-gray-700 hover:bg-gray-600 text-white shadow-sm hover:shadow transition-all"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Updating...
                    </span>
                  ) : (
                    "Update Claim"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

// Add the FileIcon function to match the new page's implementation
function FileIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 text-muted-foreground"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useActionState } from "react";
import { fetchUserById, updateUser, UpdateAccountState } from "./EditAccount";

import { UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the validation schema for editing an account
const EditAccountSchema = z.object({
  userId: z.string(),
  firstName: z.string().min(1, "First name is required"),
  familyName: z.string().min(1, "Family name is required"),
  email: z.string().email("Valid email is required"),
  region: z.string().min(1, "Region is required"),
  employeeClassification: z.string().min(1, "Classification is required"),
  employeeRole: z.string().min(1, "Role is required"),
  lineManagerId: z.string().optional(),
});

// Initial state for the form action
const initialState: UpdateAccountState = {
  success: false,
  message: "",
};

const EditUserPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, formAction] = useActionState(updateUser, initialState);

  // Create form with validation
  const form = useForm<z.infer<typeof EditAccountSchema>>({
    resolver: zodResolver(EditAccountSchema),
    defaultValues: {
      userId: "",
      firstName: "",
      familyName: "",
      email: "",
      region: "",
      employeeClassification: "",
      employeeRole: "",
      lineManagerId: "",
    },
  });

  // Redirect on success
  useEffect(() => {
    if (status.success) {
      // Wait a moment to show success message before redirecting
      const timer = setTimeout(() => {
        router.push("/dashboard/admin/manage-accounts");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status.success, router]);

  // Fetch user data when component loads
  useEffect(() => {
    const userID = searchParams.get("userID");
    if (userID) {
      fetchUserById(parseInt(userID)).then((data) => {
        if (data) {
          const user = data[0];
          console.log("Fetched User:", user);
          setUserData(data);

          // Set form values
          form.setValue("userId", userID);
          form.setValue("firstName", user.firstName);
          form.setValue("familyName", user.familyName);
          form.setValue("email", user.email);
          form.setValue("employeeRole", user.employeeRole.employeeType);
          form.setValue("region", user.region);
          form.setValue("employeeClassification", user.employeeClassification);

          if (user.employeeRole.lineManager) {
            form.setValue(
              "lineManagerId",
              user.employeeRole.lineManager.toString()
            );
          }
        }
      });
    }
  }, [searchParams, form]);

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit User</h1>
      </div>

      <Card className="border-0 shadow-md w-full">
        <CardHeader className="bg-fdm-blue text-white rounded-t-lg">
          <CardTitle className="flex items-center text-black">
            <UserPlus className="mr-2 h-5 w-5" />
            User Details
          </CardTitle>
          <CardDescription className="text-black">
            Update the information of the selected user
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {status.message && (
            <div
              className={`p-3 mb-6 rounded-md text-sm ${
                status.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <p>{status.message}</p>
            </div>
          )}

          <Form {...form}>
            <form
              action={async (formData) => {
                setIsLoading(true);
                await formAction(formData);
                setIsLoading(false);
              }}
              className="space-y-4"
            >
              {/* Hidden user ID field */}
              <input type="hidden" name="userId" {...form.register("userId")} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="familyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Family Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Family Name" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage className="text-red-500 font-medium" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input placeholder="Region" {...field} />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeClassification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classification</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select Classification</option>
                          <option value="Internal">Internal</option>
                          <option value="External">External</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employeeRole"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select Role</option>
                          <option value="Administrator">Administrator</option>
                          <option value="Payroll Officer">
                            Payroll Officer
                          </option>
                          <option value="Line Manager">Line Manager</option>
                          <option value="General Staff">Staff</option>
                          <option value="Consultant">Consultant</option>
                        </select>
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lineManagerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Line Manager ID (optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Line Manager ID (if any)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="px-0 pt-6">
                <Button
                  type="submit"
                  className="bg-[#c3fa04] hover:bg-[#c3fa04]/90 cursor-pointer hover:scale-[1.01] transition-[2s] text-black font-medium w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving Changes..." : "Save Changes"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditUserPage;

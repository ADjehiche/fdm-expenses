"use server";

import { cookies } from "next/headers";
import { Administrator } from "../../../../backend/employee/administrator";
import { checkIfAdmin } from "../checkAdmin";
import { DatabaseManager } from "../../../../backend/db/databaseManager";

// Define the state type for form submissions
type CreateAccountState = {
  success?: boolean;
  message?: string;
};

export async function CreateAccountAdmin(
  prevState: CreateAccountState,
  formData: FormData
): Promise<CreateAccountState> {
  try {
    // Get the current user from cookies
    const cookie = await cookies();
    const userId = cookie.get("user_id")?.value;

    if (!userId) {
      return { success: false, message: "User is not logged in" };
    }

    // Get user from database
    const dbManager = DatabaseManager.getInstance();
    const user = await dbManager.getAccount(parseInt(userId));

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if user is an admin
    try {
      checkIfAdmin(user);
    } catch (error) {
      return {
        success: false,
        message: "Unauthorized: Admin privileges required",
      };
    }

    // Get form data values
    const firstName = formData.get("firstName") as string;
    const familyName = formData.get("familyName") as string;
    const email = formData.get("email") as string;
    const plainPassword = formData.get("plainPassword") as string;
    const region = formData.get("region") as string;
    const employeeClassification = formData.get(
      "employeeClassification"
    ) as string;
    const employeeRole = formData.get("employeeRole") as string;
    const lineManagerId = formData.get("lineManagerId") as string;

    const admin = user.getEmployeeRole() as Administrator;

    const result = await admin.createAccount({
      id: -1, // ID is auto-incremented by DB, so we can pass a dummy value
      firstName,
      familyName,
      email,
      plainPassword,
      region,
      classification: employeeClassification || undefined,
      role: employeeRole || undefined,
    });

    if (!result) {
      return { success: false, message: "Failed to create account" };
    }

    return { success: true, message: "Account created successfully" };
  } catch (error) {
    console.error("Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, message: errorMessage };
  }
}
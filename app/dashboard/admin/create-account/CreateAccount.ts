"use server";

import { cookies } from "next/headers";
import { Administrator } from "../../../../backend/employee/administrator";
import { checkIfAdmin } from "../checkAdmin";
import { DatabaseManager } from "../../../../backend/db/databaseManager";
import { adminAPIHandler } from "@/actions/admin-api";

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

    const adminAPI = await adminAPIHandler();
    if (!adminAPI) {
      return { success: false, message: "Failed to retrieve admin API" };
    }
    else if (!(adminAPI instanceof Administrator)) {
      return { success: false, message: "Invalid admin API" };
    }

    const admin = adminAPI;

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
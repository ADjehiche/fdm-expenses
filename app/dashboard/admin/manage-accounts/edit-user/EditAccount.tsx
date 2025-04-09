"use server";

import { adminAPIHandler } from "@/actions/admin-api";
import { Administrator } from "../../../../../backend/employee/administrator";
import { EmployeeClassification } from "../../../../../backend/user";
import { EmployeeType } from "../../../../../backend/employee/utils";
import { DatabaseManager } from "../../../../../backend/db/databaseManager";
import { usersTable } from "../../../../../backend/db/schema";
import { eq } from "drizzle-orm";

export const fetchUserById = async (userID: number) => {
  try {
    const adminAPI = await adminAPIHandler();
    if (!adminAPI) {
      return null;
    }

    const userData = await adminAPI.getAccount(userID);
    return JSON.parse(JSON.stringify(userData)); // Serialize for client use
  } catch (error) {
    console.error("Server Action Error:", error);
    return null;
  }
};

// Define the update state type
export type UpdateAccountState = {
  success: boolean;
  message: string;
};

// Function to update an existing user account
export async function updateUser(
  prevState: UpdateAccountState,
  formData: FormData
): Promise<UpdateAccountState> {
  try {
    // Get form data values
    const userId = formData.get("userId") as string;
    const firstName = formData.get("firstName") as string;
    const familyName = formData.get("familyName") as string;
    const email = formData.get("email") as string;
    const region = formData.get("region") as string;
    const employeeClassification = formData.get(
      "employeeClassification"
    ) as string;
    const employeeRole = formData.get("employeeRole") as string;
    const lineManagerId = formData.get("lineManagerId") as string;

    // Get administrator API
    const adminAPI = await adminAPIHandler();
    if (!adminAPI) {
      return { success: false, message: "Failed to retrieve admin API" };
    } else if (!(adminAPI instanceof Administrator)) {
      return { success: false, message: "Invalid admin API" };
    }

    const admin = adminAPI;
    const db = DatabaseManager.getInstance();
    const userIdNum = parseInt(userId);

    // Validate that the user exists
    const user = await db.getAccount(userIdNum);
    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Get the database instance from DatabaseManager to perform direct updates
    const { db: drizzleDb } = await import("../../../../../backend/db/drizzle");

    // Update first name and family name directly in the database
    await drizzleDb
      .update(usersTable)
      .set({
        firstName: firstName,
        familyName: familyName,
      })
      .where(eq(usersTable.id, userIdNum));

    // Update email and region using the existing methods
    await admin.changeEmployeesEmail(userIdNum, email);
    await admin.changeEmployeesRegion(userIdNum, region);

    // Parse the classification
    const newClassification =
      employeeClassification === "Internal"
        ? EmployeeClassification.Internal
        : EmployeeClassification.External;

    // Update classification if changed
    if (user.getEmployeeClassification() !== newClassification) {
      await admin.changeEmployeesClassification(userIdNum, newClassification);
    }

    // Parse the role
    let newRole: EmployeeType;
    switch (employeeRole) {
      case "Administrator":
        newRole = EmployeeType.Administrator;
        break;
      case "Payroll Officer":
        newRole = EmployeeType.PayrollOfficer;
        break;
      case "Line Manager":
        newRole = EmployeeType.LineManager;
        break;
      case "General Staff":
        newRole = EmployeeType.GeneralStaff;
        break;
      case "Consultant":
        newRole = EmployeeType.Consultant;
        break;
      default:
        newRole = user.getEmployeeType(); // Keep current role if invalid
    }

    // Update role if changed
    if (user.getEmployeeType() !== newRole) {
      await admin.changeRole(userIdNum, newRole);
    }

    // Update line manager if provided and changed
    if (lineManagerId && lineManagerId.trim() !== "") {
      const lineManagerIdNum = parseInt(lineManagerId);
      // Check if line manager exists
      const lineManager = await db.getAccount(lineManagerIdNum);
      if (lineManager) {
        await admin.setEmployeesLineManager(userIdNum, lineManagerIdNum);
      }
    }

    return { success: true, message: "Account updated successfully" };
  } catch (error) {
    console.error("Error updating account:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, message: errorMessage };
  }
}

// Function to delete a user account
export async function deleteUser(userId: number): Promise<UpdateAccountState> {
  try {
    // Get administrator API
    const adminAPI = await adminAPIHandler();
    if (!adminAPI) {
      return { success: false, message: "Failed to retrieve admin API" };
    } else if (!(adminAPI instanceof Administrator)) {
      return { success: false, message: "Invalid admin API" };
    }

    const admin = adminAPI;

    // Attempt to delete the account
    const success = await admin.deleteAccount(userId);

    if (success) {
      return { success: true, message: "Account deleted successfully" };
    } else {
      return { success: false, message: "Failed to delete account" };
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, message: errorMessage };
  }
}

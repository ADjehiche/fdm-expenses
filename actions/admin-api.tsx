"use server";

import { cookies } from "next/headers";
import { Administrator } from "../backend/employee/administrator";
import { DatabaseManager } from "../backend/db/databaseManager";

export async function adminAPIHandler(): Promise<Administrator /*| { success: false; message: string }*/> {
  // Get the current user from cookies
  const cookie = await cookies();
  const userId = cookie.get("user_id")?.value;
  
  if (!userId) {
    throw new Error("User ID not found in cookies");
    // return { success: false, message: "User is not logged in" };
  }
  
  // Get user from database
  const dbManager = DatabaseManager.getInstance();
  const user = await dbManager.getAccount(parseInt(userId));
  
  if (!user) {
    throw new Error("User not found in database");
    // return { success: false, message: "Administrator not found" };
  }

  const admin = user.getEmployeeRole() as Administrator;

  return admin;
}

//**
// Copy code below to plug adminAPI
//  */
// import { adminAPIHandler } from "@actions/admin-api";
// const adminAPI = await adminAPIHandler();
// if (!adminAPI) {
//   return { success: false, message: "Failed to retrieve admin API" };
// }
// else if (!(adminAPI instanceof Administrator)) {
//   return { success: false, message: "Invalid admin API" };
// }

// const admin = adminAPI;

'use server';

import { adminAPIHandler } from "@/actions/admin-api";

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
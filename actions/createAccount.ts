import { NextResponse } from "next/server";
import { Administrator } from "../backend/employee/administrator";
import { checkIfAdmin } from "../app/dashboard/admin/checkAdmin";

// Define the state type for form submissions
type CreateAccountState = {
  success?: boolean;
};

export async function CreateAccountAdmin(prevState: CreateAccountState, request: Request): Promise<CreateAccountState> {
  try {
    const { user, formData } = await request.json();
    
    if (!user) {
      throw new Error('User is not logged in');
    }

    checkIfAdmin(user); // Check if the user is logged in and has the Administrator role

    const admin = user.getEmployeeRole() as Administrator;

    const result = await admin.createAccount({
      id: -1, // ID is auto-incremented by DB, so we can pass a dummy value
      firstName: formData.firstName,
      familyName: formData.familyName,
      email: formData.email,
      plainPassword: formData.plainPassword,
      region: formData.region,
      classification: formData.employeeClassification || undefined,
      role: formData.employeeRole || undefined,
    });

    if (!result) {
      return {success: false}
    }

    return {success: true}
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return {success: true}
  }
}
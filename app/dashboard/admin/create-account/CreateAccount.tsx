import { useUser } from "@/app/contexts/UserContext";
import { Administrator } from '../../../../backend/employee/administrator';
import { checkIfAdmin } from "../checkAdmin";
import { check } from "drizzle-orm/gel-core";
import { User } from "../../../../backend/user"; // Adjust the path as necessary

export async function handleCreateAccount(formData: FormData) {
  const { user: serializedUser, loading } = useUser();
  const user = serializedUser ? (serializedUser as unknown as User) : null;

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;
  
  try {
    checkIfAdmin(user); // Check if the user is logged in and has the Administrator role
    
    // Cast the user to an Administrator (since only Admin can create accounts)
    const admin = user.getEmployeeRole() as Administrator;


    const firstName = formData.get('firstName') as string;
    const familyName = formData.get('familyName') as string;
    const email = formData.get('email') as string;
    const plainPassword = formData.get('plainPassword') as string;
    const region = formData.get('region') as string;

    // Call the `createAccount` method with required fields (ID is auto-incremented by DB)
    const result = await admin.createAccount({
      id: -1, // ID is auto-incremented by DB, so we can pass a dummy value
      firstName,
      familyName,
      email,
      plainPassword,
      region,
    });

    return result; // Return success or failure from `createAccount`
  } catch (error) {
    console.error('Account creation failed:', error);
    return { error: 'Failed to create account. Please try again.' };
  }
}
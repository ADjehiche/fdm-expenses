import { useUser } from "@/app/contexts/UserContext";
import { Administrator } from '../../../../backend/employee/administrator';
import { checkIfAdmin } from "../checkAdmin";
import { User } from "../../../../backend/user";
import { CreateAccountAdmin } from "../../../../actions/createAccount";

// Define the state type for form submissions
type CreateAccountState = {
  success?: boolean;
};

export async function handleCreateAccount(prevState: CreateAccountState, formData: FormData): Promise<CreateAccountState>
{
  const { user: serializedUser, loading } = useUser();
  const user = serializedUser ? (serializedUser as unknown as User) : null;

  
  try {
    if (!user) {
      throw new Error('User is not logged in');
    }

    checkIfAdmin(user); // Check if the user is logged in and has the Administrator role
    
    // Cast the user to an Administrator (since only Admin can create accounts)
    const admin = user.getEmployeeRole() as Administrator;


    const firstName = formData.get('firstName') as string;
    const familyName = formData.get('familyName') as string;
    const email = formData.get('email') as string;
    const plainPassword = formData.get('plainPassword') as string;
    const region = formData.get('region') as string;
    const employeeClassification = formData.get('employeeClassification') as string;
    const employeeRole = formData.get('employeeRole') as string;

    // Call the `createAccount` method with required fields (ID is auto-incremented by DB)
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
      throw { error: 'Failed to create account. Please try again.' };
    }

    return { success: true };
  } catch (error) {
      console.error('Account creation failed:', error);
      return { success: false };
  }
}
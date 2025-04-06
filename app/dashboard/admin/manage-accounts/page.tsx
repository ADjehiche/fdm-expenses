import React from 'react';
import { DatabaseManager } from '../../../../backend/db/databaseManager';
import { User, EmployeeClassification } from '../../../../backend/user';
import { EmployeeType } from '../../../../backend/employee/employeeRole';
import EmployeeList from './EmployeeList';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

// Define a serializable user type for client components
export type SerializableUser = {
  id: number;
  createdAt: string;
  firstName: string;
  familyName: string;
  email: string;
  employeeClassification: string;
  region: string;
  employeeRole: {
    employeeType: string;
  };
};

// Fetch users server-side for the page and serialize them
export async function fetchAllUsers(): Promise<SerializableUser[]> {
  const db = DatabaseManager.getInstance();
  try {
    const users = await db.getAllAccounts();
    // Serialize User objects to plain objects that can be passed to client components
    return users.map(user => ({
      id: user.getId(),
      createdAt: user.getCreatedAt().toISOString(),
      firstName: user.getFirstName(),
      familyName: user.getFamilyName(),
      email: user.getEmail(),
      employeeClassification: EmployeeClassification[user.getEmployeeClassification()],
      region: user.getRegion(),
      employeeRole: {
        employeeType: user.getEmployeeRole().getType()
      }
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

// Page Component that fetches users and passes them to EmployeeList
const ManageAccountsPage = async () => {
  const users = await fetchAllUsers();

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Manage Accounts</h1>
        <Link href="/dashboard/admin/create-account">
          <Button className="bg-[#c3fa04] hover:bg-[#c3fa04]/90 text-black font-medium">
            <UserPlus className="mr-2 h-5 w-5" />
            Create Account
          </Button>
        </Link>
      </div>
      
      <p className="text-muted-foreground">
        View and manage all employee accounts in the system. Use the actions to edit or delete accounts as needed.
      </p>
      
      <EmployeeList users={users} />
    </div>
  );
};

export default ManageAccountsPage;
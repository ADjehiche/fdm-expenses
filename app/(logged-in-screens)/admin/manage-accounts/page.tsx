import React from 'react';
import { DatabaseManager } from '../../../../backend/db/databaseManager';
import { User } from '../../../../backend/user'; // Adjust the path accordingly
import EmployeeList from './EmployeeList';

// Fetch users server-side for the page
export async function fetchAllUsers(): Promise<User[]> {
  const db = DatabaseManager.getInstance();
  try {
    const users = await db.getAllAccounts();
    return users;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

// Page Component that fetches users and passes them to EmployeeList
const ManageAccountsPage = async () => {
  const users = await fetchAllUsers();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Manage Accounts</h1>
      <EmployeeList users={users} />
    </div>
  );
};

export default ManageAccountsPage;
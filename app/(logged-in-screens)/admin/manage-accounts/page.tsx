import React, { useEffect, useState } from 'react';
import { DatabaseManager } from '../../../../backend/db/databaseManager';
import { User } from '../../../../backend/user'; // Adjust if your path differs
import EmployeeList from './EmployeeList'; // Adjust if your path differs

// Export a helper to fetch users
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

const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);  // State to store fetched users
  const [loading, setLoading] = useState<boolean>(true);  // Loading state

  // Fetch users when the component mounts
  useEffect(() => {
    const loadUsers = async () => {
      const fetchedUsers = await fetchAllUsers();
      setUsers(fetchedUsers);
      setLoading(false);
    };

    loadUsers();
  }, []);

  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold">Admin Panel</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <EmployeeList users={users} /> // Pass the fetched users to EmployeeList component
      )}
    </div>
  );
};

export default AdminPage;
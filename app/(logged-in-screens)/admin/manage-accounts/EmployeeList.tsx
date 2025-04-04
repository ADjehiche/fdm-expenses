import React, { useEffect, useState } from 'react';
import { User } from '../../../../backend/user'; // Adjust if your path differs

// Define the prop type for the component
interface EmployeeListProps {
  users: User[];
}

// Component to display a list of employees
const EmployeeList: React.FC<EmployeeListProps> = ({ users }) => {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-semibold">Employees List:</h2>
      <ul className="space-y-2">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <li key={user.getId()} className="border p-2 rounded-md">
              <h3 className="font-semibold">
                {user.getFirstName()} {user.getFamilyName()}
              </h3>
              <p>Email: {user.getEmail()}</p>
              <p>Role: {user.getEmployeeRole().getType()}</p>
              <p>Region: {user.getRegion()}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default EmployeeList;
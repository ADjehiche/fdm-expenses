import React from 'react';
import { User } from '../../../../backend/user';  // Adjust the path accordingly

// Define prop types for EmployeeList
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
              <p>Role: {JSON.parse(JSON.stringify(user.getEmployeeRole())).employeeType}</p> // user.getEmployeeRole returns an object that cant be turned into a string, therefore it must be stringified and parsed to access the employeetype attribute
              <p>Region: {user.getRegion()}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default EmployeeList;
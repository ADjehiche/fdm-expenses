"use client";
import React from "react";
import { SerializableUser } from "./page";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Edit, Trash2 } from "lucide-react";
import Link from 'next/link';

interface EmployeeListProps {
  users: SerializableUser[];
}

const EmployeeList: React.FC<EmployeeListProps> = ({ users }) => {
  return (
    <Card className="border-0 shadow-md w-full mt-6">
      <CardHeader className="bg-fdm-blue rounded-t-lg">
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-black" />
          Employee Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No employee accounts found.</p>
          </div>
        ) : (
          <Table>
            <TableCaption>
              List of all employee accounts in the system
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>
                    {user.firstName} {user.familyName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.employeeRole.employeeType}</TableCell>
                  <TableCell>{user.region}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link 
                        href={{
                          pathname: '/dashboard/admin/manage-accounts/edit-user',
                          query: { userID: user.id } // Passing user as a query parameter
                        }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 w-8 p-0 bg-white" 
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 bg-white"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeList;

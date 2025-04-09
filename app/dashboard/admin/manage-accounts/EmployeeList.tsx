"use client";
import React, { useState } from "react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteUser } from "./edit-user/EditAccount";

interface EmployeeListProps {
  users: SerializableUser[];
}

const EmployeeList: React.FC<EmployeeListProps> = ({ users }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deleteStatus, setDeleteStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleDeleteClick = (userId: number) => {
    if (
      confirm(
        `Are you sure you want to delete this user? This action cannot be undone.`
      )
    ) {
      deleteUserAccount(userId);
    }
  };

  const deleteUserAccount = async (userId: number) => {
    try {
      setIsDeleting(true);
      setSelectedUserId(userId);

      const result = await deleteUser(userId);

      setDeleteStatus(result);

      if (result.success) {
        // Wait a moment to show the success message
        setTimeout(() => {
          setDeleteStatus(null);
          // Refresh the page to get updated user list
          router.refresh();
        }, 2000);
      } else {
        // Clear error after some time
        setTimeout(() => {
          setDeleteStatus(null);
        }, 5000);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setDeleteStatus({
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsDeleting(false);
      setSelectedUserId(null);
    }
  };

  return (
    <Card className="border-0 shadow-md w-full mt-6">
      <CardHeader className="bg-fdm-blue rounded-t-lg">
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-black" />
          Employee Accounts
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {deleteStatus && (
          <div
            className={`p-3 mb-6 rounded-md text-sm ${
              deleteStatus.success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <p>{deleteStatus.message}</p>
          </div>
        )}

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
                          pathname:
                            "/dashboard/admin/manage-accounts/edit-user",
                          query: { userID: user.id },
                        }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 bg-gray-50 border-none cursor-pointer"
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 bg-gray-50 border-none cursor-pointer"
                        title="Delete user"
                        onClick={() => handleDeleteClick(user.id)}
                        disabled={isDeleting && selectedUserId === user.id}
                      >
                        {isDeleting && selectedUserId === user.id ? (
                          <span className="h-4 w-4 animate-spin">●</span>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
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

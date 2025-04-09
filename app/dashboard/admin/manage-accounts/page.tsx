import React from "react";
import { fetchAllUsers } from "./fetchusers";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import Link from "next/link";
import EmployeeList from "./EmployeeList";

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
        View and manage all employee accounts in the system. Use the actions to
        edit or delete accounts as needed.
      </p>

      <EmployeeList users={users} />
    </div>
  );
};

export default ManageAccountsPage;

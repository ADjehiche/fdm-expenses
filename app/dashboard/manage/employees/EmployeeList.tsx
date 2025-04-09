"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SerializedUser } from "@/lib/types";
import { toast } from "@/components/ui/use-toast";


interface PendingClaimsReviewProps {
  employees: SerializedUser[];
  approveClaimAction: (id: string) => Promise<boolean>;
  rejectClaimAction: (id: string, feedback: string) => Promise<boolean>;
}

export default function PendingClaimsReview({
  employees,
  approveClaimAction,
  rejectClaimAction,
}: PendingClaimsReviewProps) {
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  // Convert date string to formatted date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  console.log(employees);
  return (
    <Card className="w-full">
      <CardContent>
        {employees.length === 0 ? (
          <p className="text-center py-4">No employees are managed by you</p>
        ) : (
          <Table>
            {/* Header Section */}
            <TableHeader className="bg-gray-200 rounded-t-lg border-b border-gray-300">
              <TableRow>
                <TableHead>id</TableHead>
                <TableHead>First name</TableHead>
                <TableHead>Family Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Classification</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created at</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.id}</TableCell>
                  <TableCell className="font-medium">{employee.firstName}</TableCell>
                  <TableCell className="font-medium">{employee.familyName}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.employeeClassification}</TableCell>
                  <TableCell>{employee.region}</TableCell>
                  <TableCell>{employee.employeeRoleType}</TableCell>
                  <TableCell>{formatDate(employee.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

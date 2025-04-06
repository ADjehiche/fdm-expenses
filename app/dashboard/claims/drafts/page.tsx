import Link from "next/link";
import { Edit, Eye, Trash2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DraftClaimsPage() {
  // Mock data for draft claims
  const draftClaims = [
    {
      id: "1",
      title: "Client Meeting Lunch",
      date: "Mar 15, 2025",
      amount: "$45.00",
      category: "Meals & Entertainment",
      lastUpdated: "2 days ago",
    },
    {
      id: "2",
      title: "Office Supplies",
      date: "Mar 10, 2025",
      amount: "$120.75",
      category: "Office Supplies",
      lastUpdated: "1 week ago",
    },
    {
      id: "3",
      title: "Conference Registration",
      date: "Apr 5, 2025",
      amount: "$350.00",
      category: "Training & Development",
      lastUpdated: "3 days ago",
    },
  ];

  return (
    <div className="space-y-6 text-black">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Draft Claims</h1>
          <p className="text-muted-foreground">
            Manage your expense claims in progress
          </p>
        </div>
        <Button asChild className="bg-[#c3fa04] hover:bg-[#c3fa04]/90">
          <Link href="/dashboard/claims/new">
            <Plus className="mr-2 h-4 w-4" /> New Expense Claim
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Draft Expense Claims</CardTitle>
          <CardDescription>
            These claims are saved but not yet submitted for approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draftClaims.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draftClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell className="font-medium">{claim.title}</TableCell>
                    <TableCell>{claim.date}</TableCell>
                    <TableCell>{claim.category}</TableCell>
                    <TableCell>{claim.amount}</TableCell>
                    <TableCell>{claim.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/claims/edit/${claim.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/dashboard/claims/view/${claim.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <FileIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No draft claims</h3>
              <p className="text-muted-foreground mb-4">
                You haven't created any draft expense claims yet.
              </p>
              <Button asChild className="bg-[#c3fa04] hover:bg-[#c3fa04]/90">
                <Link href="/dashboard/claims/new" className="">
                  <Plus className="mr-2 h-4 w-4" /> Create New Claim
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

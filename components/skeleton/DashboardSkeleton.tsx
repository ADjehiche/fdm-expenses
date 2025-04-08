import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 text-black">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-36 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <StatCardSkeleton key={index} />
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-2">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />

        <Card className="border border-gray-200 border-solid">
          <CardHeader className="pb-2">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-72 bg-gray-200 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <ClaimItemSkeleton key={index} />
              ))}
            </div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse mt-4" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card className="border border-gray-200 border-solid">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-10 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mt-2" />
      </CardContent>
    </Card>
  );
}

function ClaimItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 shadow-sm rounded-lg">
      <div className="flex flex-col">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

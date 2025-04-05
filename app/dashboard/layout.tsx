import type React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardLayout from "@/components/dashboard-layout";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication on the server side
  const cookiesStore = await cookies();
  const userId = cookiesStore.get("user_id")?.value;

  if (!userId) {
    redirect("/login");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

"use client";
import { use } from "react";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function AdminPage() {
  useEffect(() => {
    redirect("/dashboard/admin/manage-accounts");
  }, []);
}

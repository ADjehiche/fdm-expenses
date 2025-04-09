"use client";
import { useEffect } from "react";
import { redirect } from "next/navigation";

export default function UserProfile() {
  useEffect(() => {
    redirect("/dashboard/claims/drafts");
  }, []);
}

"use client";

import { useUser } from "@/app/contexts/UserContext";

export default function UserProfile() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {user.getFirstName()} {user.getFamilyName()}</p>
      <p>Email: {user.getEmail()}</p>
      <p>Role: {user.getEmployeeRole().getType()}</p>
      <p>Region: {user.getRegion()}</p>
    </div>
  );
}
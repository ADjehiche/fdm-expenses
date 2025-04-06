"use client";

import { useUser } from "@/app/contexts/UserContext";

export default function UserProfile() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Not logged in</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {user.firstName} {user.familyName}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.employeeRoleType}</p>
      <p>Region: {user.region}</p>
    </div>
  );
}
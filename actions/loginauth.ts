"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Define the state type
type LoginState = {
  error: string;
  success?: boolean;
};

export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
      return { error: "Username and password are required" };
    }

    if (username !== "test" || password !== "password") {
      return { error: "Invalid username or password" };
    }

    const cookie = await cookies();
    cookie.set("user_id", "123", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });
    console.log("Logged In");

    return { error: "", success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred" };
  }
}

export async function logout() {
  const cookie = await cookies();
  cookie.delete("user_id");
  redirect("/login");
}

export async function getCurrentUser() {
  const cookie = await cookies();
  const userId = cookie.get("user_id")?.value;

  if (!userId) {
    return null;
  }

  return {
    id: userId,
    username: "test",
    name: "Test User",
    email: "test@example.com",
    role: "employee" as const,
  };
}

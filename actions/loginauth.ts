"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Import the backend authentication components
import { DatabaseManager } from "../backend/db/databaseManager";
import { User } from "../backend/user";
import { SerializedUser, serializeUser } from "../backend/serializedTypes";

// Define the state type for form submissions
type LoginState = {
  error: string;
  success?: boolean;
  newLogin?: boolean;
};

/**
 * Login function that authenticates users using the backend DatabaseManager
 * This replaces the hardcoded authentication with proper database authentication
 */
export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    // Extract email and password from the form data
    const email = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    // Use the backend authentication system
    const dbManager = DatabaseManager.getInstance();
    const user = await dbManager.Login(email, password);

    if (!user) {
      return { error: "Invalid email or password" };
    }

    // Store the actual user ID in the cookie
    const cookie = await cookies();
    cookie.set("user_id", user.getId().toString(), {
      httpOnly: true, // For security, prevent JavaScript access
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      maxAge: 60 * 60 * 24 * 7, // 1 week expiration
      path: "/", // Available across the entire site
    });
    console.log("Logged In as", user.getEmail());

    return { error: "", success: true, newLogin: true };
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Registration function that creates new user accounts
 * Uses the backend DatabaseManager to securely store user credentials
 */
export async function register(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    // Extract registration details from form data
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // Validate that all required fields are provided
    if (!email || !password || !confirmPassword) {
      return { error: "All fields are required" };
    }

    // Validate that passwords match
    if (password !== confirmPassword) {
      return { error: "Passwords do not match" };
    }

    // Get the database manager singleton instance
    const dbManager = DatabaseManager.getInstance();

    // Attempt to register the user
    // The Register method handles password hashing and storage
    const user = await dbManager.Register(email, password);

    // If registration failed, return an error
    if (!user) {
      return {
        error:
          "Registration failed. Email may already be in use or an administrator account already exists.",
      };
    }

    // Automatically log the user in after successful registration
    const cookie = await cookies();
    cookie.set("user_id", user.getId().toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    // Return success
    return { error: "", success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "An unexpected error occurred" };
  }
}

/**
 * Logout function that clears the user session
 * Removes the user_id cookie and redirects to the login page
 */
export async function logout() {
  const cookie = await cookies();
  cookie.delete("user_id");
  redirect("/login");
}

/**
 * Get the current authenticated user
 * Retrieves the user from the database based on the user_id cookie
 * @returns SerializedUser object if authenticated, null otherwise
 */
export async function getCurrentUser(): Promise<SerializedUser | null> {
  const cookie = await cookies();
  const userId = cookie.get("user_id")?.value;

  // If no user ID in cookies, user is not authenticated
  if (!userId) {
    return null;
  }

  // Fetch the complete user object from the database
  const dbManager = DatabaseManager.getInstance();
  const user = await dbManager.getAccount(parseInt(userId));

  if (!user) {
    return null;
  }

  // Convert User class to a serializable object
  return serializeUser(user);
}

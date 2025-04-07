"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getCurrentUser } from "@/actions/loginauth";
import { SerializedUser } from "@/backend/serializedTypes";

type UserContextType = {
  user: SerializedUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

// Create a standalone refresh function that can be imported directly
// without using hooks
let refreshUserFunction: (() => Promise<void>) | null = null;

export async function refreshUserData(): Promise<void> {
  if (refreshUserFunction) {
    return refreshUserFunction();
  }
  // Fallback if the context isn't initialized
  console.warn("User context not initialized, refreshing directly");
  try {
    await getCurrentUser();
  } catch (error) {
    console.error("Failed to refresh user data:", error);
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SerializedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  // Store the refresh function in the module-level variable
  // so it can be accessed directly without hooks
  refreshUserFunction = refreshUser;

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { DatabaseManager } from "@/backend/db/databaseManager";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  const dbManager = DatabaseManager.getInstance();
  const user = await dbManager.Login(email, password);

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // Set authentication cookie or token
  const cookieStore = cookies();
  cookieStore.set("user_id", user.getId().toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return NextResponse.json({
    success: true,
    user: {
      id: user.getId(),
      firstName: user.getFirstName(),
      familyName: user.getFamilyName(),
      email: user.getEmail(),
      role: user.getEmployeeRole().getType(),
    },
  });
}

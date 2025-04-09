import { DatabaseManager } from "@/backend/db/databaseManager";
import { EmployeeClassification } from "@/backend/user";
import { SerializableUser } from "@/app/dashboard/admin/manage-accounts/page";

export async function fetchAllUsers(): Promise<SerializableUser[]> {
  const db = DatabaseManager.getInstance();
  try {
    const users = await db.getAllAccounts();
    return users.map((user) => ({
      id: user.getId(),
      createdAt: user.getCreatedAt().toISOString(),
      firstName: user.getFirstName(),
      familyName: user.getFamilyName(),
      email: user.getEmail(),
      employeeClassification:
        EmployeeClassification[user.getEmployeeClassification()],
      region: user.getRegion(),
      employeeRole: {
        employeeType: user.getEmployeeRole().getType(),
      },
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
}

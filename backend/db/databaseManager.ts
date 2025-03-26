import { eq } from "drizzle-orm";
import { EmployeeClassification, User } from "../user";
import { db } from "./drizzle";
import { usersTable } from "./schema";
import { GeneralStaff } from "../employee/generalStaff";

export class DatabaseManager {
    static #instance: DatabaseManager;

    private constructor() { }

    public static getInstance(): DatabaseManager {
        if (!this.#instance) {
            this.#instance = new DatabaseManager();
        }
        return this.#instance;
    }

    async getAccount(userId: number): Promise<User | null> {
        const result = await db.select().from(usersTable).where(eq(usersTable.id, userId));
        if (result.length === 0 || result.length > 1) {
            return null;
        }
        return new User({
            id: result[0].id,
            createdAt: result[0].createdAt,
            firstName: result[0].firstName,
            familyName: result[0].familyName,
            email: result[0].email,
            employeeClassification: EmployeeClassification.Internal,
            region: result[0].region,
            employeeRole: new GeneralStaff()
        })
    }
}
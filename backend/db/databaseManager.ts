import { eq } from "drizzle-orm";
import { EmployeeClassification, User } from "../user";
import { db } from "./drizzle";
import { lineManagersTable, usersTable } from "./schema";
import { GeneralStaff } from "../employee/generalStaff";
import { Claim } from "../claims/claim";
import { type EmployeeRole, EmployeeType } from "../employee/employeeRole";
import { LineManager } from "../employee/lineManager";
import { Administrator } from "../employee/administrator";
import { PayrollOfficer } from "../employee/payrollOfficer";
import { Consultant } from "../employee/consultant";

export class DatabaseManager {
    static #instance: DatabaseManager;

    private constructor() { }

    public static getInstance(): DatabaseManager {
        if (!this.#instance) {
            this.#instance = new DatabaseManager();
        }
        return this.#instance;
    }

    async getUsersForRegion(region: string): Promise<User[]> {
        const result = await db.select().from(usersTable).where(eq(usersTable.region, region));
        return result.map((row) => {
            return new User({
                id: row.id,
                createdAt: row.createdAt,
                firstName: row.firstName,
                familyName: row.familyName,
                email: row.email,
                employeeClassification: row.employeeClassification === "Internal" ? EmployeeClassification.Internal : EmployeeClassification.External,
                region: row.region,
                employeeRole: new GeneralStaff()
            })
        });
    }

    async addAccount(user: User): Promise<User | null> {
        const insert = await db.insert(usersTable).values({
            firstName: user.getName(),
            familyName: user.getName(),
            email: user.getEmail(),
            employeeClassification: user.getEmployeeClassification() === EmployeeClassification.Internal ? "Internal" : "External",
            employeeRole: user.getEmployeeRole().getType(),
            region: user.getRegion()
        }).returning();

        if (insert.length !== 1) {
            return null;
        }

        const employeeRole = await this.getEmployeeRole(insert[0].id, user.getEmployeeRole().getType());
        if (!employeeRole) {
            return null;
        }

        return new User({
            id: insert[0].id,
            createdAt: insert[0].createdAt,
            firstName: insert[0].firstName,
            familyName: insert[0].familyName,
            email: insert[0].email,
            employeeClassification: insert[0].employeeClassification === "Internal" ? EmployeeClassification.Internal : EmployeeClassification.External,
            region: insert[0].region,
            employeeRole: employeeRole
        })
    }

    async getEmployeeRole(userId: number, employeeType: EmployeeType): Promise<EmployeeRole | null> {
        let employeeRole: EmployeeRole | null = null;
        switch (employeeType) {
            case EmployeeType.LineManager:
                const employees = await this.getManagersEmployees(userId);
                employeeRole = new LineManager(employees);
                break;
            case EmployeeType.Administrator:
                employeeRole = new Administrator();
                break;
            case EmployeeType.GeneralStaff:
                employeeRole = new GeneralStaff();
                break;
            case EmployeeType.PayrollOfficer:
                employeeRole = new PayrollOfficer();
                break;
            case EmployeeType.Consultant:
                employeeRole = new Consultant();
                break;
            default:
                console.error("DatabaseManager", "Unknown employee type");
        }

        return employeeRole
    }

    async getAccount(userId: number): Promise<User | null> {
        const result = await db.select().from(usersTable).where(eq(usersTable.id, userId));
        if (result.length === 0 || result.length > 1) {
            return null;
        }

        const employeeRole = await this.getEmployeeRole(result[0].id, result[0].employeeRole as EmployeeType);
        if (!employeeRole) {
            return null;
        }
        if (employeeRole) {
            const lineManager = await this.getLineManager(userId);
            if (lineManager) {
                employeeRole.setLineManager(lineManager);
            } else {
                console.warn("DatabaseManager", "No line manager found for user", userId);
            }
        }

        return new User({
            id: result[0].id,
            createdAt: result[0].createdAt,
            firstName: result[0].firstName,
            familyName: result[0].familyName,
            email: result[0].email,
            employeeClassification: result[0].employeeClassification === "Internal" ? EmployeeClassification.Internal : EmployeeClassification.External,
            region: result[0].region,
            employeeRole: employeeRole
        })
    }

    async getManagersEmployees(managerUserId: number): Promise<User[]> {
        const employees = await db.select().from(lineManagersTable).where(eq(lineManagersTable.lineManagerId, managerUserId)).innerJoin(usersTable, eq(lineManagersTable.employeeId, usersTable.id));
        console.log("DatabaseManager", "getManagersEmployees", managerUserId, employees);
        const userRows = employees.map((row) => row.users_table)
        const users = []
        for (let i = 0; i < userRows.length; i++) {
            const userRow = userRows[i];
            const employeeRole = await this.getEmployeeRole(userRow.id, userRow.employeeRole as EmployeeType);
            if (!employeeRole) {
                console.error("DatabaseManager", "Failed to get employee role for user", userRow.id);
                continue;
            }
            users.push(new User({
                email: userRow.email,
                id: userRow.id,
                createdAt: userRow.createdAt,
                firstName: userRow.firstName,
                familyName: userRow.familyName,
                employeeClassification: userRow.employeeClassification === "Internal" ? EmployeeClassification.Internal : EmployeeClassification.External,
                region: userRow.region,
                employeeRole: employeeRole
            }))
        }

        return users;
    }

    async getLineManager(employeeUserId: number): Promise<User | null> {
        const lineManager = await db.select().from(lineManagersTable).where(eq(lineManagersTable.employeeId, employeeUserId));
        console.log("DatabaseManager", "getLineManager", employeeUserId, lineManager);
        if (lineManager.length !== 1) {
            return null;
        }

        return this.getAccount(lineManager[0].lineManagerId);
    }

    async setLineManager(employeeUserId: number, managerUserId: number): Promise<boolean> {
        const updateUser = await db.update(usersTable).set({
            lineManagerId: managerUserId
        }).where(eq(usersTable.id, employeeUserId)).returning();

        if (!updateUser) {
            return false;
        }

        const createLineManager = await db.insert(lineManagersTable).values({
            employeeId: employeeUserId,
            lineManagerId: managerUserId
        }).returning();

        return createLineManager.length === 1;
    }

    async addClaim(claim: Claim): Promise<boolean> {
        return false;
    }

    async updateClaim(claim: Claim): Promise<boolean> {
        return false;
    }

    async getClaim(claimId: number): Promise<Claim | null> {
        return null;
    }


}
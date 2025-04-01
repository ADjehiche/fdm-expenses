import { User } from "../user";
import { EmployeeClassification } from "../user";
import { GeneralStaff } from "./generalStaff";
import { EmployeeRole, EmployeeType } from "./employeeRole";
import { DatabaseManager } from "../db/databaseManager";

export class Administrator extends EmployeeRole {
    private employeeType: EmployeeType = EmployeeType.Administrator;

    constructor(userId: number) {
        super(userId);
    }

    getType(): EmployeeType {
        return this.employeeType;
    }

    async createAccount({
        id,
        firstName,
        familyName,
        email,
        plainPassword,
        region
    }: {
        id: number,
        firstName: string,
        familyName: string,
        email: string,
        plainPassword: string,
        region: string
    }): Promise<User | null> {
        const newUser = new User({
            id,
            createdAt: new Date(),
            firstName,
            familyName,
            email,
            employeeClassification: EmployeeClassification.Internal,
            region: region,
            employeeRole: new GeneralStaff(-1)
        })

        const db = DatabaseManager.getInstance();
        if (!db) return null;

        return await db.addAccount(newUser, plainPassword);
    }

    async deleteAccount(userId: number): Promise<boolean> {
        const db = DatabaseManager.getInstance();
        return await db.deleteAccount(userId);
    }

    async changeRole(userId: number, role: EmployeeType): Promise<boolean> {
        const db = DatabaseManager.getInstance();
        return db.setEmployeeRole(userId, role);
    }

    async getAccounts(): Promise<User[]> {
        const db = DatabaseManager.getInstance();
        return await db.getAllAccounts();
    }

    async setEmployeesLineManager(employeeUserId: number, managerUserId: number): Promise<boolean> {
        const db = DatabaseManager.getInstance();
        return db.setLineManager(employeeUserId, managerUserId);
    }

    async changeEmployeesRegion(employeeUserId: number, region: string) {
        const db = DatabaseManager.getInstance();
        return db.setEmployeeRegion(employeeUserId, region);
    }

    async changeEmployeesEmail(employeeUserId: number, email: string) {
        const db = DatabaseManager.getInstance();
        return db.setEmployeeEmail(employeeUserId, email);
    }
}
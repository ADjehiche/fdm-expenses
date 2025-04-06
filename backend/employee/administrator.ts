import { User } from "../user";
import { EmployeeClassification } from "../user";
import { GeneralStaff } from "./generalStaff";
import { EmployeeRole, EmployeeType } from "./employeeRole";
import { DatabaseManager } from "../db/databaseManager";
import { getEmployeeClassification, getEmployeeType } from "./utils";

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
        region,
        classification,
        role
    }: {
        id: number,
        firstName: string,
        familyName: string,
        email: string,
        plainPassword: string,
        region: string,
        classification?: string,
        role?: string
    }): Promise<User | null> {
        const newEmployeeClassification = classification ? getEmployeeClassification(classification) : EmployeeClassification.Internal;
        const newEmployeeRole = role ? getEmployeeType(role) : EmployeeType.GeneralStaff;

        if (!newEmployeeClassification || !newEmployeeRole) {
            console.error("Invalid employee classification or type", classification, role);
            return null;
        }

        const newUser = new User({
            id,
            createdAt: new Date(),
            firstName,
            familyName,
            email,
            employeeClassification: newEmployeeClassification,
            region: region,
            employeeRole: new GeneralStaff(-1)
        })

        const db = DatabaseManager.getInstance();
        if (!db) return null;

        const newAccount = await db.addAccount(newUser, plainPassword);

        if (!newAccount) {
            console.error("Failed to create new account");
            return null;
        }

        if (newEmployeeRole == EmployeeType.GeneralStaff) {
            // if role is not given, the default is GeneralStaff so add it to the database
            return newAccount;
        }

        const changeRole = await this.changeRole(newAccount.getId(), newEmployeeRole);
        if (!changeRole) {
            console.error("Failed to change role");
            return newAccount;
        }
        return await db.getAccount(newAccount.getId());
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
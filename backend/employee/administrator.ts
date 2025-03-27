import { User } from "../user";
import { EmployeeClassification } from "../user";
import { GeneralStaff } from "./generalStaff";
import { EmployeeRole, EmployeeType } from "./employeeRole";
import { DatabaseManager } from "../db/databaseManager";

export class Administrator extends EmployeeRole {
    private employeeType: EmployeeType = EmployeeType.Administrator;

    constructor() {
        super();
    }

    getType(): EmployeeType {
        return this.employeeType;
    }

    createAccount({
        id,
        firstName,
        familyName,
        email,
        hashedPassword,
        region
    }: {
        id: number,
        firstName: string,
        familyName: string,
        email: string,
        hashedPassword: string,
        region: string
    }): User {
        return new User({
            id,
            createdAt: new Date(),
            firstName,
            familyName,
            email,
            employeeClassification: EmployeeClassification.Internal,
            region: "UK",
            employeeRole: new GeneralStaff()
        })
    }

    deleteAccount(user: User): boolean {
        return false;
    }

    changeRole(userId: string, role: EmployeeRole): boolean {
        return false;
    }

    getAccounts(): User[] {
        return [];
    }

    async setEmployeesLineManager(employeeUserId: number, managerUserId: number): Promise<boolean> {
        const db = DatabaseManager.getInstance();
        return db.setLineManager(employeeUserId, managerUserId);
    }

    changeEmployeesRegion(employeeUserId: string, region: string) {
    }

    changeEmployeesEmail(employeeUserId: string, email: string) {
    }
}
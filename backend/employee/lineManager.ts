import { Claim, ClaimStatus } from "../claims/claim";
import { DatabaseManager } from "../db/databaseManager";
import { User } from "../user";
import { EmployeeRole, EmployeeType } from "./employeeRole";

export class LineManager extends EmployeeRole {
    private employeeType: EmployeeType = EmployeeType.LineManager;
    private employees: User[] = [];

    constructor(userId: number, employees: User[]) {
        super(userId);
        this.employees = employees;
    }

    getType(): EmployeeType {
        return this.employeeType;
    }

    getEmployees(): User[] {
        return this.employees;
    }

    addEmployee(employee: User): void {
        this.employees.push(employee);
    }

    removeEmployee(employee: User): void {
        this.employees = this.employees.filter(e => e.getId() !== employee.getId());
    }

    async getEmployeeSubmittedClaims(): Promise<Claim[]> {
        const db = DatabaseManager.getInstance();
        return await db.getClaimsByManager(this.getUserId());
    }

    async approveClaim(claim: Claim): Promise<Claim | null> {
        const db = DatabaseManager.getInstance();
        const result = await db.updateClaimStatus(claim.getId(), ClaimStatus.ACCEPTED);
        if (!result) return null;
        claim.setStatus(ClaimStatus.ACCEPTED);
        return claim;
    }

    async rejectClaim(claim: Claim): Promise<Claim | null> {
        const db = DatabaseManager.getInstance();
        const reuslt = db.updateClaimStatus(claim.getId(), ClaimStatus.REJECTED);
        if (!reuslt) return null;
        claim.setStatus(ClaimStatus.REJECTED);
        return claim;
    }
}
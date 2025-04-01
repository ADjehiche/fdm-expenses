import { Claim, ClaimStatus } from "../claims/claim";
import { DatabaseManager } from "../db/databaseManager";
import { EmployeeRole, EmployeeType } from "./employeeRole";

export class PayrollOfficer extends EmployeeRole {
    employeeType: EmployeeType = EmployeeType.PayrollOfficer;

    constructor(userId: number) {
        super(userId);
    }

    getType(): EmployeeType {
        return this.employeeType;
    }

    async getAcceptedClaims(): Promise<Claim[]> {
        const db = DatabaseManager.getInstance();
        return await db.getAllAcceptedClaims();
    }

    async reimburseExpense(claim: Claim): Promise<boolean> {
        const db = DatabaseManager.getInstance();
        return await db.updateClaimStatus(claim.getId(), ClaimStatus.REIMBURSED);
    }
}
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

    async reimburseExpense(claim: Claim): Promise<Claim | null> {
        if (claim.getStatus() !== ClaimStatus.ACCEPTED) {
            console.error("Claim is not in accepted status", claim.getId(), claim.getStatus());
            return null;
        }
        const db = DatabaseManager.getInstance();
        const update = await db.updateClaimStatus(claim.getId(), ClaimStatus.REIMBURSED);
        if (!update) {
            console.error("Failed to update claim status to reimbursed", claim.getId());
            return null;
        }
        claim.setStatus(ClaimStatus.REIMBURSED);
        return claim;
    }
}
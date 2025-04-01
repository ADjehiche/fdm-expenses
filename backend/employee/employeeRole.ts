import { Claim, ClaimStatus } from "../claims/claim";
import { DatabaseManager } from "../db/databaseManager";
import { User } from "../user";

export enum EmployeeType {
    LineManager = "Line Manager",
    PayrollOfficer = "Payroll Officer",
    Administrator = "Administrator",
    GeneralStaff = "General Staff",
    Consultant = "Consultant"
}

export abstract class EmployeeRole {
    private userId: number = -1;
    private lineManager: User | null = null;
    abstract getType(): EmployeeType;

    constructor(userId: number) {
        this.userId = userId;
    }

    getLineManager(): User | null {
        return this.lineManager;
    }

    getUserId(): number {
        return this.userId;
    }

    setLineManager(lineManager: User): void {
        this.lineManager = lineManager;
    }

    async createDraftClaim(): Promise<Claim | null> {
        const db = DatabaseManager.getInstance();
        const claim = new Claim({
            id: 0,
            employeeId: this.userId,
            status: ClaimStatus.DRAFT,
            attemptCount: 0,
            createdAt: new Date(),
            amount: 0,
            lastUpdated: new Date(),
            evidence: [],
            feedback: ""
        });
        return await db.addClaim(claim);
    }

    async submitClaim(claim: Claim): Promise<Claim | null> {
        if (claim.getStatus() !== ClaimStatus.DRAFT) {
            return null;
        }

        const db = DatabaseManager.getInstance();
        const result = db.updateClaimStatus(claim.getId(), ClaimStatus.PENDING);
        if (!result) return null;

        claim.setStatus(ClaimStatus.PENDING);
        return claim;
    }

    async appealClaim(claim: Claim): Promise<Claim | null> {
        if (claim.getStatus() !== ClaimStatus.DRAFT) {
            return null;
        }

        const db = DatabaseManager.getInstance();
        const result = db.updateClaimStatus(claim.getId(), ClaimStatus.PENDING);
        if (!result) return null;
        const result2 = db.updateClaimAttemptCount(claim.getId(), claim.getAttemptCount() + 1);
        if (!result2) return null;

        claim.setStatus(ClaimStatus.PENDING);
        claim.setAttemptCount(claim.getAttemptCount() + 1);
        return claim;
    }

    async getClaimsByStatus(status: ClaimStatus): Promise<Claim[]> {
        const db = DatabaseManager.getInstance();
        return await db.getOwnClaimsByStatus(this.userId, status);
    }
}
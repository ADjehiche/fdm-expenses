import { desc } from "drizzle-orm";
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

    async createDraftClaim({
        title,
        description,
        category,
        currency,
        amount,
        accountName,
        accountNumber,
        sortCode,
    }: {
        title: string
        description: string
        category: string
        currency: string
        amount?: number,
        accountName?: string,
        accountNumber?: string,
        sortCode?: string,
    }): Promise<Claim | null> {
        const db = DatabaseManager.getInstance();
        const claim = new Claim({
            id: 0,
            employeeId: this.userId,

            status: ClaimStatus.DRAFT,
            attemptCount: 0,
            
            amount: amount ?? 0,
            evidence: [],
            feedback: "",

            accountName: accountName ?? null,
            accountNumber: accountNumber ?? null,
            sortCode: sortCode ?? null,

            title:title,
            description:description,
            currency:currency,
            category:category,

            createdAt: new Date(),
            lastUpdated: new Date(),
        });
        return await db.addClaim(claim);
    }

    async updateClaimBankAccountDetails(claim: Claim, updateClaimBankAccountDetails: {
        accountName: string | undefined,
        accountNumber: string | undefined,
        sortCode: string | undefined
    }): Promise<Claim | null> {
        const db = DatabaseManager.getInstance();
        if (claim.getStatus() == ClaimStatus.REIMBURSED) {
            console.error("Claim is already reimbursed", claim.getId());
            return null;
        }
        if (claim.getEmployeeId() !== this.userId) {
            console.error("Claim does not belong to this employee", claim.getId(), claim.getEmployeeId(), this.userId);
            return null;
        }
        const updateClaim = await db.updateClaimBankDetails(claim.getId(), updateClaimBankAccountDetails);
        if (!updateClaim) {
            console.error("Failed to update claim bank account details", claim.getId());
            return null;
        }

        if (updateClaimBankAccountDetails.accountName) claim.setAccountName(updateClaimBankAccountDetails.accountName);
        if (updateClaimBankAccountDetails.accountNumber) claim.setAccountNumber(updateClaimBankAccountDetails.accountNumber);
        if (updateClaimBankAccountDetails.sortCode) claim.setSortCode(updateClaimBankAccountDetails.sortCode);
        claim.setLastUpdated(new Date());
        return claim;
    }

    async submitClaim(claim: Claim): Promise<Claim | null> {
        if (claim.getStatus() !== ClaimStatus.DRAFT) {
            console.error("Claim is not in draft status", claim.getId(), claim.getStatus());
            return null;
        }
        if (claim.getAttemptCount() >= Claim.MAX_ATTEMPT_COUNT) {
            console.error("Claim has reached maximum attempt count", claim.getId(), claim.getAttemptCount());
            return null;
        }
        if (claim.getEmployeeId() !== this.userId) {
            console.error("Claim does not belong to this employee", claim.getId(), claim.getEmployeeId(), this.userId);
            return null;
        }

        const db = DatabaseManager.getInstance();
        const result = db.updateClaimStatus(claim.getId(), ClaimStatus.PENDING);
        if (!result) return null;
        const result2 = db.updateClaimAttemptCount(claim.getId(), claim.getAttemptCount() + 1);
        if (!result2) return null;

        claim.setStatus(ClaimStatus.PENDING);
        claim.setAttemptCount(claim.getAttemptCount() + 1);
        claim.setLastUpdated(new Date());
        return claim;
    }

    async appealClaim(claim: Claim): Promise<Claim | null> {
        if (claim.getStatus() !== ClaimStatus.REJECTED) {
            console.error("Claim is not in rejected status", claim.getId(), claim.getStatus());
            return null;
        }
        if (claim.getAttemptCount() >= Claim.MAX_ATTEMPT_COUNT) {
            console.error("Claim has reached maximum attempt count", claim.getId(), claim.getAttemptCount());
            return null;
        }
        if (claim.getEmployeeId() !== this.userId) {
            console.error("Claim does not belong to this employee", claim.getId(), claim.getEmployeeId(), this.userId);
            return null;
        }

        const db = DatabaseManager.getInstance();
        const result = db.updateClaimStatus(claim.getId(), ClaimStatus.PENDING);
        if (!result) return null;
        const result2 = db.updateClaimAttemptCount(claim.getId(), claim.getAttemptCount() + 1);
        if (!result2) return null;

        claim.setStatus(ClaimStatus.PENDING);
        claim.setAttemptCount(claim.getAttemptCount() + 1);
        claim.setLastUpdated(new Date());
        return claim;
    }

    async updateClaimAmount(claim: Claim, amount: number): Promise<Claim | null> {
        if (claim.getStatus() !== ClaimStatus.DRAFT && claim.getStatus() !== ClaimStatus.PENDING) {
            console.error("Claim is not in draft status", claim.getId(), claim.getStatus());
            return null;
        }
        if (claim.getEmployeeId() !== this.userId) {
            console.error("Claim does not belong to this employee", claim.getId(), claim.getEmployeeId(), this.userId);
            return null;
        }
        const db = DatabaseManager.getInstance();
        const result = await db.updateClaimAmount(claim.getId(), amount);
        if (!result) {
            console.error("Failed to update claim amount", claim.getId());
            return null;
        }
        claim.setAmount(amount);
        claim.setLastUpdated(new Date());
        return claim;
    }

    async getClaimsByStatus(status: ClaimStatus): Promise<Claim[]> {
        const db = DatabaseManager.getInstance();
        return await db.getOwnClaimsByStatus(this.userId, status);
    }
}
import { DatabaseManager } from "../db/databaseManager";

export class Claim {
    private id: number;
    private createdAt: Date;
    private amount: number;
    private attemptCount: number;
    private employeeId: number;
    private lastUpdated: Date;
    private status: ClaimStatus;
    private evidence: Array<string>;
    private feedback: string;

    private accountName: string | null;
    private accountNumber: string | null;
    private sortCode: string | null;

    static MAX_ATTEMPT_COUNT = 3;

    constructor({
        id,
        createdAt,
        amount,
        lastUpdated,
        attemptCount,
        employeeId,
        status,
        evidence,
        feedback,
        accountName,
        accountNumber,
        sortCode
    }: {
        id: number,
        createdAt: Date,
        amount: number,
        attemptCount: number,
        employeeId: number,
        lastUpdated: Date,
        status: ClaimStatus,
        evidence: Array<string>,
        feedback: string,
        accountName: string | null,
        accountNumber: string | null,
        sortCode: string | null
    }) {
        this.id = id;
        this.createdAt = createdAt;
        this.amount = amount;
        this.attemptCount = attemptCount;
        this.lastUpdated = lastUpdated;
        this.employeeId = employeeId;
        this.status = status;
        this.evidence = evidence;
        this.feedback = feedback;

        this.accountName = accountName;
        this.accountNumber = accountNumber;
        this.sortCode = sortCode;
    }

    public getId(): number {
        return this.id;
    }

    public getStatus(): ClaimStatus {
        return this.status;
    }
    public setStatus(newStatus: ClaimStatus): void {
        this.status = newStatus;
    }

    public getAccountName(): string | null { return this.accountName; }
    public setAccountName(accountName: string): void { this.accountName = accountName; }

    public getAccountNumber(): string | null { return this.accountNumber; }
    public setAccountNumber(accountNumber: string): void { this.accountNumber = accountNumber; }

    public getSortCode(): string | null { return this.sortCode; }
    public setSortCode(sortCode: string): void { this.sortCode = sortCode; }

    public getAllEvidence(): Array<string> { return this.evidence; }
    public getEvidenceFile(evidenceName: string): File | null {
        const db = DatabaseManager.getInstance();

        const evidenceNameInClaim = this.evidence.find(evidence => evidence === evidenceName);
        if (!evidenceNameInClaim) {
            console.error("ERROR - Evidence not found in claim", evidenceName, this.id);
            return null;
        }

        return db.getClaimEvidenceFile(this.id, evidenceName);
    }
    public async addEvidence(evidenceFile: File): Promise<boolean> {
        if (this.status !== ClaimStatus.DRAFT && this.status !== ClaimStatus.PENDING) {
            console.error("ERROR - Claim has to be in draft state to add evidence", this.id, this.status);
            return false;
        }
        const db = DatabaseManager.getInstance();
        const evidenceSaved = await db.addEvidence(this.id, evidenceFile);
        if (!evidenceSaved) {
            console.error("Failed to save evidence", evidenceFile);
            return false;
        }
        this.evidence.push(evidenceFile.name);
        const updateTime = db.updateClaimLastUpdated(this.id);
        if (!updateTime) return false;
        this.setLastUpdated(new Date());
        return true;
    }
    public async removeEvidence(evidencePath: string): Promise<boolean> {
        if (this.status !== ClaimStatus.DRAFT) {
            console.error("ERROR - Claim has to be in draft state to remove evidence", this.id, this.status);
            return false;
        }
        const db = DatabaseManager.getInstance();
        const evidenceRemoved = await db.removeEvidence(this.id, evidencePath);
        if (!evidenceRemoved) {
            console.error("Failed to remove evidence", evidencePath);
            return false;
        }
        this.evidence = this.evidence.filter(evidence => evidence !== evidencePath);
        const updateTime = db.updateClaimLastUpdated(this.id);
        if (!updateTime) return false;
        this.setLastUpdated(new Date());
        return true;
    }

    public getAmount(): number { return this.amount; }
    public setAmount(amount: number): void { this.amount = amount; }

    public getCreatedAt(): Date { return this.createdAt; }
    public getLastUpdated(): Date { return this.lastUpdated; }

    public getFeedback(): string { return this.feedback; }
    public setFeedback(feedback: string): void { this.feedback = feedback }

    public getAttemptCount(): number { return this.attemptCount; }
    public setAttemptCount(attemptCount: number): void { this.attemptCount = attemptCount; }

    public getEmployeeId(): number { return this.employeeId; }
    public setEmployeeId(employeeId: number): void { this.employeeId = employeeId; }

    public setLastUpdated(lastUpdated: Date): void { this.lastUpdated = lastUpdated; }
    public incrementAttemptCount(): void { this.attemptCount++; }
}

export enum ClaimStatus {
    DRAFT = "Draft",
    PENDING = "Pending",
    REJECTED = "Rejected",
    ACCEPTED = "Accepted",
    REIMBURSED = "Reimbursed",
}

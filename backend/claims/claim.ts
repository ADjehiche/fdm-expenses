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
        feedback
    }: {
        id: number,
        createdAt: Date,
        amount: number,
        attemptCount: number,
        employeeId: number,
        lastUpdated: Date,
        status: ClaimStatus,
        evidence: Array<string>,
        feedback: string
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

    public getEvidence(): Array<string> { return this.evidence; }
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
        return true;
    }
    public removeEvidence(evidencePath: string): void {
        if (this.status !== ClaimStatus.DRAFT) {
            console.error("ERROR - Claim has to be in draft state to remove evidence", this.id, this.status);
            return;
        }
        this.evidence = this.evidence.filter(evidence => evidence !== evidencePath);
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
}

export enum ClaimStatus {
    DRAFT = "Draft",
    PENDING = "Pending",
    REJECTED = "Rejected",
    ACCEPTED = "Accepted",
    REIMBURSED = "Reimbursed",
}

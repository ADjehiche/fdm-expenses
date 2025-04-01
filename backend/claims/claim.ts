export class Claim {
    private id: number;
    private createdAt: Date;
    private amount: number;
    private attemptCount: number;
    private employeeId: number;
    private lastUpdated: Date;
    private status: ClaimStatus;
    private evidence: Array<File>;
    private feedback: string;

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
        evidence: Array<File>,
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

    public getEvidence(): Array<File> { return this.evidence; }
    public addEvidence(evidence: File): void { this.evidence.push(evidence); }
    public removeEvidence(evidence: File): void { }

    public appealClaim(): void { }
    public submitClaim(): void { }

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

export class Claim {
    private id: string;
    private createdAt: Date;
    private amount: number;
    private lastUpdated: Date;
    private status: ClaimStatus;
    private evidence: Array<File>;
    private feedback: string;

    constructor({
        id,
        createdAt,
        amount,
        lastUpdated,
        status,
        evidence,
        feedback
    }: {
        id: string,
        createdAt: Date,
        amount: number,
        lastUpdated: Date,
        status: ClaimStatus,
        evidence: Array<File>,
        feedback: string
    }) {
        this.id = id;
        this.createdAt = createdAt;
        this.amount = amount;
        this.lastUpdated = lastUpdated;
        this.status = status;
        this.evidence = evidence;
        this.feedback = feedback;
    }

    public getId(): string {
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
}

export enum ClaimStatus {
    DRAFT = "Draft",
    PENDING = "Pending",
    REJECTED = "Rejected",
    ACCEPTED = "Accepted",
    REIMBURSED = "Reimbursed",
}

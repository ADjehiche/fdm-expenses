import { desc } from "drizzle-orm";
import { DatabaseManager } from "../db/databaseManager";

export class Claim {
  private id: number;
  private employeeId: number;
  private attemptCount: number;
  private status: ClaimStatus;

  private currency: string;
  private amount: number;
  private evidence: Array<string>;
  private feedback: string;

  private accountName: string | null;
  private accountNumber: string | null;
  private sortCode: string | null;

  private title: string;
  private description: string;
  private category: string;

  private createdAt: Date;
  private lastUpdated: Date;

  static MAX_ATTEMPT_COUNT = 3;

  constructor({
    id,
    employeeId,
    status,
    attemptCount,

    amount,
    evidence,
    feedback,

    accountName,
    accountNumber,
    sortCode,

    title,
    description,
    category,
    currency,

    createdAt,
    lastUpdated,
  }: {
    id: number;
    employeeId: number;
    status: ClaimStatus;
    attemptCount: number;

    amount: number;
    evidence: Array<string>;
    feedback: string;
    accountName: string | null;
    accountNumber: string | null;
    sortCode: string | null;

    title: string;
    description: string;
    category: string;
    currency: string;

    createdAt: Date;
    lastUpdated: Date;
  }) {
    this.id = id;
    this.employeeId = employeeId;
    this.attemptCount = attemptCount;
    this.status = status;

    this.title = title;
    this.description = description;
    this.category = category;

    this.currency = currency;
    this.amount = amount;
    this.evidence = evidence;
    this.feedback = feedback;

    this.accountName = accountName;
    this.accountNumber = accountNumber;
    this.sortCode = sortCode;

    this.createdAt = createdAt;
    this.lastUpdated = lastUpdated;
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

  public getAccountName(): string | null {
    return this.accountName;
  }
  public setAccountName(accountName: string): void {
    this.accountName = accountName;
  }

  public getAccountNumber(): string | null {
    return this.accountNumber;
  }
  public setAccountNumber(accountNumber: string): void {
    this.accountNumber = accountNumber;
  }

  public getSortCode(): string | null {
    return this.sortCode;
  }
  public setSortCode(sortCode: string): void {
    this.sortCode = sortCode;
  }

  public getAllEvidence(): Array<string> {
    return this.evidence;
  }
  public getEvidenceFile(evidenceName: string): File | null {
    const db = DatabaseManager.getInstance();

    const evidenceNameInClaim = this.evidence.find(
      (evidence) => evidence === evidenceName
    );
    if (!evidenceNameInClaim) {
      console.error(
        "ERROR - Evidence not found in claim",
        evidenceName,
        this.id
      );
      return null;
    }

    return db.getClaimEvidenceFile(this.id, evidenceName);
  }
  public async addEvidence(evidenceFile: File): Promise<boolean> {
    if (
      this.status !== ClaimStatus.DRAFT &&
      this.status !== ClaimStatus.PENDING
    ) {
      console.error(
        "ERROR - Claim has to be in draft state to add evidence",
        this.id,
        this.status
      );
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
    if (
      this.status !== ClaimStatus.DRAFT &&
      this.status !== ClaimStatus.REJECTED
    ) {
      console.error(
        "ERROR - Claim has to be in draft or rejected state to remove evidence",
        this.id,
        this.status
      );
      return false;
    }
    const db = DatabaseManager.getInstance();
    const evidenceRemoved = await db.removeEvidence(this.id, evidencePath);
    if (!evidenceRemoved) {
      console.error("Failed to remove evidence", evidencePath);
      return false;
    }
    this.evidence = this.evidence.filter(
      (evidence) => evidence !== evidencePath
    );
    const updateTime = db.updateClaimLastUpdated(this.id);
    if (!updateTime) return false;
    this.setLastUpdated(new Date());
    return true;
  }

  public getAmount(): number {
    return this.amount;
  }
  public setAmount(amount: number): void {
    this.amount = amount;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }
  public getLastUpdated(): Date {
    return this.lastUpdated;
  }

  public getFeedback(): string {
    return this.feedback;
  }
  public setFeedback(feedback: string): void {
    this.feedback = feedback;
  }

  public getAttemptCount(): number {
    return this.attemptCount;
  }
  public setAttemptCount(attemptCount: number): void {
    this.attemptCount = attemptCount;
  }
  public incrementAttemptCount(): void {
    this.attemptCount++;
  }

  public getEmployeeId(): number {
    return this.employeeId;
  }
  public setEmployeeId(employeeId: number): void {
    this.employeeId = employeeId;
  }

  public setLastUpdated(lastUpdated: Date): void {
    this.lastUpdated = lastUpdated;
  }

  public getTitle(): string {
    return this.title;
  }
  public setTitle(s: string) {
    this.title = s;
  }

  public getDescription(): string {
    return this.description;
  }
  public setDescription(s: string) {
    this.description = s;
  }

  public getCategory(): string {
    return this.category;
  }
  public setCategory(s: string) {
    this.category = s;
  }

  public getCurrency(): string {
    return this.currency;
  }
  public setCurrency(s: string) {
    this.currency = s;
  }
}

export enum ClaimStatus {
  DRAFT = "Draft",
  PENDING = "Pending",
  REJECTED = "Rejected",
  ACCEPTED = "Accepted",
  REIMBURSED = "Reimbursed",
}

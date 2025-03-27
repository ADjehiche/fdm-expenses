import { Claim, ClaimStatus } from "../claims/claim";
import { User } from "../user";

export enum EmployeeType {
    LineManager = "Line Manager",
    PayrollOfficer = "Payroll Officer",
    Administrator = "Administrator",
    GeneralStaff = "General Staff",
    Consultant = "Consultant"
}

export abstract class EmployeeRole {
    private lineManager: User | null = null;
    abstract getType(): EmployeeType;

    getLineManager(): User | null {
        return this.lineManager;
    }
    setLineManager(lineManager: User): void {
        this.lineManager = lineManager;
    }
    createDraftClaim(): Claim {
        return new Claim({
            id: "",
            status: ClaimStatus.DRAFT,
            createdAt: new Date(),
            amount: 0,
            lastUpdated: new Date(),
            evidence: [],
            feedback: ""
        });
    }
    submitClaim(claim: Claim): Claim {
        return new Claim({
            id: "",
            status: ClaimStatus.DRAFT,
            createdAt: new Date(),
            amount: 0,
            lastUpdated: new Date(),
            evidence: [],
            feedback: ""
        });
    }
    appealClaim(claim: Claim): Claim {
        return new Claim({
            id: "",
            status: ClaimStatus.DRAFT,
            createdAt: new Date(),
            amount: 0,
            lastUpdated: new Date(),
            evidence: [],
            feedback: ""
        });
    }

    getClaimsByStatus(status: ClaimStatus): Claim[] {
        return [];
    }
}
import { Claim, ClaimStatus } from "../claims/claim";
import { LineManager } from "./lineManager";

export abstract class EmployeeRole {
    abstract getType(): EmployeeType;

    getLineManager(): LineManager {
        return new LineManager();
    }
    setLineManager(lineManager: LineManager): LineManager {
        return new LineManager();
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

export enum EmployeeType {
    LineManager,
    PayrollOfficer,
    Administrator,
    GeneralStaff,
    Consultant
}
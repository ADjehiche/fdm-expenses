import { Claim } from "../claims/claim";
import { EmployeeRole, EmployeeType } from "./employeeRole";

export class PayrollOfficer extends EmployeeRole {
    employeeType: EmployeeType = EmployeeType.PayrollOfficer;

    constructor() {
        super();
    }

    getType(): EmployeeType {
        return this.employeeType;
    }

    getAcceptedClaims(): Claim[] {
        return [];
    }

    reimburseExpense(claim: Claim): boolean {
        return false;
    }
}
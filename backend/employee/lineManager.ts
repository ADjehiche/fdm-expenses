import { Claim } from "../claims/claim";
import { User } from "../user";
import { EmployeeRole, EmployeeType } from "./employeeRole";

export class LineManager extends EmployeeRole {
    private employeeType: EmployeeType = EmployeeType.LineManager;
    private employees: User[] = [];

    constructor() {
        super();
    }

    getType(): EmployeeType {
        return this.employeeType;
    }

    getEmployees(): User[] {
        return this.employees;
    }

    addEmployee(employee: User): void {
        this.employees.push(employee);
    }

    removeEmployee(employee: User): void {
        this.employees = this.employees.filter(e => e.getId() !== employee.getId());
    }

    getEmployeeSubmittedClaims(employee: User): Claim[] {
        return [];
    }

    approveClaim(claim: Claim): void {
    }

    rejectClaim(claim: Claim): void {
    }
}
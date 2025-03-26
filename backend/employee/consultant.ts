import { EmployeeRole, EmployeeType } from "./employeeRole";

export class Consultant extends EmployeeRole {
    employeeType: EmployeeType = EmployeeType.Consultant;

    constructor() {
        super();
    }

    getType(): EmployeeType {
        return this.employeeType;
    }
}
import { EmployeeRole, EmployeeType } from "./employeeRole";

export class GeneralStaff extends EmployeeRole {
    employeeType: EmployeeType = EmployeeType.GeneralStaff;

    constructor() {
        super();
    }

    getType(): EmployeeType {
        return this.employeeType;
    }
}
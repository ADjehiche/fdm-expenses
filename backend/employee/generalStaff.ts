import { EmployeeRole } from "./employeeRole";
import { EmployeeType } from "./utils";

export class GeneralStaff extends EmployeeRole {
  employeeType: EmployeeType = EmployeeType.GeneralStaff;

  constructor(userId: number) {
    super(userId);
  }

  getType(): EmployeeType {
    return this.employeeType;
  }
}

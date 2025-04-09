import { EmployeeRole } from "./employeeRole";
import { EmployeeType } from "./utils";

export class Consultant extends EmployeeRole {
  employeeType: EmployeeType = EmployeeType.Consultant;

  constructor(userId: number) {
    super(userId);
  }

  getType(): EmployeeType {
    return this.employeeType;
  }
}

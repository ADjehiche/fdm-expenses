import { Claim, ClaimStatus } from "../claims/claim";
import { DatabaseManager } from "../db/databaseManager";
import { User } from "../user";
import { EmployeeRole } from "./employeeRole";
import { EmployeeType } from "./utils";

export class LineManager extends EmployeeRole {
  private employeeType: EmployeeType = EmployeeType.LineManager;
  private employees: User[] = [];

  constructor(userId: number, employees: User[]) {
    super(userId);
    this.employees = employees;
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
    this.employees = this.employees.filter(
      (e) => e.getId() !== employee.getId()
    );
  }

  async getEmployeeSubmittedClaims(): Promise<Claim[]> {
    const db = DatabaseManager.getInstance();
    return await db.getClaimsByManager(this.getUserId());
  }

  async approveClaim(claim: Claim): Promise<Claim | null> {
    if (claim.getStatus() !== ClaimStatus.PENDING) {
      console.error(
        "Claim is not in pending status",
        claim.getId(),
        claim.getStatus()
      );
      return null;
    }

    const db = DatabaseManager.getInstance();
    const result = await db.updateClaimStatus(
      claim.getId(),
      ClaimStatus.ACCEPTED
    );
    if (!result) return null;
    claim.setStatus(ClaimStatus.ACCEPTED);
    claim.setLastUpdated(new Date());
    return claim;
  }

  async rejectClaim(claim: Claim, feedback: string): Promise<Claim | null> {
    if (claim.getStatus() !== ClaimStatus.PENDING) {
      console.error(
        "Claim is not in pending status",
        claim.getId(),
        claim.getStatus()
      );
      return null;
    }
    const db = DatabaseManager.getInstance();
    const reuslt = db.updateClaimStatus(claim.getId(), ClaimStatus.REJECTED);
    if (!reuslt) return null;
    const result2 = db.updateClaimFeedback(claim.getId(), feedback);
    if (!result2) return null;

    claim.setStatus(ClaimStatus.REJECTED);
    claim.setFeedback(feedback);
    claim.setLastUpdated(new Date());
    return claim;
  }
}

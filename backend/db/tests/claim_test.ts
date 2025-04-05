import { EmployeeClassification, User } from "@/backend/user";
import { DatabaseManager } from "../databaseManager";
import { GeneralStaff } from "@/backend/employee/generalStaff";
import { ClaimStatus } from "@/backend/claims/claim";
import { Administrator } from "@/backend/employee/administrator";
import { LineManager } from "@/backend/employee/lineManager";
import { PayrollOfficer } from "@/backend/employee/payrollOfficer";
import { clearDatabase } from "./util";

async function TestClaims() {
    await (clearDatabase())
    console.log("TestClaims", "Test claims");
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager) {
        throw new Error("DatabaseManager not created");
    }
    console.log("TestClaims", "Test claim methods");

    /**
     * Test:
     * 1. Create a new employee, and check in db
     * 2. Create line manager, and check in db
     * 3. Create payroll officer, and check in db
     * 4. Create a new claim, and check in db
     * 5. Check the claim is draft
     * 6. Add evidence to claim
     * 7. Check the evidence has been added
     * 8. Submit the claim and check updated state
     * 9. Reject the claim by the line manager
     * 10. Appeal
     * 11. Accept the appeal
     * 12. Reimburse the claim by the payroll officer
     */

    const employee = await dbManager.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "employee",
        familyName: "FamilyName",
        email: "Email",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new GeneralStaff(-1),
        region: "UK",
    }), "password")

    if (!employee) {
        throw new Error("Employee Insert failed");
    }
    console.log("Employee Insert successful", `id: ${employee.getId()}`);

    const lineManager = await dbManager.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "lineManager",
        familyName: "FamilyName",
        email: "Email",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new LineManager(-1, []),
        region: "UK",
    }), "password");
    if (!lineManager) {
        throw new Error("Line Manager Insert failed");
    }
    console.log("LineManager Insert successful", `id: ${lineManager.getId()}`);

    const payrollOfficer = await dbManager.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "payrollOfficer",
        familyName: "FamilyName",
        email: "Email",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new PayrollOfficer(-1),
        region: "UK",
    }), "password");
    if (!payrollOfficer) {
        throw new Error("Payroll Officer Insert failed");
    }

    // Check if we can create a new administrator
    const administrator = await dbManager.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "administrator",
        familyName: "FamilyName",
        email: "Email",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new Administrator(-1),
        region: "UK",
    }), "password")

    if (!administrator) {
        throw new Error("Administrator Insert failed");
    }
    console.log("Administrator Insert successful", `id: ${administrator.getId()}`);

    // Get the administrator's role and make sure it is correct type
    const administratorRole = administrator.getEmployeeRole()
    console.log(administratorRole.getType())
    if (!(administratorRole instanceof Administrator)) {
        throw new Error("administratorRole is not instance of Administrator");
    }

    // Set the line manager for the employee
    const setLineManager = await administratorRole.setEmployeesLineManager(employee.getId(), lineManager.getId());
    if (!setLineManager) {
        throw new Error("Administrator setEmployeesLineManager failed");
    }
    console.log("Administrator setEmployeesLineManager successful", `employeeId: ${employee.getId()}`, `lineManagerId: ${lineManager.getId()}`);

    const newClaim = await employee.getEmployeeRole().createDraftClaim();
    if (!newClaim) {
        throw new Error("Claim Insert failed");
    }
    console.log("Claim Insert successful", `id: ${newClaim.getId()}`);

    const claimFromDb = await dbManager.getClaim(newClaim.getId());
    if (!claimFromDb) {
        throw new Error("Claim not found in db");
    }
    console.log("Claim found in db", `id: ${claimFromDb.getId()}`);
    if (claimFromDb.getStatus() !== ClaimStatus.DRAFT) {
        throw new Error("Claim status is not draft");
    }
    console.log("Claim status is draft", `status: ${claimFromDb.getStatus()}`);

    const testFileContent = "Test Evidence";
    const testFile = new File([testFileContent], "test.txt", { type: "text/plain" });
    const result = await newClaim.addEvidence(testFile);
    if (!result) {
        throw new Error("Claim evidence not added");
    }
    console.log("Claim evidence added", `evidence: ${newClaim.getEvidence()}`);

    const claimFromDb2 = await dbManager.getClaim(newClaim.getId());
    if (!claimFromDb2) {
        throw new Error("Claim not found in db");
    }
    console.log("Claim found in db", `id: ${claimFromDb2.getId()}`);
    if (claimFromDb2.getEvidence().length !== 1) {
        throw new Error("Claim evidence not found in db");
    }
    if (claimFromDb2.getEvidence()[0] !== testFile.name) {
        throw new Error("Claim evidence name not correct");
    }
    console.log("Claim evidence name correct", `evidence: ${claimFromDb2.getEvidence()}`);

    const employeeDraftClaims = await employee.getEmployeeRole().getClaimsByStatus(ClaimStatus.DRAFT);
    if (!employeeDraftClaims || employeeDraftClaims.length !== 1) {
        throw new Error("Employee draft claims not found");
    }
    console.log("Employee draft claims found", `claims: ${employeeDraftClaims.length}`);
    const submittedClaim = await employee.getEmployeeRole().submitClaim(employeeDraftClaims[0]);
    if (!submittedClaim) {
        throw new Error("Claim not submitted");
    }
    console.log("Claim submitted", `id: ${submittedClaim.getId()}, status: ${submittedClaim.getStatus()}`);
    const claimFromDb3 = await dbManager.getClaim(submittedClaim.getId());
    if (!claimFromDb3) {
        throw new Error("Claim not found in db");
    }
    console.log("Claim found in db", `id: ${claimFromDb3.getId()}`);
    if (claimFromDb3.getStatus() !== ClaimStatus.PENDING) {
        throw new Error("Claim status is not pending");
    }
    if (claimFromDb3.getAttemptCount() !== 1) {
        throw new Error(`Claim attempt count is not 1 attemptCount: ${claimFromDb3.getAttemptCount()}`);
    }
    console.log("Claim status is pending", `status: ${claimFromDb3.getStatus()}`);

    const checkDraftClaimsAgain = await employee.getEmployeeRole().getClaimsByStatus(ClaimStatus.DRAFT);
    if (!checkDraftClaimsAgain || checkDraftClaimsAgain.length !== 0) {
        throw new Error("Employee draft claims not correct");
    }
    console.log("Employee draft claims correct", `claims: ${checkDraftClaimsAgain.length}`);
    const checkPendingClaims = await employee.getEmployeeRole().getClaimsByStatus(ClaimStatus.PENDING);
    if (!checkPendingClaims || checkPendingClaims.length !== 1) {
        throw new Error("Employee pending claims not correct");
    }
    console.log("Employee pending claims correct", `claims: ${checkPendingClaims.length}`);

    const managerRole = lineManager.getEmployeeRole();
    if (!(managerRole instanceof LineManager)) {
        throw new Error("Line manager role is not instance of LineManager");
    }
    const claimsForLineManager = await managerRole.getEmployeeSubmittedClaims();
    if (!claimsForLineManager || claimsForLineManager.length !== 1) {
        throw new Error("Line manager claims not correct");
    }
    console.log("Line manager claims correct", `claims: ${claimsForLineManager.length}`);

    if (claimsForLineManager[0].getId() !== submittedClaim.getId()) {
        throw new Error("Line manager claim id not correct");
    }
    console.log("Line manager claim id correct", `id: ${claimsForLineManager[0].getId()} id: ${submittedClaim.getId()}`);

    const rejectedClaim = await managerRole.rejectClaim(claimsForLineManager[0], "");
    if (!rejectedClaim) {
        throw new Error("Claim not rejected");
    }
    console.log("Claim rejected", `id: ${rejectedClaim.getId()}, status: ${rejectedClaim.getStatus()}`);

    const employeeDraftClaimsAfterReject = await employee.getEmployeeRole().getClaimsByStatus(ClaimStatus.REJECTED);
    if (!employeeDraftClaimsAfterReject || employeeDraftClaimsAfterReject.length !== 1) {
        throw new Error("Employee draft claims not correct");
    }
    console.log("Employee draft claims correct", `claims: ${employeeDraftClaimsAfterReject.length}`);

    const appealedClaim = await employee.getEmployeeRole().appealClaim(employeeDraftClaimsAfterReject[0]);
    if (!appealedClaim) {
        throw new Error("Claim not appealed");
    }
    console.log("Claim appealed", `id: ${appealedClaim.getId()}, status: ${appealedClaim.getStatus()}`);

    const lineManagerGetAppealedClaim = await managerRole.getEmployeeSubmittedClaims();
    if (!lineManagerGetAppealedClaim || lineManagerGetAppealedClaim.length !== 1) {
        throw new Error("Line manager claims not correct");
    }
    console.log("Line manager claims correct", `claims: ${lineManagerGetAppealedClaim.length}`);
    const acceptAppeal = await managerRole.approveClaim(lineManagerGetAppealedClaim[0]);
    if (!acceptAppeal) {
        throw new Error("Claim not accepted");
    }
    console.log("Claim accepted", `id: ${acceptAppeal.getId()}, status: ${acceptAppeal.getStatus()}`);

    const payrollOfficerRole = payrollOfficer.getEmployeeRole();
    if (!(payrollOfficerRole instanceof PayrollOfficer)) {
        throw new Error("Payroll officer role is not instance of PayrollOfficer");
    }
    const payrollOfficerClaims = await payrollOfficerRole.getAcceptedClaims();
    if (!payrollOfficerClaims || payrollOfficerClaims.length !== 1) {
        throw new Error(`Payroll officer claims not correct claims: ${payrollOfficerClaims.length}`);
    }
    console.log("Payroll officer claims correct", `claims: ${payrollOfficerClaims.length}`);
    if (payrollOfficerClaims[0].getId() !== acceptAppeal.getId()) {
        throw new Error("Payroll officer claim id not correct");
    }
    console.log("Payroll officer claim id correct", `id: ${payrollOfficerClaims[0].getId()} id: ${acceptAppeal.getId()}`);

    const payrollOfficerClaim = await payrollOfficerRole.reimburseExpense(payrollOfficerClaims[0]);
    if (!payrollOfficerClaim) {
        throw new Error("Claim not reimbursed");
    }
    console.log("Claim reimbursed", `id: ${payrollOfficerClaim.getId()}, status: ${payrollOfficerClaim.getStatus()}`);

}


TestClaims();
import { EmployeeClassification, User } from "@/backend/user";
import { DatabaseManager } from "../databaseManager";
import { GeneralStaff } from "@/backend/employee/generalStaff";
import { Consultant } from "@/backend/employee/consultant";
import { Administrator } from "@/backend/employee/administrator";
import { LineManager } from "@/backend/employee/lineManager";
import { PayrollOfficer } from "@/backend/employee/payrollOfficer";

async function InsertDefaultData() {
    const db = DatabaseManager.getInstance();
    if (!db) {
        throw new Error("DatabaseManager instance is not available");
    }

    const generalEmployee = await db.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "generalStaffName",
        familyName: "FamilyName1",
        email: "general@test.com",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new GeneralStaff(-1),
        region: "UK",
    }), "pass123");

    if (!generalEmployee) {
        throw new Error("General Staff Insert failed");
    }
    console.log("General Staff Insert successful", `id: ${generalEmployee.getId()}`);

    const consultantEmployee = await db.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "consultantStaffName",
        familyName: "FamilyName2",
        email: "consultant@test.com",
        employeeClassification: EmployeeClassification.External,
        employeeRole: new Consultant(-1),
        region: "USA",
    }), "pass123");

    if (!consultantEmployee) {
        throw new Error("Consultant Insert failed");
    }

    console.log("Consultant Insert successful", `id: ${consultantEmployee.getId()}`);

    const payrollOfficer = await db.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "payrollOfficerName",
        familyName: "FamilyName3",
        email: "payrollOfficer]@test.com",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new PayrollOfficer(-1),
        region: "UK",
    }), "pass123");

    if (!payrollOfficer) {
        throw new Error("Payroll Officer Insert failed");
    }
    const payrollOfficerRole = payrollOfficer.getEmployeeRole();
    if (!(payrollOfficerRole instanceof PayrollOfficer)) {
        throw new Error("payrollOfficerRole is not instance of PayrollOfficer");
    }
    console.log("Payroll Officer Insert successful", `id: ${payrollOfficer.getId()}`);

    const administrator = await db.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "administratorName",
        familyName: "FamilyName3",
        email: "administrator@test.com",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new Administrator(-1),
        region: "UK",
    }), "pass123");
    if (!administrator) {
        throw new Error("Administrator Insert failed");
    }
    const administratorRole = administrator.getEmployeeRole();

    if (!(administratorRole instanceof Administrator)) {
        throw new Error("administratorRole is not instance of Administrator");

    }
    console.log("Administrator Insert successful", `id: ${administrator.getId()}`);

    const lineManager = await db.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "lineManagerName",
        familyName: "FamilyName4",
        email: "lineManager@test.com",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new LineManager(-1, []),
        region: "UK",
    }), "pass123");
    if (!lineManager) {
        throw new Error("Line Manager Insert failed");
    }
    const lineManagerRole = lineManager.getEmployeeRole();

    if (!(lineManagerRole instanceof LineManager)) {
        throw new Error("lineManagerRole is not instance of LineManager");
    }
    console.log("LineManager Insert successful", `id: ${lineManager.getId()}`);



    administratorRole.setEmployeesLineManager(generalEmployee.getId(), lineManager.getId());
    administratorRole.setEmployeesLineManager(consultantEmployee.getId(), lineManager.getId());

    // Create a draft claim for the general employee

    const draftClaim = await generalEmployee.getEmployeeRole().createDraftClaim();
    if (!draftClaim) {
        throw new Error("General Staff Claim Insert failed");
    }
    console.log("General Staff Draft Claim Insert successful", `id: ${draftClaim.getId()}`);

    // Create a submitted claim for the consultant employee

    const generalEmployeeClaim = await generalEmployee.getEmployeeRole().createDraftClaim()
    if (!generalEmployeeClaim) {
        throw new Error("General Staff Pending Claim Insert failed");
    }
    console.log("General Staff Pending Claim Insert successful", `id: ${generalEmployeeClaim.getId()}`);

    const updatedGeneralEmployeeClaim = await generalEmployee.getEmployeeRole().updateClaimAmount(generalEmployeeClaim, 100);
    if (!updatedGeneralEmployeeClaim) {
        throw new Error("General Staff Pending Claim Update failed");
    }
    console.log("General Staff Pending Claim Update successful", `id: ${updatedGeneralEmployeeClaim.getId()}, amount: ${updatedGeneralEmployeeClaim.getAmount()}`);

    const submittedGeneralEmployeeClaim = await generalEmployee.getEmployeeRole().submitClaim(updatedGeneralEmployeeClaim);
    if (!submittedGeneralEmployeeClaim) {
        throw new Error("General Staff Pending Claim Submit failed");
    }
    console.log("General Staff Pending Claim Submit successful", `id: ${submittedGeneralEmployeeClaim.getId()}, amount: ${submittedGeneralEmployeeClaim.getAmount()} status: ${submittedGeneralEmployeeClaim.getStatus()}`);

    // Create a accepted claim

    const acceptedEmployeeClaim = await generalEmployee.getEmployeeRole().createDraftClaim()
    if (!acceptedEmployeeClaim) {
        throw new Error("General Staff Accepted Claim Insert failed");
    }
    console.log("General Staff Accepted Claim Insert successful", `id: ${acceptedEmployeeClaim.getId()}`);

    const updatedAcceptedEmployeeClaim = await generalEmployee.getEmployeeRole().updateClaimAmount(acceptedEmployeeClaim, 500);
    if (!updatedAcceptedEmployeeClaim) {
        throw new Error("General Staff Accepted Claim Update failed");
    }
    console.log("General Staff Accepted Claim Update successful", `id: ${updatedAcceptedEmployeeClaim.getId()}, amount: ${updatedAcceptedEmployeeClaim.getAmount()}`);

    const acceptedEmployeeClaimSubmit = await generalEmployee.getEmployeeRole().submitClaim(updatedAcceptedEmployeeClaim);
    if (!acceptedEmployeeClaimSubmit) {
        throw new Error("General Staff Accepted Claim Submit failed");
    }
    console.log("General Staff Accepted Claim Submit successful", `id: ${acceptedEmployeeClaimSubmit.getId()}, amount: ${acceptedEmployeeClaimSubmit.getAmount()} status: ${acceptedEmployeeClaimSubmit.getStatus()}`);

    const lineManagerClaims = await lineManagerRole.getEmployeeSubmittedClaims();
    if (lineManagerClaims.length !== 2) {
        throw new Error(`Line Manager Claims Insert failed length: ${lineManagerClaims.length}`);
    }
    const acceptedClaim = await lineManagerRole.approveClaim(acceptedEmployeeClaimSubmit);
    if (!acceptedClaim) {
        throw new Error("Line Manager Accepted Claim Insert failed");
    }
    console.log("Line Manager Accepted Claim Insert successful", `id: ${acceptedClaim.getId()}, amount: ${acceptedClaim.getAmount()} status: ${acceptedClaim.getStatus()}`);

    // Create a reimbursed claim

    const acceptedEmployeeClaim2 = await generalEmployee.getEmployeeRole().createDraftClaim()
    if (!acceptedEmployeeClaim2) {
        throw new Error("General Staff Accepted Claim Insert failed");
    }
    console.log("General Staff Accepted Claim Insert successful", `id: ${acceptedEmployeeClaim2.getId()}`);

    const updatedAcceptedEmployeeClaim2 = await generalEmployee.getEmployeeRole().updateClaimAmount(acceptedEmployeeClaim2, 1000);
    if (!updatedAcceptedEmployeeClaim2) {
        throw new Error("General Staff Accepted Claim Update failed");
    }
    console.log("General Staff Accepted Claim Update successful", `id: ${updatedAcceptedEmployeeClaim2.getId()}, amount: ${updatedAcceptedEmployeeClaim2.getAmount()}`);

    const acceptedEmployeeClaimSubmit2 = await generalEmployee.getEmployeeRole().submitClaim(updatedAcceptedEmployeeClaim2);
    if (!acceptedEmployeeClaimSubmit2) {
        throw new Error("General Staff Accepted Claim Submit failed");
    }
    console.log("General Staff Accepted Claim Submit successful", `id: ${acceptedEmployeeClaimSubmit2.getId()}, amount: ${acceptedEmployeeClaimSubmit2.getAmount()} status: ${acceptedEmployeeClaimSubmit2.getStatus()}`);

    const lineManagerClaims2 = await lineManagerRole.getEmployeeSubmittedClaims();
    if (lineManagerClaims2.length !== 2) {
        throw new Error("Line Manager Claims Insert failed");
    }
    const acceptedClaim2 = await lineManagerRole.approveClaim(acceptedEmployeeClaimSubmit2);
    if (!acceptedClaim2) {
        throw new Error("Line Manager Accepted Claim Insert failed");
    }
    console.log("Line Manager Accepted Claim Insert successful", `id: ${acceptedClaim2.getId()}, amount: ${acceptedClaim2.getAmount()} status: ${acceptedClaim2.getStatus()}`);

    const payrollOfficerClaims = await payrollOfficerRole.reimburseExpense(acceptedClaim2);
    if (!payrollOfficerClaims) {
        throw new Error("Payroll Officer Claim Insert failed");
    }
    console.log("Payroll Officer Claim Insert successful", `id: ${payrollOfficerClaims.getId()}, amount: ${payrollOfficerClaims.getAmount()} status: ${payrollOfficerClaims.getStatus()}`);

    // Create a rejected claim

    const rejectedClaim = await generalEmployee.getEmployeeRole().createDraftClaim()
    if (!rejectedClaim) {
        throw new Error("General Staff Rejected Claim Insert failed");
    }
    console.log("General Staff Rejected Claim Insert successful", `id: ${rejectedClaim.getId()}`);
    const updatedRejectedClaim = await generalEmployee.getEmployeeRole().updateClaimAmount(rejectedClaim, 1500);
    if (!updatedRejectedClaim) {
        throw new Error("General Staff Rejected Claim Update failed");
    }
    console.log("General Staff Rejected Claim Update successful", `id: ${updatedRejectedClaim.getId()}, amount: ${updatedRejectedClaim.getAmount()}`);
    const rejectedClaimSubmit = await generalEmployee.getEmployeeRole().submitClaim(updatedRejectedClaim);
    if (!rejectedClaimSubmit) {
        throw new Error("General Staff Rejected Claim Submit failed");
    }
    console.log("General Staff Rejected Claim Submit successful", `id: ${rejectedClaimSubmit.getId()}, amount: ${rejectedClaimSubmit.getAmount()} status: ${rejectedClaimSubmit.getStatus()}`);
    const lineManagerClaims3 = await lineManagerRole.getEmployeeSubmittedClaims();
    if (lineManagerClaims3.length !== 2) {
        throw new Error("Line Manager Claims Insert failed");
    }
    const rejectedClaim2 = await lineManagerRole.rejectClaim(rejectedClaimSubmit, "Rejected for testing");
    if (!rejectedClaim2) {
        throw new Error("Line Manager Rejected Claim Insert failed");
    }
    console.log("Line Manager Rejected Claim Insert successful", `id: ${rejectedClaim2.getId()}, amount: ${rejectedClaim2.getAmount()} status: ${rejectedClaim2.getStatus()}`);

}

InsertDefaultData();
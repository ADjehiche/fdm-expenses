import { Administrator } from "@/backend/employee/administrator";
import { User, EmployeeClassification } from "@/backend/user";
import { DatabaseManager } from "../databaseManager";

async function TestAdministrator() {
    console.log("TestAdministrator", "Test administrator methods");

    const dbManager = DatabaseManager.getInstance();
    if (!dbManager) {
        throw new Error("DatabaseManager not created");
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
    }), "password");

    if (!administrator) {
        throw new Error("Administrator Insert failed");
    }
    console.log("Administrator Insert successful", `id: ${administrator.getId()}`);

    const administratorRole = administrator.getEmployeeRole()
    if (!(administratorRole instanceof Administrator)) {
        throw new Error("administratorRole is not instance of Administrator");
    }

    // Check if we can create an employee
    const employee = await administratorRole.createAccount({
        id: -1,
        firstName: "employee",
        familyName: "FamilyName",
        email: "Email",
        plainPassword: "password",
        region: "UK"
    });
    if (!employee) {
        throw new Error("Employee Insert failed");
    }
    console.log("Employee Insert successful", `id: ${employee.getId()}`);

    // Check if the employee was inserted in the database
    const dbEmployee = await dbManager.getAccount(employee.getId());
    if (!dbEmployee) {
        throw new Error("Employee not found in database");
    }
    if (dbEmployee.getId() !== employee.getId()) {
        throw new Error("Employee ID does not match");
    }
    console.log("Employee found in database", `id: ${dbEmployee.getId()}`);

    // Check if we can change employee region and email
    const newRegion = "USA";
    const newEmail = "newEmail";
    const updatedEmployee = await administratorRole.changeEmployeesRegion(employee.getId(), newRegion);
    if (!updatedEmployee) {
        throw new Error("Employee region update failed");
    }
    console.log("Employee region updated successfully");
    const updatedEmployee2 = await administratorRole.changeEmployeesEmail(employee.getId(), newEmail);
    if (!updatedEmployee2) {
        throw new Error("Employee email update failed");
    }
    console.log("Employee email updated successfully");
    const updatedDbEmployee = await dbManager.getAccount(employee.getId());
    if (!updatedDbEmployee) {
        throw new Error("Employee not found in database");
    }
    if (updatedDbEmployee.getRegion() !== newRegion) {
        throw new Error("Employee region does not match");
    }
    if (updatedDbEmployee.getEmail() !== newEmail) {
        throw new Error("Employee email does not match");
    }
    console.log("Employee region and email updated in database", `id: ${updatedDbEmployee.getId()} region: ${updatedDbEmployee.getRegion()} email: ${updatedDbEmployee.getEmail()}`);

    // Check if we can delete the employee
    const allAccounts = await administratorRole.getAccounts();
    if (allAccounts.length != 2) {
        throw new Error(`Unexpected number of accounts in database: ${allAccounts.length}`);
    }
    const deleted = await administratorRole.deleteAccount(employee.getId());
    if (!deleted) {
        throw new Error("Employee delete failed");
    }
    const allAccountsAfterDelete = await administratorRole.getAccounts();
    if (allAccountsAfterDelete.length != 1) {
        throw new Error(`Unexpected number of accounts in database: ${allAccountsAfterDelete.length}`);
    }
    console.log("Employee deleted successfully");
    const deletedDbEmployee = await dbManager.getAccount(employee.getId());
    if (deletedDbEmployee) {
        throw new Error("Employee found in database after delete");
    }
    console.log("Employee not found in database after delete");

}

TestAdministrator();
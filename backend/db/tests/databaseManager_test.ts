import { EmployeeClassification, User } from "@/backend/user";
import { DatabaseManager } from "../databaseManager";
import { GeneralStaff } from "@/backend/employee/generalStaff";
import { LineManager } from "@/backend/employee/lineManager";
import { Administrator } from "@/backend/employee/administrator";

async function TestDatabaseManager() {
    console.log("TestDatabaseManager", "Test creating an employee, line manager and administrator and setting the line manager for the employee");
    // Check if we can get the instance of the DatabaseManager
    const dbManager = DatabaseManager.getInstance();
    if (!dbManager) {
        throw new Error("DatabaseManager not created");
    }

    // Check if we can create a new employee
    const employee = await dbManager.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "employee",
        familyName: "FamilyName",
        email: "Email",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new GeneralStaff(),
        region: "UK",
    }))

    if (!employee) {
        throw new Error("Employee Insert failed");
    }
    console.log("Employee Insert successful", `id: ${employee.getId()}`);

    // Check if we can create a new line manager
    const lineManager = await dbManager.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "lineManager",
        familyName: "FamilyName",
        email: "Email",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new LineManager([]),
        region: "UK",
    }));

    if (!lineManager) {
        throw new Error("Line Manager Insert failed");
    }
    console.log("LineManager Insert successful", `id: ${lineManager.getId()}`);

    // Check if we can create a new administrator
    const administrator = await dbManager.addAccount(new User({
        id: -1,
        createdAt: new Date(),
        firstName: "administrator",
        familyName: "FamilyName",
        email: "Email",
        employeeClassification: EmployeeClassification.Internal,
        employeeRole: new Administrator(),
        region: "UK",
    }))

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

    // Get the line manager for the employee and make sure it is correct
    const newLineManager = await dbManager.getLineManager(employee.getId());
    if (!newLineManager) {
        throw new Error("newLineManager getLineManager failed");
    }
    // Check the line manager is the expected line manager
    if (newLineManager.getId() !== lineManager.getId()) {
        throw new Error(`newLineManager is not the expected line manager. Expected: ${lineManager.getId()}, Got: ${newLineManager.getId()}`);
    }

    // Get the employee and check the line manager is correct
    const updatedUser = await dbManager.getAccount(employee.getId());
    if (!updatedUser) {
        throw new Error("Get account failed");
    }

    if (updatedUser.getEmployeeRole().getLineManager()?.getId() !== lineManager.getId()) {
        throw new Error(`Not expected line manager. Expected: ${lineManager.getId()}, Got: ${updatedUser.getEmployeeRole().getLineManager()?.getId()}`);
    }
    console.log("Get line manager successful", updatedUser.getEmployeeRole().getLineManager()?.getId());

    // Get the line manager and check the employee is correct
    const updatedLineManager = await dbManager.getAccount(lineManager.getId());
    if (!updatedLineManager) {
        throw new Error("Get account failed");
    }
    console.log("Get account successful", updatedLineManager);
    const lineManagerRole = updatedLineManager.getEmployeeRole();
    if (!(lineManagerRole instanceof LineManager)) {
        throw new Error("Line manager role is not instance of LineManager");
    }
    console.log("Get line manager successful", lineManagerRole.getEmployees().length);
    if (lineManagerRole.getEmployees().length !== 1) {
        throw new Error(`Not expected number of employees. Expected: 1, Got: ${lineManagerRole.getEmployees().length}`);
    }
    if (lineManagerRole.getEmployees()[0].getId() !== employee.getId()) {
        throw new Error(`Not expected employee. Expected: ${employee.getId()}, Got: ${lineManagerRole.getEmployees()[0].getId()}`);
    }
    console.log("Correct number of employees", lineManagerRole.getEmployees().length);
    console.log("TestDatabaseManager", "Test Passed");
}

TestDatabaseManager();
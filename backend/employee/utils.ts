import { EmployeeClassification } from "../user";
import { EmployeeType } from "./employeeRole";

export function getEmployeeClassification(classification: string): EmployeeClassification | null {
    switch (classification) {
        case "Internal":
            return EmployeeClassification.Internal;
        case "External":
            return EmployeeClassification.External;
        default:
            return null
    }
}

export function getEmployeeType(type: string): EmployeeType | null {
    switch (type) {
        case "General Staff":
            return EmployeeType.GeneralStaff;
        case "Line Manager":
            return EmployeeType.LineManager;
        case "Payroll Officer":
            return EmployeeType.PayrollOfficer;
        case "Administrator":
            return EmployeeType.Administrator;
        default:
            return null
    }
}
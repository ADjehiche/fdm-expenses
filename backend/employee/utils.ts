import { EmployeeClassification } from "../user";
import { EmployeeType } from "./employeeRole";

export function getEmployeeClassification(classification: string): EmployeeClassification {
    for (let [key, value] of Object.entries(EmployeeClassification)) {
        if (value === classification) {
            return key as EmployeeClassification;
        }
    }
    throw new Error(`${classification} is not a valid employee classification`);
}

// export function getEmployeeClassification(classification: string): EmployeeClassification | null {
//     switch (classification) {
//         case "Internal":
//             return EmployeeClassification.Internal;
//         case "External":
//             return EmployeeClassification.External;
//         default:
//             return null
//     }
// }

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

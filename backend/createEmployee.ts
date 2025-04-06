
// bunch of create user commands

import { EmployeeClassification, User } from "./user"
import { EmployeeRole } from "./employee/employeeRole"
import { GeneralStaff } from "./employee/generalStaff"
import { Consultant } from "./employee/consultant"
import { LineManager } from "./employee/lineManager"
import { PayrollOfficer } from "./employee/payrollOfficer"
import { Administrator } from "./employee/administrator"

const newUser = (firstName :string, familyName:string, email:string, empClass: EmployeeClassification, role: EmployeeRole, region: string): User => {
    return new User({
        id: -1,
        createdAt: new Date(),
        firstName: firstName,
        familyName: familyName,
        email: email,
        employeeClassification: empClass,
        employeeRole: role,
        region: region,
    });
} 

export const newGeneralUser = (firstName: string, familyName: string, email: string, region: string) : User  => {
    return newUser(firstName, familyName, email, EmployeeClassification.Internal, new GeneralStaff(-1), region);
}

export const newConsultant = (firstName: string, familyName: string, email: string, region: string) : User  => {
    return newUser(firstName, familyName, email, EmployeeClassification.Internal, new Consultant(-1), region);
}

export const newLineManager = (firstName: string, familyName: string, email: string, region: string) : User  => {
    return newUser(firstName, familyName, email, EmployeeClassification.Internal, new LineManager(-1, []), region);
}

export const newPayrollOfficer = (firstName: string, familyName: string, email: string, region: string) : User  => {
    return newUser(firstName, familyName, email, EmployeeClassification.Internal, new PayrollOfficer(-1), region);
}

export const newAdmin = (firstName: string, familyName: string, email: string, region: string) : User  => {
    return newUser(firstName, familyName, email, EmployeeClassification.Internal, new Administrator(-1), region);
}
import { EmployeeRole, EmployeeType } from "./employee/employeeRole";

export class User {
    private id: number;
    private createdAt: Date;
    private firstName: string;
    private familyName: string;
    private email: string;
    private employeeClassification: EmployeeClassification;
    private region: string;
    private employeeRole: EmployeeRole;

    constructor({
        id,
        createdAt,
        firstName,
        familyName,
        email,
        employeeClassification,
        region,
        employeeRole
    }: {
        id: number,
        createdAt: Date,
        firstName: string,
        familyName: string,
        email: string,
        employeeClassification: EmployeeClassification,
        region: string,
        employeeRole: EmployeeRole
    }) {
        this.id = id;
        this.createdAt = createdAt;
        this.firstName = firstName;
        this.familyName = familyName;
        this.email = email;
        this.employeeClassification = employeeClassification;
        this.region = region;
        this.employeeRole = employeeRole;
    }

    public getEmployeeRole(): EmployeeRole {
        return this.employeeRole;
    }

    public setEmployeeRole(newRole: EmployeeRole): void {
        this.employeeRole = newRole;
    }

    /**
     * Returns the type of user that the User currently is, eg Admin, LineManager, etc.
     * @returns employee Type
     */
    public getEmployeeType() : EmployeeType {
        return this.employeeRole.getType()
    }

    public getEmployeeClassification(): EmployeeClassification {
        return this.employeeClassification;
    }

    public getFirstName(): string {
        return this.firstName;
    }

    public getFamilyName(): string {
        return this.familyName;
    }

    public getId(): number {
        return this.id;
    }

    public setFirstName(firstName: string): void {
        this.firstName = firstName;
    }

    public setFamilyName(familyName: string): void {
        this.familyName = familyName;
    }

    public getRegion(): string {
        return this.region;
    }

    public setRegion(region: string): void {
        this.region = region;
    }

    public getEmail(): string {
        return this.email;
    }

    public setEmail(email: string): void {
        this.email = email;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}

export enum EmployeeClassification {
    Internal="Internal",
    External="External"
}




/**
 * Rank returned:
 * 
 * Higher rank means two things:
 *  - early match
 *  - longer match
 * 
 * 
 * @param string string you match the expression against
 * @param expression string you want to know the match for
 * @returns match rank, higher means: larger match earlier on, longer match
 */
const  getMatch =  (string: string, expression: string) : number => {
    let rank = 1;

    for (let i=expression.length; i>0; i--) {
        const subexpression = expression.substring(0, i);
        const result = string.search(subexpression);

        if (result > -1) {
        rank = rank>subexpression.length ? rank : subexpression.length
        }
    }

    return rank;
}

export const matchUserName =  (user: User, expression:string) : number => {
    return  getMatch(user.getFirstName(), expression) *  getMatch(user.getFamilyName(), expression);

} 

export const matchUserEmail =   (user: User, expression:string) : number => {
    return  getMatch(user.getEmail(), expression);

} 


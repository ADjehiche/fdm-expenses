import { eq } from "drizzle-orm";
import { db } from "./drizzle";
import { usersTable } from "./schema";

async function TestInsert() {
    const insert = await db.insert(usersTable).values({
        firstName: "FirstName",
        familyName: "FamilyName",
        email: "Email",
        employeeClassification: "Internal",
        region: "UK",
    }).returning();

    if (insert.length !== 1) {
        throw new Error("Insert failed");
    }
    console.log("Insert successful", insert);

    const result = await db.select().from(usersTable).where(eq(usersTable.id, insert[0].id));
    if (result.length !== 1) {
        throw new Error("Select failed");
    }
    console.log("Select successful", result);
}

TestInsert();
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
    id: int().primaryKey({ autoIncrement: true }),
    createdAt: int({ mode: "timestamp_ms" }).default(new Date(Date.now())).notNull(),
    firstName: text().notNull(),
    familyName: text().notNull(),
    email: text().notNull(),
    employeeClassification: text({ enum: ["Internal", "External"] }).notNull(),
    region: text().notNull()
});
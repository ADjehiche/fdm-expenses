import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const testTable = sqliteTable("test", {
    id: int().primaryKey({ autoIncrement: true }),
});

export const usersTable = sqliteTable("users_table", {
    id: int().primaryKey({ autoIncrement: true }),

    firstName: text().notNull(),
    familyName: text().notNull(),

    email: text().notNull().unique(),
    hashedPassword: text().notNull(),

    employeeClassification: text({ enum: ["Internal", "External"] }).notNull(),
    employeeRole: text({ enum: ["Line Manager", "Payroll Officer", "Administrator", "General Staff", "Consultant"] }).notNull(),
    region: text().notNull(),
    lineManagerId: int(),

    createdAt: int({ mode: "timestamp_ms" }).default(new Date(Date.now())).notNull(),
});

export const usersRelations = relations(usersTable, ({ one }) => ({
    lineManager: one(lineManagersTable, {
        fields: [usersTable.lineManagerId],
        references: [lineManagersTable.id],
    }),
}));

export const lineManagersTable = sqliteTable("line_managers_table", {
    id: int().primaryKey({ autoIncrement: true }),

    lineManagerId: int().notNull(),
    employeeId: int().notNull()
});

export const lineManagersRelations = relations(lineManagersTable, ({ many }) => ({
    employees: many(usersTable),
}));

export const claimsTable = sqliteTable("claims_table", {
    id: int().primaryKey({ autoIncrement: true }),
    employeeId: int().notNull().references(() => usersTable.id),

    amount: int().default(0).notNull(),
    attemptCount: int().default(0).notNull(),
    status: text({ enum: ["Draft", "Pending", "Accepted", "Rejected", "Reimbursed"] }).default("Draft").notNull(),
    feedback: text().notNull(),

    title: text().notNull(),
    description: text().notNull(),
    category: text().notNull(),
    currency: text().notNull(),

    accountName: text(),
    accountNumber: text(),
    sortCode: text(),



    createdAt: int({ mode: "timestamp_ms" }).default(new Date(Date.now())).notNull(),
    lastUpdated: int({ mode: "timestamp_ms" }).default(new Date(Date.now())).notNull(),
});

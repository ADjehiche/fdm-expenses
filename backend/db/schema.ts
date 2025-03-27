import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users_table", {
    id: int().primaryKey({ autoIncrement: true }),
    createdAt: int({ mode: "timestamp_ms" }).default(new Date(Date.now())).notNull(),
    firstName: text().notNull(),
    familyName: text().notNull(),
    email: text().notNull(),
    employeeClassification: text({ enum: ["Internal", "External"] }).notNull(),
    employeeRole: text({ enum: ["Line Manager", "Payroll Officer", "Administrator", "General Staff", "Consultant"] }).notNull(),
    region: text().notNull(),
    lineManagerId: int(),
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

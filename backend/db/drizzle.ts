import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/libsql';

config({ path: ".env" });

console.log("DB_FILE_NAME environment variable", process.env.DB_FILE_NAME);

export const db = drizzle(process.env.DB_FILE_NAME!);
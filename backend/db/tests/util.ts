import { reset } from 'drizzle-seed'
import * as schema from '../schema'
import { db } from '../drizzle'

export async function clearDatabase() {
    console.log('Clearing database...')
    await reset(db, schema)
    console.log('Database cleared')
}
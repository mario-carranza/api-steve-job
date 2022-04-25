import { Pool } from 'pg'

export const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: 'karolg4A',
    database: 'steveJob',
    port: 5432
})


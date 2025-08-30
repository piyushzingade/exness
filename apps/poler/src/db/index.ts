import { Pool } from "pg";


export const pool = new Pool({
    connectionString: process.env.TIME_SCALE_DATABASE_URL,
});
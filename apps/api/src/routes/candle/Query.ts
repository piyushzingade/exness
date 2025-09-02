import type { KlineInterval } from "@repo/types/types";
import { Pool } from "pg";

export const pool = new Pool({
    connectionString: process.env.TIMESCALEDB_URL,
});

const INTERVAL_MAP: Record<KlineInterval, string> = {
    "1s": "second",
    "1m": "minute",
    "3m": "3minute",
    "5m": "5minute",
};

export const Query = async (
    symbol: string,
    duration: KlineInterval | undefined,
    limit: string
) => {
    try {
        const client = await pool.connect();
        try {
            let res;

            if (duration) {
                const interval = INTERVAL_MAP[duration];
                if (!interval) {
                    throw new Error(`Invalid duration: ${duration}. Valid intervals are: ${Object.keys(INTERVAL_MAP).join(', ')}`);
                }
                const tableName = `klines_${interval}`;

                res = await client.query(
                    `
          SELECT *
          FROM ${tableName}
          WHERE UPPER(symbol) = UPPER($1)
          ORDER BY bucket ASC
          LIMIT $2;
          `,
                    [symbol, Number.parseInt(limit, 10)]
                );
            } else {
                res = await client.query(
                    `
          SELECT *
          FROM trades
          WHERE UPPER(symbol) = UPPER($1)
          ORDER BY event_time DESC
          LIMIT $2;
          `,
                    [symbol, Number.parseInt(limit, 10)]
                );
            }

            return res.rows;
        } finally {
            client.release();
        }
    } catch (error) {
        console.error("Database error", error);
        throw error;
    }
};
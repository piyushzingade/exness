import type { binanceWebSockerResponse } from "@repo/types/types";
import { pool } from "../../db";


export const pushToDB = async (wsData: binanceWebSockerResponse) => {
    const client = await pool.connect();
    const data = wsData.data;
    try {
        await client.query(
            `
      INSERT INTO trades (
         event_type, event_time, symbol, trade_id,
         price, quantity, trade_time, is_maker
       )
       VALUES (
         $1, to_timestamp($2 / 1000000.0), $3, $4,
         $5, $6, to_timestamp($7 / 1000000.0), $8
       )
       ON CONFLICT (symbol, trade_id, event_time) DO NOTHING;
       `,
            [
                data.e,
                data.E,
                data.s,
                data.t,
                Number(data.p),
                Number(data.q),
                data.T,
                data.m,
            ],
        );
        // console.log("Data pushed to DB successfully.");
    } catch (error) {
        // console.error("Error pushing data to DB:", error);
    } finally {
        client.release();
    }
};
import { Router, type Request, type Response } from "express";
import { KlineInterval } from "@repo/types/types";
import { Query } from "./Query";

export const handleCandle = Router();

export const getCandle = async (req: Request, res: Response) => {
    try {
        const symbol = req.query.symbol as string;
        const duration = req.query.duration as KlineInterval;
        const limit = req.query.limit as string;

        // Fixed validation logic - should be OR not AND
        if (!symbol || !duration) {
            return res.status(400).json({
                message: "Symbol and duration are required",
                example: "/api/v1/candles?symbol=btcusdt&duration=1m&limit=100"
            });
        }

        console.log(`Fetching candles for symbol: ${symbol}, duration: ${duration}, limit: ${limit || "10"}`);

        const rows = await Query(symbol, duration, limit || "100");

        if (!rows || rows.length === 0) {
            return res.json({
                candle: []
            });
        }

        const candleData = rows.map((candle: any) => ({
            timestamp: new Date(candle.bucket).getTime(),
            open: Math.round(parseFloat(candle.open_price) * Math.pow(10, 4)),
            high: Math.round(parseFloat(candle.high_price) * Math.pow(10, 4)),
            close: Math.round(parseFloat(candle.close_price) * Math.pow(10, 4)),
            low: Math.round(parseFloat(candle.low_price) * Math.pow(10, 4)),
            decimals: 4
        }));

        console.log(`Returning ${candleData.length} candles`);

        res.json({
            candle: candleData
        });

    } catch (error: any) {
        console.error("Error fetching candle data", error);

        // More specific error handling
        if (error instanceof Error && error.message.includes('Invalid duration')) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
}
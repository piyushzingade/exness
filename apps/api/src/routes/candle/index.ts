import { Router } from "express";
import { TimeInterval } from "@repo/types/index";
import { Query } from "./Query";

export const handleCandle = Router();

handleCandle.get("/", async (req, res) => {
    try {
        const symbol = req.query.symbol as string;
        const duration = req.query.duration as TimeInterval;
        // const startTime = req.query.startTime as string;
        // const endTime = req.query.endTime as string;
        const limit = req.query.limit as string;

        if (!symbol && !duration) {
            res.status(400).json({ message: "Symbol and duration are required" });
        }

        const row = await Query(symbol, duration, limit || "10")

        const candleData = row?.map((candle: any) => ({
            timestamp: new Date(candle.bucket).getTime(),
            open: Math.round(parseFloat(candle.open_price) * Math.pow(10, 4)),
            high: Math.round(parseFloat(candle.high_price) * Math.pow(10, 4)),
            close: Math.round(parseFloat(candle.close_price) * Math.pow(10, 4)),
            low: Math.round(parseFloat(candle.low_price) * Math.pow(10, 4)),
            decimals: 4

        }))

        res.send({
            candle: candleData || []
        })

    } catch (error) {
        console.error("Error fetching candle data", error);
        res.status(500).json({ message: "Internal server error" });
    }


}); 

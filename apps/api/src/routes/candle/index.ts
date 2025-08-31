import { Router } from "express";


export const handleCandle = Router();

handleCandle.get("/candle", (req, res) => {
    res.send("Candle data");
});

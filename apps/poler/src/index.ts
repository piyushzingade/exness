import express, { type Request, type Response } from "express"
import "dotenv/config";
import cors from "cors";
import type { binanceWebSockerResponse } from "@repo/types/index";


const PORT = process.env.PORT;
const app = express();

app.use(express.json());
app.use(cors());



const ws = new WebSocket("wss://stream.binance.com:9443/stream?streams=btcusdt@trade&timeUnit=MICROSECOND")

ws.onmessage = (event) => {
    const data: binanceWebSockerResponse = JSON.parse(event.data);
    console.log('Received WebSocket message:', data);
}

app.listen(PORT, () => {
    console.log('Server is running on port 3000');
});
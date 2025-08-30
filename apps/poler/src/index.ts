import "dotenv/config";
import type { binanceWebSockerResponse } from "@repo/types/index";
import { getPublisherData } from "./routes/publisher/publisher";
import { initRedis } from "./redis-pubsub";



const ws = new WebSocket("wss://stream.binance.com:9443/stream?streams=btcusdt@trade&timeUnit=MICROSECOND")

initRedis();
ws.onmessage = (event) => {
    const data: binanceWebSockerResponse = JSON.parse(event.data);
    // console.log('Received WebSocket message:', data);
    getPublisherData(data);
}

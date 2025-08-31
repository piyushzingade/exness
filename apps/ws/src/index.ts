import WebSocket, { WebSocketServer } from "ws";
import { createClient, type RedisClientType } from "redis";

const wss = new WebSocketServer({ port: 3003 });
const clients: Set<WebSocket> = new Set();


export const subscriberMessage: RedisClientType = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("message", (raw) => {
        let message: any;
        try {
            message = JSON.parse(raw.toString());
        } catch {
            message = { type: raw.toString() };
        }

        if (message.type === "hi") {
            ws.send(JSON.stringify({ type: "hello" }));
        }
    });
    ws.on("close", () => {
        clients.delete(ws);
    });

});



export async function connectRedis() {
    await subscriberMessage.connect();

    await subscriberMessage.pSubscribe("priceUpdates", (message, channel) => {
        let parsedMessage: any;
        try {
            parsedMessage = JSON.parse(message);
        } catch {
            parsedMessage = message;
        }
        for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(
                    JSON.stringify({
                        type: "ASKS_BIDS",
                        data: {
                            // channel,
                            message: parsedMessage,
                        },
                    }),
                );
            }
        }
    });

    console.log("Subscribed to Redis channel: priceUpdates");
}

connectRedis().catch((err) => {
    console.error("Error connecting to Redis:", err);
    process.exit(1);
});



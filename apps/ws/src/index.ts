import WebSocket, { WebSocketServer } from "ws";
import { createClient, type RedisClientType } from "redis";

const wss = new WebSocketServer({ port: 3003 });
const clients: Set<WebSocket> = new Set();




wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("message", (raw) => {
        let msg: any;
        try {
            msg = JSON.parse(raw.toString());
        } catch {
            return;
        }
        if (msg.type === "hi") {
            ws.send(JSON.stringify({ type: "hello" }));
        }
    });

    ws.on("close", () => {
        clients.delete(ws);
    });
});




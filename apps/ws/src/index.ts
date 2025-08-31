import { WebSocketServer } from "ws";


export const wss = new WebSocketServer({ port: 3003 });

wss.on("connection", (ws) => {
    console.log("New client connected");
    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
    });
    ws.on("close", () => {
        console.log("Client disconnected");
    });
}); 
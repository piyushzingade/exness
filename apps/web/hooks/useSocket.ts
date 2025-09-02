"use client"
import { useEffect, useState } from "react";

const SOCKET_URL = "ws://localhost:3003";


export function useSocket(): {
    socketPusher: WebSocket | null;
    isConnectedWs: boolean;
    sendPusherMessage: (message: any) => void;
    tradeData: {
        type: string;
        data: {
            message: {
                buy: number;
                sell: number;
            };
        };
    } | null;
} {
    const [socketPusher, setSocketPusher] = useState<WebSocket | null>(null);
    const [isConnectedWs, setIsConnectedWs] = useState<boolean>(false);
    const [tradeData, setTradeData] = useState<{
        type: string;
        data: {
            message: {
                buy: number;
                sell: number;
            };
        };
    } | null>(null);


    useEffect(() => {
        let ws: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout | null = null;
        let isUnMounted = false;

        const connectWs = () => {
            if (isUnMounted) return;

            try {
                ws = new WebSocket(SOCKET_URL);
                ws.onopen = () => {
                    console.log("WebSocket connected");
                    setIsConnectedWs(true);
                    if (reconnectTimeout) {
                        clearTimeout(reconnectTimeout);
                        reconnectTimeout = null;
                    }
                }

                ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        if (message.type === "ASKS_BIDS" || message.type === "CURRENT_PRICE") {
                            setTradeData(message);
                        }
                    } catch (error) {
                        console.error("Error parsing WebSocket message:", error);
                    }

                }

                ws.onclose = (event) => {
                    console.log(`WebSocket disconnected: ${event.reason}`);
                    setIsConnectedWs(false);

                    if (!isUnMounted && event.code !== 1000) {
                        reconnectTimeout = setTimeout(() => {
                            console.log("Reconnecting WebSocket...");
                            connectWs();
                        }, 3000);
                    }
                }



                ws.onerror = (error) => {
                    console.log("WebSocket error:", error);
                    setIsConnectedWs(false);
                }
                setSocketPusher(ws);
            } catch (error) {
                console.error("Error connecting to WebSocket:", error);
                setIsConnectedWs(false);
            }
        }

        connectWs();

        return () => {
            isUnMounted = true;
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close(1000, "Component unmounted")
            }
        }
    }, []);


    const sendPusherMessage = (message: any) => {
        if (socketPusher && isConnectedWs && socketPusher.readyState === WebSocket.OPEN) {
            try {
                socketPusher.send(JSON.stringify(message));
            } catch (error) {
                console.error("Error sending WebSocket message:", error);
            }
        } else {
            console.log("WebSocket is not connected");
        }
    };

    return {
        socketPusher,
        isConnectedWs,
        sendPusherMessage,
        tradeData
    }
}   
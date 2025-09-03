import { useEffect, useState, useCallback, useRef } from 'react';

interface Trade {
    symbol: string;
    price: number;
    quantity: number;
    trade_time: string;
}

interface OrderBookData {
    type: string;
    data: {
        message: {
            buy: number;
            sell: number;
        }
    };
}

interface UseWebSocketReturn {
    isConnected: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    lastTrade: Trade | null;
    lastOrderBook: OrderBookData | null;
    reconnect: () => void;
}

export function useWebSocket(
    symbol: string | string[],
    onTradeUpdate?: (trade: Trade) => void,
    onOrderBookUpdate?: (orderBook: OrderBookData) => void
): UseWebSocketReturn {
    const [connectionStatus, setConnectionStatus] = useState<
        'connecting' | 'connected' | 'disconnected' | 'error'
    >('disconnected');
    const [lastTrade, setLastTrade] = useState<Trade | null>(null);
    const [lastOrderBook, setLastOrderBook] = useState<OrderBookData | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectAttemptsRef = useRef<number>(0);
    const maxReconnectAttempts = 5;

    const connect = useCallback(() => {
        // Clear any existing connection
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        setConnectionStatus('connecting');
        console.log('Attempting to connect to WebSocket...');

        try {
            const websocket = new WebSocket('ws://localhost:3003');

            websocket.onopen = () => {
                console.log('Connected to WebSocket');
                setConnectionStatus('connected');
                reconnectAttemptsRef.current = 0; // Reset reconnect attempts

                // Convert to array if it's a string
                const symbolArray = Array.isArray(symbol) ? symbol : [symbol];

                symbolArray.forEach((sym) => {
                    const subscribeMessage = JSON.stringify({
                        type: 'subscribe',
                        symbol: sym.toLowerCase(), // Ensure lowercase for consistency
                    });

                    websocket.send(subscribeMessage);
                    console.log(`Subscribing to: ${sym}`, subscribeMessage);
                });
            };

            websocket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('WebSocket message received:', message);

                    if (message.type === 'trade') {
                        const trade = message.data;
                        setLastTrade(trade);
                        onTradeUpdate?.(trade);
                        console.log('Trade processed:', trade);
                    } else if (message.type === 'ASKS_BIDS') {
                        // Handle order book data
                        setLastOrderBook(message);
                        onOrderBookUpdate?.(message);
                        console.log('Order book data processed:', message);
                    } else if (message.type === 'subscribed') {
                        console.log(`Successfully subscribed to ${message.symbol}`);
                    } else {
                        console.log('Unknown message type:', message.type, message);
                    }
                } catch (error) {
                    console.error('Error parsing WebSocket message:', error, event.data);
                }
            };

            websocket.onclose = (event) => {
                console.log('WebSocket disconnected:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                setConnectionStatus('disconnected');

                // Auto-reconnect logic
                if (reconnectAttemptsRef.current < maxReconnectAttempts) {
                    const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
                    console.log(`Attempting to reconnect in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);

                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectAttemptsRef.current += 1;
                        connect();
                    }, delay);
                }
            };

            websocket.onerror = (event) => {
                console.error('WebSocket error occurred:', {
                    type: event.type,
                    target: event.target,
                    timestamp: new Date().toISOString(),
                    readyState: websocket.readyState,
                    url: websocket.url,
                    stateText: ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][websocket.readyState] || 'UNKNOWN'
                });
                setConnectionStatus('error');
            };

            wsRef.current = websocket;
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionStatus('error');
        }
    }, [symbol, onTradeUpdate, onOrderBookUpdate]);

    const reconnect = useCallback(() => {
        reconnectAttemptsRef.current = 0; // Reset attempts for manual reconnection
        connect();
    }, [connect]);

    useEffect(() => {
        connect();

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connect]);

    return {
        isConnected: connectionStatus === 'connected',
        connectionStatus,
        lastTrade,
        lastOrderBook,
        reconnect,
    };
}
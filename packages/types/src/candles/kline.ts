import { type Time } from "lightweight-charts";

export type KlineData = {
    t: number;
    T: number;
    s: string;
    i: string;
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
    B: string;
};

export type KlineEvent = {
    e: "kline";
    E: number;
    s: string;
    k: KlineData;
};

// Binance WebSocket wrapper for Kline events (matches actual API response)
export type BinanceKlineResponse = {
    stream: string;
    data: KlineEvent;
};

export enum KlineInterval {
    ONE_SECOND = "1s",
    ONE_MINUTE = "1m",
    THREE_MINUTES = "3m",
    FIVE_MINUTES = "5m",
    // FIFTEEN_MINUTES = "15m",
    // THIRTY_MINUTES = "30m",
    // ONE_HOUR = "1h",
    // TWO_HOURS = "2h",
    // FOUR_HOURS = "4h",
    // SIX_HOURS = "6h",
    // EIGHT_HOURS = "8h",
    // TWELVE_HOURS = "12h",
    // ONE_DAY = "1d",
    // THREE_DAYS = "3d",
    // ONE_WEEK = "1w",
    // ONE_MONTH = "1M",
}

// Get interval duration in milliseconds for polling optimization
export const getIntervalDuration = (interval: KlineInterval): number => {
    const durations: Record<KlineInterval, number> = {
        [KlineInterval.ONE_SECOND]: 1000,
        [KlineInterval.ONE_MINUTE]: 60 * 1000,
        [KlineInterval.THREE_MINUTES]: 3 * 60 * 1000,
        [KlineInterval.FIVE_MINUTES]: 5 * 60 * 1000,
    };
    return durations[interval] || 60 * 1000;
};

////UI////

export type KlineUI = [
    number, // open time
    string, // open price
    string, // high price
    string, // low price
    string, // close price
    string, // volume
    number, // close time
    string, // quote asset volume
    number, // number of trades
    string, // taker buy base asset volume
    string, // taker buy quote asset volume
    string, // ignore
];

export interface KlineStreamData {
    e: string; // Event type
    E: number; // Event time
    s: string; // Symbol
    k: {
        t: number; // Kline start time
        T: number; // Kline close time
        s: string; // Symbol
        i: string; // Interval
        f: number; // First trade ID
        L: number; // Last trade ID
        o: string; // Open price
        c: string; // Close price
        h: string; // High price
        l: string; // Low price
        v: string; // Base asset volume
        n: number; // Number of trades
        x: boolean; // Is this kline closed?
        q: string; // Quote asset volume
        V: string; // Taker buy base asset volume
        Q: string; // Taker buy quote asset volume
        B: string; // Ignore
    };
}

export interface ServerCandleData {
    bucket: string;
    open_price: string;
    high_price: string;
    low_price: string;
    close_price: string;
}

export interface ChartCandleData {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface ChartProps {
    interval: KlineInterval;
    onIntervalChange?: (interval: KlineInterval) => void;
}


export interface CandleDataWithTime {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface PreHisChartProps {
    interval: KlineInterval;
    onIntervalChange?: (interval: KlineInterval) => void;
}

export interface SocketData {
    socketPusher: WebSocket | null;
    socketEngine: WebSocket | null;
    isConnectedWs: boolean;
    // isConnectedEngine: boolean;
    sendPusherMessage?: (message: any) => void;
    tradeData: {
        type: string;
        data: {
            message: {
                buy: number;
                sell: number;
            };
        };
    } | null;
}

export interface ChartComponentProps {
    interval?: string;
    height?: number;
    onIntervalChange?: (interval: any) => void;
}

export interface SectionComponentProps {
    socketData: SocketData;
}
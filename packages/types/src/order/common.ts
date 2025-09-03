import type { MyBalance } from "../users/balance";

export enum TradeType {
    SELL = "SELL",
    BUY = "BUY",
}

export enum TradeStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
}

export type Trades = Trade[];

export type Trade = {
    symbol: string;
    type: TradeType;
    leverage: number;
    margin: number; // Stored as integer with 2 decimal precision
    openPrice: number; // Stored as integer with 4 decimal precision
    closePrice?: number; // Stored as integer with 4 decimal precision
    quantity: number; // Stored as integer with 8 decimal precision
    createdAt: Date;
    userId: string;
    trade_status: TradeStatus;
    stopLoss?: number;
    takeProfit?: number;
    trade_id: string;
    pnl?: number; // Stored as integer with 6 decimal precision
};

// TODO: impl limit open and close Price : currently closing at webscoket price

export type openTrade = Omit<
    Trade,
    | "trade_status"
    | "createdAt"
    | "trade_id"
    | "pnl"
    | "closePrice"
    | "openPrice"
    | "type"
    | "userId"
>;

export type closeTrade = Pick<Trade, "trade_id">;

export interface TradeReponse {
    trade_id: string;
    trade_status: TradeStatus;
    type: TradeType;
    leverage: number;
    margin: number; // Stored as integer with 2 decimal precision
    openPrice: number; // Stored as integer with 4 decimal precision
    closePrice: number; // Stored as integer with 4 decimal precision
    quantity: number; // Stored as integer with 8 decimal precision
    createdAt: Date;
    symbol: string;
    userId: string;
    stopLoss?: number;
    takeProfit?: number;
    balance: MyBalance;
}

export type TradesResponse = TradeReponse[];

export type asset = {
    symbol: string;
    name: string;
    buyPrice: number; // Stored as integer with 4 decimal precision
    sellPrice: number; // Stored as integer with 4 decimal precision
    decimal: number;
    imageUrl: string;
};

export type assets = asset[];
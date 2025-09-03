
import type { TradeType } from "./common";

export type closeOrder = {
    id: string;
    userId: string;
    symbol: string;
    type: TradeType;
    quantity: number; // Integer format with 8 decimal precision
    price: number; // Integer format with 4 decimal precision
    createdAt: Date;
    closedAt: Date | null;
};

export type closeTradeRequest = {
    tradeId: string;
    quantity?: number; // Optional - if not provided, closes entire position
};

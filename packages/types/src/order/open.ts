import type { Balance } from "../users/balance";
import type { TradeType } from "./common";

export type openOrder = {
    type: TradeType;
    quantity: string;
    symbol: string;
    stopLoss: string;
    takeProfit: string;
};

export interface openOrderResponse {
    orderId: string;
    balance: Balance;
}
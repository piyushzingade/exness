
import type { Trades } from "../order/common";
import type { MyBalance } from "./balance";

export type User = {
    id: string;
    email: string;
    password: string;
    balance: MyBalance;
    trades: Trades;
};

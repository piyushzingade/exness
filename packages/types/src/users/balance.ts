export enum BalanceType {
    SELL = "SELL",
    BUY = "BUY",
}

export type CoinBalance = {
    quantity: string;
    type: BalanceType;
};

export type Balance<Coin extends string = string> = {
    usd: number; // Stored as integer with 2 decimal precision
    coins: Record<Coin, CoinBalance>;
};

export type MyBalance = Balance;
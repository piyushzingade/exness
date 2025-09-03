export * from "./poler/index";
export * from "./users/user";
export * from "./users/balance"
export * from "./candles/kline";
export * from "./order/close";
export * from "./order/common";
export * from "./order/open";
export * from "./decimals";


const SPREAD_CONSTANT_EX: number = 0.0015; // 0.15%

export function getBuyPrice(price: number) {
    return price + SPREAD_CONSTANT_EX * price;
}

export function getSellPrice(price: number) {
    return price - SPREAD_CONSTANT_EX * price;
}

export function getAveragePrice(prices: {
    buy: number;
    sell: number;
}) {
    return (prices.buy + prices.sell) / 2;
}
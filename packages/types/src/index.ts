export * from "./users/index";
export * from "./candles/kline";
export * from "./poler/index";
export * from "./decimals/index";



export const SPREAD_CONSTANT = 0.03;

export const getBuyPrice = (price: number) => {
    return price + SPREAD_CONSTANT * price;
}

export const getSellPrice = (price: number) => {
    return price - SPREAD_CONSTANT * price;
}

export const getAveragePrice = (prices: {
    buy: number;
    sell: number;
}) => {
    return (prices.buy + prices.sell) / 2;
}

export const DECIMALS = {
    USD_BALANCE: 2,  // 2 decimal places for USD balance (e.g., 500.00 -> 50000)
    ASSET_PRICE: 4,  // 4 decimal places for asset prices (e.g., 211.1100 -> 2111100)
    PNL: 6,          // 6 decimal places for PnL calculations (e.g., 500.000000 -> 500000000)
    QUANTITY: 8,     // 8 decimal places for asset quantities (e.g., 0.00123456 -> 123456)
} as const;


export type DecimalPrecision = typeof DECIMALS[keyof typeof DECIMALS];

export function toInteger(value: number, decimals: DecimalPrecision): number {
    return Math.round(value * Math.pow(10, decimals));
}

export function fromInteger(value: number, decimals: DecimalPrecision): number {
    return value / Math.pow(10, decimals);
}


export const AssetPriceUtils = {
    toInteger: (value: number) => toInteger(value, DECIMALS.ASSET_PRICE),
    fromInteger: (value: number) => fromInteger(value, DECIMALS.ASSET_PRICE),
    format: (value: number) => `$${fromInteger(value, DECIMALS.ASSET_PRICE).toFixed(4)}`,
};




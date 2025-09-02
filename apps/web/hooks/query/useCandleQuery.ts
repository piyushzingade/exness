"use client";

import { useQuery } from "@tanstack/react-query";

import type { KlineInterval, ServerCandleData } from "@repo/types/types";
import { AssetPriceUtils } from "@repo/types/types";
import axios from "axios";

interface CandleQueryParams {
    symbol: string;
    duration: KlineInterval;
    limit: number;
    enabled?: boolean;
    refetchInterval?: number;
}

interface CandleApiResponse {
    candles: Array<{
        timestamp: number;
        open: number; // Integer with 4 decimal precision
        close: number; // Integer with 4 decimal precision
        high: number; // Integer with 4 decimal precision
        low: number; // Integer with 4 decimal precision
        decimals: number;
    }>;
}

const fetchCandles = async ({
    symbol,
    duration,
    limit,
}: Omit<CandleQueryParams, "enabled" | "refetchInterval">): Promise<CandleApiResponse> => {
    const response = await axios.get("http://localhost:3001/api/v1/candles", {
        params: {
            symbol,
            duration,
            limit: limit.toString(),
        },
    });

    if (!response.data) {
        throw new Error("No data received from server");
    }

    if (!response.data.candles || !Array.isArray(response.data.candles)) {
        throw new Error("Invalid response format from server");
    }

    return response.data;
};

export const useCandleQuery = ({
    symbol,
    duration,
    limit = 30,
    enabled = true,
    refetchInterval = 1000, // Default 1 second polling
}: CandleQueryParams) => {
    return useQuery({
        queryKey: ["candles", symbol, duration, limit],
        queryFn: () => fetchCandles({ symbol, duration, limit }),
        enabled,
        refetchInterval,
        refetchIntervalInBackground: true,
        staleTime: 500, // Consider data stale after 500ms for real-time trading
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        select: (data) => ({
            ...data,
            candles: data.candles.map(candle => ({
                ...candle,
                // Add formatted values for display
                open_formatted: AssetPriceUtils.format(candle.open),
                close_formatted: AssetPriceUtils.format(candle.close),
                high_formatted: AssetPriceUtils.format(candle.high),
                low_formatted: AssetPriceUtils.format(candle.low),
                open_value: AssetPriceUtils.fromInteger(candle.open),
                close_value: AssetPriceUtils.fromInteger(candle.close),
                high_value: AssetPriceUtils.fromInteger(candle.high),
                low_value: AssetPriceUtils.fromInteger(candle.low),
            })),
        }),
    });
};

// Hook for getting the latest candle data with automatic polling
export const useLatestCandleData = (
    symbol: string = "btcusdt",
    duration: KlineInterval = "1m" as KlineInterval,
    limit: number = 300
) => {
    return useCandleQuery({
        symbol,
        duration,
        limit,
        enabled: true,
        refetchInterval: 1000, // Poll every 1 second
    });
};

// Hook for getting candle data with custom polling interval
export const useCandleDataWithInterval = (
    symbol: string,
    duration: KlineInterval,
    limit: number,
    pollingInterval: number = 1000
) => {
    return useCandleQuery({
        symbol,
        duration,
        limit,
        enabled: true,
        refetchInterval: pollingInterval,
    });
};
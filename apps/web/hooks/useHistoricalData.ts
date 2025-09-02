import { useState, useEffect } from 'react';

interface HistoricalCandle {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    decimals: number;
}

interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export function useHistoricalData(symbol: string, timeInterval: string) {
    const [historicalCandles, setHistoricalCandles] = useState<Candle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistoricalData = async () => {
            try {
                setLoading(true);
                const response = await fetch(
                    `http://localhost:3001/api/v1/candles?symbol=${symbol}&duration=${timeInterval}&limit=10000`
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch historical data');
                }

                const json = await response.json();
                // Fixed: Use 'candle' instead of 'candles' to match API response
                const data: HistoricalCandle[] = json.candle ?? [];
                console.log('Raw API data:', data);

                if (data.length === 0) {
                    console.log('No candle data received');
                    setHistoricalCandles([]);
                    setError(null);
                    return;
                }

                // Fixed: Handle decimal conversion and use timestamp field
                const formattedCandles: Candle[] = data.map(candle => {
                    const divisor = Math.pow(10, candle.decimals);
                    return {
                        time: Math.floor(candle.timestamp / 1000), // Convert ms to seconds
                        open: candle.open / divisor,
                        high: candle.high / divisor,
                        low: candle.low / divisor,
                        close: candle.close / divisor,
                    };
                });

                // Sort by time to ensure proper order
                formattedCandles.sort((a, b) => a.time - b.time);

                console.log('Formatted candles:', formattedCandles);
                setHistoricalCandles(formattedCandles);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
                console.error('Error fetching historical data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoricalData();
    }, [symbol, timeInterval]);

    return { historicalCandles, loading, error };
}
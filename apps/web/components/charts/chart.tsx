'use client'
import {
    CandlestickSeries,
    createChart,
    type IChartApi,
    type ISeriesApi,
    type Time,
} from 'lightweight-charts';
import React, { useEffect, useRef, useCallback } from 'react';
import { useHistoricalData } from '../../hooks/useHistoricalData';
import { useWebSocket } from '../../hooks/useWebSocket';

interface ChartProps {
    symbol?: string;
    interval?: string;
    width?: number;
    height?: number;
}

interface CandleData {
    time: Time;
    open: number;
    high: number;
    low: number;
    close: number;
}

interface OrderBookData {
    type: string;
    data: {
        message: {
            buy: number;
            sell: number;
        }
    };
}

const Chart = ({
    symbol = 'btcusdt',
    interval = '1m',
    width = 900,
    height = 500
}: ChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const currentCandleRef = useRef<CandleData | null>(null);
    const isChartReadyRef = useRef<boolean>(false);

    const getIntervalMs = (interval: string): number => {
        const intervalMap: { [key: string]: number } = {
            '1s': 1 * 1000,
            '1m': 60 * 1000,
            '3m': 3 * 60 * 1000,
            '5m': 5 * 60 * 1000,
            '15m': 15 * 60 * 1000,
            '30m': 30 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '2h': 2 * 60 * 60 * 1000,
            '4h': 4 * 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '8h': 8 * 60 * 60 * 1000,
            '12h': 12 * 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000,
        };
        return intervalMap[interval] || 60 * 1000;
    };

    const intervalMs = getIntervalMs(interval);

    const { historicalCandles, loading: histLoading, error: histError } = useHistoricalData(symbol.toLowerCase(), interval);

    const handleOrderBookUpdate = useCallback((orderBookData: OrderBookData) => {
        if (!candleSeriesRef.current || !isChartReadyRef.current) return;

        const bidPrice = orderBookData.data.message.buy;
        const askPrice = orderBookData.data.message.sell;
        const midPrice = (bidPrice + askPrice) / 2;

        const currentTime = Date.now();
        const candleTime = Math.floor(currentTime / intervalMs) * intervalMs;
        const candleTimeSeconds = Math.floor(candleTime / 1000) as Time;

        if (currentCandleRef.current && currentCandleRef.current.time === candleTimeSeconds) {
            // Update existing candle
            const updatedCandle: CandleData = {
                time: candleTimeSeconds,
                open: currentCandleRef.current.open,
                high: Math.max(currentCandleRef.current.high, midPrice),
                low: Math.min(currentCandleRef.current.low, midPrice),
                close: midPrice,
            };

            currentCandleRef.current = updatedCandle;
            candleSeriesRef.current.update(updatedCandle);
        } else {
            // Create new candle
            const newCandle: CandleData = {
                time: candleTimeSeconds,
                open: midPrice,
                high: midPrice,
                low: midPrice,
                close: midPrice,
            };

            currentCandleRef.current = newCandle;
            candleSeriesRef.current.update(newCandle);
        }
    }, [intervalMs]);

    const { connectionStatus, lastOrderBook, reconnect } = useWebSocket(
        symbol,
        undefined,
        handleOrderBookUpdate
    );

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            width,
            height,
            layout: {
                background: { color: '#101010' },
                textColor: '#e0e0e0',
            },
            grid: {
                vertLines: { color: '#181818' },
                horzLines: { color: '#181818' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
                borderColor: '#181818',
            },
            rightPriceScale: {
                borderColor: '#181818',
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candleSeries;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({
                    width: chartContainerRef.current.clientWidth,
                    height: height,
                });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            isChartReadyRef.current = false;
            currentCandleRef.current = null;
            chart.remove();
        };
    }, [width, height]);

    // Reset chart data when interval changes
    useEffect(() => {
        if (candleSeriesRef.current) {
            candleSeriesRef.current.setData([]);
            currentCandleRef.current = null;
            isChartReadyRef.current = false;
        }
    }, [interval, symbol]);

    // Load historical data
    useEffect(() => {
        if (!candleSeriesRef.current || histLoading || histError || historicalCandles.length === 0) {
            return;
        }

        // Transform and validate data
        const transformedData: CandleData[] = historicalCandles
            .map((item: any) => {
                const candle = {
                    time: item.time as Time,
                    open: parseFloat(item.open.toString()),
                    high: parseFloat(item.high.toString()),
                    low: parseFloat(item.low.toString()),
                    close: parseFloat(item.close.toString()),
                };

                // Validate the candle data
                if (isNaN(candle.open) || isNaN(candle.high) || isNaN(candle.low) || isNaN(candle.close)) {
                    return null;
                }

                return candle;
            })
            .filter(Boolean) as CandleData[];

        // Sort by time to ensure proper order
        transformedData.sort((a, b) => (a.time as number) - (b.time as number));

        candleSeriesRef.current.setData(transformedData);

        // Store the last candle for real-time updates
        if (transformedData.length > 0) {
            currentCandleRef.current = transformedData[transformedData.length - 1];
        }

        // Fit content and scroll to show recent data
        if (chartRef.current) {
            chartRef.current.timeScale().fitContent();
            chartRef.current.timeScale().scrollToPosition(2, true);
        }

        isChartReadyRef.current = true;
    }, [historicalCandles, histLoading, histError, interval, symbol]);

    return (
        <div className="relative">
            {/* Status indicators */}
            <div className="mb-2 flex gap-4 text-sm items-center flex-wrap">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${histLoading ? 'bg-yellow-500' : histError ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    <span className="text-black">
                        Historical: {histLoading ? 'Loading...' : histError ? 'Error' : `${historicalCandles.length} candles`}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className="text-black">WebSocket: {connectionStatus}</span>
                    {connectionStatus !== 'connected' && (
                        <button
                            onClick={reconnect}
                            className="ml-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                        >
                            Reconnect
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-black">Symbol: {symbol.toUpperCase()}</span>
                    <span className="text-black">Interval: {interval}</span>
                    <span className="text-black">Ready: {isChartReadyRef.current ? '✓' : '✗'}</span>
                </div>

                {lastOrderBook && (
                    <div className="flex items-center gap-2">
                        <span className="text-black">
                            Bid: ${lastOrderBook.data.message.buy} | Ask: ${lastOrderBook.data.message.sell}
                            | Mid: ${((lastOrderBook.data.message.buy + lastOrderBook.data.message.sell) / 2).toFixed(2)}
                        </span>
                    </div>
                )}
            </div>

            {/* Error display */}
            {histError && (
                <div className="mb-2 p-2 bg-red-900 text-red-200 rounded text-sm">
                    Error: {histError}
                </div>
            )}

            {/* Chart container */}
            <div
                ref={chartContainerRef}
                className="border border-dashed border-[#181818] overflow-hidden bg-[#101010] rounded"
                style={{ width: `${width}px`, height: `${height}px` }}
            />

            {/* Scroll to realtime button */}
            <div className="mt-2">
                <button
                    onClick={() => {
                        if (chartRef.current) {
                            chartRef.current.timeScale().scrollToRealTime();
                        }
                    }}
                    className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 text-sm"
                >
                    Go to realtime
                </button>
            </div>
        </div>
    );
};

export default Chart;
"use client";

import { useEffect, useRef } from "react";
import {
    createChart,
    CandlestickSeries,
    ColorType,
    type IChartApi,
    type ISeriesApi,
    type CandlestickData,
    type UTCTimestamp,
} from "lightweight-charts";

// ---- Candle type (strict) ----
type Candle = CandlestickData & {
    time: UTCTimestamp;
};

// ---- Data generator ----
function generateData(
    numberOfCandles = 500,
    updatesPerCandle = 5,
    startAt = 100
): { initialData: Candle[]; realtimeUpdates: Candle[] } {
    let randomFactor = 25 + Math.random() * 25;

    const samplePoint = (i: number) =>
        i *
        (0.5 +
            Math.sin(i / 1) * 0.2 +
            Math.sin(i / 2) * 0.4 +
            Math.sin(i / randomFactor) * 0.8 +
            Math.sin(i / 50) * 0.5) +
        200 +
        i * 2;

    const createCandle = (val: number, time: number): Candle => ({
        time: time as UTCTimestamp,
        open: val,
        high: val,
        low: val,
        close: val,
    });

    const updateCandle = (candle: Candle, val: number): Candle => ({
        time: candle.time,
        open: candle.open,
        close: val,
        high: Math.max(candle.high, val),
        low: Math.min(candle.low, val),
    });

    const date = new Date(Date.UTC(2018, 0, 1, 12, 0, 0, 0));
    const numberOfPoints = numberOfCandles * updatesPerCandle;
    const initialData: Candle[] = [];
    const realtimeUpdates: Candle[] = [];
    let lastCandle: Candle | undefined;
    let previousValue = samplePoint(-1);

    for (let i = 0; i < numberOfPoints; ++i) {
        if (i % updatesPerCandle === 0) {
            date.setUTCDate(date.getUTCDate() + 1);
        }
        const time = date.getTime() / 1000;
        let value = samplePoint(i);
        const diff = (value - previousValue) * Math.random();
        value = previousValue + diff;
        previousValue = value;

        if (i % updatesPerCandle === 0) {
            const candle = createCandle(value, time);
            lastCandle = candle;
            if (i >= startAt) realtimeUpdates.push(candle);
        } else if (lastCandle) {
            const newCandle = updateCandle(lastCandle, value);
            lastCandle = newCandle;
            if (i >= startAt) {
                realtimeUpdates.push(newCandle);
            } else if ((i + 1) % updatesPerCandle === 0) {
                initialData.push(newCandle);
            }
        }
    }

    return { initialData, realtimeUpdates };
}

// ---- Component ----
export default function RealtimeChart() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            layout: {
                textColor: "black",
                background: {
                    type: ColorType.Solid, // ✅ properly typed
                    color: "white",
                },
            },
            height: 300,
        });
        chartRef.current = chart;

        const series = chart.addSeries(CandlestickSeries, {
            upColor: "#26a69a",
            downColor: "#ef5350",
            borderVisible: false,
            wickUpColor: "#26a69a",
            wickDownColor: "#ef5350",
        });
        seriesRef.current = series;

        const { initialData, realtimeUpdates } = generateData(2500, 20, 1000);
        series.setData(initialData);
        chart.timeScale().fitContent();
        chart.timeScale().scrollToPosition(5, true);

        function* getNextRealtimeUpdate(
            realtimeData: Candle[]
        ): Generator<Candle, null> {
            for (const dataPoint of realtimeData) yield dataPoint;
            return null;
        }

        const streamingDataProvider = getNextRealtimeUpdate(realtimeUpdates);

        const id = setInterval(() => {
            const update = streamingDataProvider.next();
            if (update.done) {
                clearInterval(id);
                return;
            }
            series.update(update.value);
        }, 100);

        const onResize = () => {
            if (!containerRef.current) return;
            chart.applyOptions({ width: containerRef.current.clientWidth });
        };
        window.addEventListener("resize", onResize);
        onResize();

        return () => {
            clearInterval(id);
            window.removeEventListener("resize", onResize);
            chart.remove();
        };
    }, []);

    const handleScrollToRealtime = () => {
        chartRef.current?.timeScale().scrollToRealTime();
    };

    return (
        <div className="flex flex-col gap-4">
            <div ref={containerRef} className="w-full h-[300px]" />
            <div className="flex gap-2">
                <button
                    onClick={handleScrollToRealtime}
                    className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    Go to realtime
                </button>
            </div>
        </div>
    );
}

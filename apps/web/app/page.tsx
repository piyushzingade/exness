"use client";

import { useState } from "react";
import { KlineInterval } from "@repo/types/types";
import Chart from "../components/charts/chart";

export default function Home() {
  const [chartInterval, setChartInterval] = useState<KlineInterval>(
    KlineInterval.ONE_MINUTE
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-2">
      {/* <Chart interval={chartInterval} onIntervalChange={setChartInterval} /> */}
      <Chart />
    </div>
  );
}

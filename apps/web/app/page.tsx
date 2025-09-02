'use client';

import { useState } from "react";
import { BTC, ETH, SOL } from "../components/icons";
import Chart from "../components/charts/chart";

const TradingPage = () => {
  const [timeInterval, setTimeInterval] = useState('1m');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  const intervalButtons = [
    { key: '1m', label: '1m' },
    { key: '5m', label: '5m' },
    { key: '30m', label: '30m' },
    { key: '1h', label: '1h' },
  ];


  const symbolOptionsWithIcons = [
    { key: 'BTCUSDT', label: 'BTC', icon: <BTC /> },
    { key: 'ETHUSDT', label: 'ETH', icon: <ETH /> },
    { key: 'SOLUSDT', label: 'SOL', icon: <SOL /> },
  ];

  return (
    <div className="p-4 flex">
      <div className="w-max">
        <div className="border border-dashed w-max border-[#202020] p-4">
          <Chart
            symbol={selectedSymbol}
            interval={timeInterval}
            width={900}
            height={500}
          />
        </div>

        {/* <div className="border-x border-b border-dashed w-full border-[#202020] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CustomDropdown
                value={selectedSymbol}
                onChange={setSelectedSymbol}
                options={symbolOptionsWithIcons}
              />
            </div>

            <div className="flex items-center gap-2">
              {intervalButtons.map((interval) => (
                <button
                  key={interval.key}
                  className={`px-4 py-1 border border-dashed border-[#202020] bg-[#101010] cursor-pointer transition-colors font-mono ${timeInterval === interval.key
                    ? ' border-[#808080]'
                    : 'text-white hover:border-[#808080]'
                    }`}
                  onClick={() => setTimeInterval(interval.key)}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>
        </div> */}
      </div>

      {/* <div className="w-full">
        <BidAskTable symbol={["btcusdt", "solusdt", "ethusdt"]} />
        <PriceCard selectedSymbol={selectedSymbol} />
      </div> */}
    </div>
  );
};

export default TradingPage;
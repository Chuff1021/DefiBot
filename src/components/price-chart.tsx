"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, type IChartApi, type ISeriesApi, type CandlestickData, CandlestickSeries } from "lightweight-charts";

import type { MarketCandle } from "@/lib/types";

type Props = {
  candles: MarketCandle[];
};

export function PriceChart({ candles }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#b9c4d8",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      },
      grid: {
        vertLines: { color: "rgba(185, 196, 216, 0.08)" },
        horzLines: { color: "rgba(185, 196, 216, 0.08)" },
      },
      crosshair: {
        vertLine: { color: "rgba(110, 231, 183, 0.35)" },
        horzLine: { color: "rgba(110, 231, 183, 0.35)" },
      },
      rightPriceScale: {
        borderColor: "rgba(185, 196, 216, 0.14)",
      },
      timeScale: {
        borderColor: "rgba(185, 196, 216, 0.14)",
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#6ee7b7",
      downColor: "#fb7185",
      wickUpColor: "#6ee7b7",
      wickDownColor: "#fb7185",
      borderVisible: false,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) {
      return;
    }

    const formatted: CandlestickData[] = candles.map((candle) => ({
      time: Math.floor(new Date(candle.time).getTime() / 1000) as CandlestickData["time"],
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(formatted);
    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  return <div className="chart-shell" ref={containerRef} />;
}

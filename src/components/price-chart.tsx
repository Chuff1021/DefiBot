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
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#5f6b7a",
        fontFamily: "\"Avenir Next\", \"Segoe UI\", sans-serif",
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.12)" },
        horzLines: { color: "rgba(148, 163, 184, 0.12)" },
      },
      crosshair: {
        vertLine: { color: "rgba(0, 192, 135, 0.25)" },
        horzLine: { color: "rgba(0, 192, 135, 0.25)" },
      },
      rightPriceScale: {
        borderColor: "rgba(148, 163, 184, 0.2)",
      },
      timeScale: {
        borderColor: "rgba(148, 163, 184, 0.2)",
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#00c087",
      downColor: "#f25f6b",
      wickUpColor: "#00c087",
      wickDownColor: "#f25f6b",
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

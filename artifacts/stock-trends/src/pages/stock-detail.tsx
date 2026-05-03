import React, { useState } from "react";
import { useParams } from "wouter";
import { Star } from "lucide-react";
import {
  useGetStockQuote,
  useGetStockHistory,
  getGetStockQuoteQueryKey,
  getGetStockHistoryQueryKey
} from "@workspace/api-client-react";
import { GetStockHistoryPeriod, GetStockHistoryInterval } from "@workspace/api-zod/src/generated/types";
import { formatCurrency, formatPercent, formatCompactNumber } from "@/lib/format";
import { useWatchlist } from "@/hooks/use-watchlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const PERIODS: { label: string, period: GetStockHistoryPeriod, interval: GetStockHistoryInterval }[] = [
  { label: "1D", period: "1d", interval: "5m" },
  { label: "5D", period: "5d", interval: "15m" },
  { label: "1M", period: "1mo", interval: "1d" },
  { label: "3M", period: "3mo", interval: "1d" },
  { label: "6M", period: "6mo", interval: "1d" },
  { label: "1Y", period: "1y", interval: "1d" },
  { label: "2Y", period: "2y", interval: "1wk" },
  { label: "5Y", period: "5y", interval: "1wk" },
];

export default function StockDetail() {
  const params = useParams();
  const symbol = params.symbol || "";
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const { toggle, isWatched } = useWatchlist();
  const watched = isWatched(symbol);

  const { data: quote, isLoading: loadingQuote } = useGetStockQuote(symbol, {
    query: {
      enabled: !!symbol,
      queryKey: getGetStockQuoteQueryKey(symbol),
      refetchInterval: 30000,
    }
  });

  const { data: history, isLoading: loadingHistory } = useGetStockHistory(
    symbol,
    { period: selectedPeriod.period, interval: selectedPeriod.interval },
    {
      query: {
        enabled: !!symbol,
        queryKey: getGetStockHistoryQueryKey(symbol, { period: selectedPeriod.period, interval: selectedPeriod.interval }),
        refetchInterval: 30000,
      }
    }
  );

  const isPositive = quote ? quote.change >= 0 : true;
  const colorVar = isPositive ? "var(--color-positive)" : "var(--color-negative)";

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    if (selectedPeriod.period === "1d") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (!symbol) return <div className="p-8">No symbol provided</div>;

  return (
    <div className="space-y-6">
      {/* Quote Card */}
      <Card className="bg-card border-card-border shadow-md">
        <CardContent className="p-6">
          {loadingQuote || !quote ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-16 w-64" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border mt-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                <div className="flex items-start gap-3">
                  <div>
                    <h1 className="text-3xl font-bold uppercase text-primary tracking-tight">{quote.symbol}</h1>
                    <h2 className="text-lg text-muted-foreground">{quote.name}</h2>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                      {quote.exchange && <span className="bg-muted px-2 py-0.5 rounded">{quote.exchange}</span>}
                      {quote.currency && <span>{quote.currency}</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => toggle(symbol)}
                    className={`mt-1 p-2 rounded-md border transition-all ${
                      watched
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                    aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
                    title={watched ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    <Star className={`h-5 w-5 ${watched ? "fill-primary" : ""}`} />
                  </button>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                  <div className="text-4xl font-mono font-bold">{formatCurrency(quote.price, quote.currency)}</div>
                  <div className={`text-xl font-mono mt-1 ${isPositive ? "text-positive" : "text-negative"}`}>
                    {isPositive ? "+" : ""}{formatCurrency(quote.change, quote.currency)} ({formatPercent(quote.changePercent)})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Open</span>
                  <span className="font-mono text-lg">{quote.open ? formatCurrency(quote.open) : "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">High / Low</span>
                  <span className="font-mono text-lg">
                    {quote.high ? formatCurrency(quote.high) : "-"} / {quote.low ? formatCurrency(quote.low) : "-"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Volume</span>
                  <span className="font-mono text-lg">{quote.volume ? formatCompactNumber(quote.volume) : "-"}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground mb-1">Market Cap</span>
                  <span className="font-mono text-lg">{quote.marketCap ? formatCompactNumber(quote.marketCap) : "-"}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chart Card */}
      <Card className="bg-card border-card-border shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border border-opacity-50">
          <CardTitle className="text-lg font-medium">Price History</CardTitle>
          <div className="flex space-x-1 bg-muted p-1 rounded-md">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setSelectedPeriod(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-sm transition-colors ${
                  selectedPeriod.label === p.label
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          {loadingHistory || !history ? (
            <div className="h-[400px] w-full flex items-center justify-center">
              <span className="text-muted-foreground animate-pulse">Loading chart data...</span>
            </div>
          ) : history.data.length === 0 ? (
            <div className="h-[400px] w-full flex items-center justify-center">
              <span className="text-muted-foreground">No historical data available for this period.</span>
            </div>
          ) : (
            <div className="flex flex-col space-y-4 px-4 pb-4">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history.data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colorVar} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={colorVar} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={formatXAxis}
                      minTickGap={30}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      domain={["auto", "auto"]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(val) => formatCurrency(val).replace("$", "")}
                      orientation="right"
                      dx={10}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: colorVar, fontFamily: "monospace" }}
                      labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                      formatter={(value: number) => [formatCurrency(value), "Price"]}
                      labelFormatter={(label: number) => formatXAxis(label)}
                    />
                    <Area
                      type="monotone"
                      dataKey="close"
                      stroke={colorVar}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[100px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={history.data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis dataKey="volume" hide />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      itemStyle={{ color: "hsl(var(--primary))", fontFamily: "monospace" }}
                      labelStyle={{ display: "none" }}
                      formatter={(value: number) => [formatCompactNumber(value), "Volume"]}
                    />
                    <Bar
                      dataKey="volume"
                      fill="hsl(var(--muted-foreground))"
                      opacity={0.3}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { useGetMarketSummary, getGetMarketSummaryQueryKey } from "@workspace/api-client-react";
import { formatCurrency, formatPercent } from "@/lib/format";
import { TrendingUp, TrendingDown } from "lucide-react";

export function MarketIndices() {
  const { data: indices, isLoading } = useGetMarketSummary({
    query: {
      queryKey: getGetMarketSummaryQueryKey(),
      refetchInterval: 30000,
    }
  });

  if (isLoading || !indices) {
    return (
      <div className="w-full bg-card border-b border-border h-10 flex items-center px-4 overflow-hidden">
        <div className="flex space-x-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-4 w-32 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border-b border-border h-10 flex items-center overflow-x-auto no-scrollbar">
      <div className="flex space-x-8 px-4 min-w-max">
        {indices.map((index) => {
          const isPositive = index.change >= 0;
          return (
            <div key={index.symbol} className="flex items-center space-x-2 text-sm">
              <span className="font-semibold text-muted-foreground">{index.name}</span>
              <span className="font-mono">{formatCurrency(index.price).replace('$', '')}</span>
              <span className={`flex items-center font-mono ${isPositive ? 'text-positive' : 'text-negative'}`}>
                {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {formatPercent(index.changePercent)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import React from "react";
import { useGetMarketMovers, useGetTrendingStocks, getGetMarketMoversQueryKey, getGetTrendingStocksQueryKey } from "@workspace/api-client-react";
import { StockRow, StockRowSkeleton } from "@/components/stock/StockRow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  const { data: movers, isLoading: loadingMovers } = useGetMarketMovers({
    query: {
      queryKey: getGetMarketMoversQueryKey(),
      refetchInterval: 30000,
    }
  });

  const { data: trending, isLoading: loadingTrending } = useGetTrendingStocks({
    query: {
      queryKey: getGetTrendingStocksQueryKey(),
      refetchInterval: 30000,
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-card-border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-positive uppercase tracking-wider flex items-center">
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMovers ? (
              Array(5).fill(0).map((_, i) => <StockRowSkeleton key={i} />)
            ) : movers?.gainers.length ? (
              movers.gainers.slice(0, 5).map(stock => <StockRow key={stock.symbol} stock={stock} />)
            ) : (
              <div className="p-4 text-sm text-muted-foreground text-center">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-negative uppercase tracking-wider">
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingMovers ? (
              Array(5).fill(0).map((_, i) => <StockRowSkeleton key={i} />)
            ) : movers?.losers.length ? (
              movers.losers.slice(0, 5).map(stock => <StockRow key={stock.symbol} stock={stock} />)
            ) : (
              <div className="p-4 text-sm text-muted-foreground text-center">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-card-border shadow-md md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-primary uppercase tracking-wider">
              Trending & Active
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loadingTrending ? (
              Array(5).fill(0).map((_, i) => <StockRowSkeleton key={i} />)
            ) : trending?.length ? (
              trending.slice(0, 5).map(stock => <StockRow key={stock.symbol} stock={stock} />)
            ) : (
              <div className="p-4 text-sm text-muted-foreground text-center">No data available</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "wouter";
import { Star, Trash2, TrendingUp } from "lucide-react";
import { useGetStockQuote, getGetStockQuoteQueryKey } from "@workspace/api-client-react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface WatchlistRowProps {
  symbol: string;
  onRemove: (symbol: string) => void;
}

function WatchlistRow({ symbol, onRemove }: WatchlistRowProps) {
  const { data: quote, isLoading } = useGetStockQuote(symbol, {
    query: {
      enabled: !!symbol,
      queryKey: getGetStockQuoteQueryKey(symbol),
      refetchInterval: 30000,
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex flex-col space-y-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end space-y-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex items-center justify-between p-4 border-b border-border text-muted-foreground">
        <span className="font-bold uppercase">{symbol}</span>
        <button
          onClick={() => onRemove(symbol)}
          className="p-1.5 rounded hover:bg-muted/60 transition-colors text-muted-foreground hover:text-negative"
          aria-label={`Remove ${symbol} from watchlist`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  const isPositive = quote.change >= 0;

  return (
    <div className="group flex items-center justify-between p-4 border-b border-border hover:bg-muted/30 transition-colors">
      <Link href={`/stock/${quote.symbol}`} className="flex flex-1 items-center justify-between mr-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-base uppercase">{quote.symbol}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[150px] md:max-w-xs">{quote.name}</span>
        </div>
        <div className="flex flex-col items-end ml-4 shrink-0">
          <span className="font-mono text-base">{formatCurrency(quote.price, quote.currency)}</span>
          <span className={`font-mono text-sm ${isPositive ? "text-positive" : "text-negative"}`}>
            {isPositive ? "+" : ""}{formatCurrency(quote.change, quote.currency)} ({formatPercent(quote.changePercent)})
          </span>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(symbol);
        }}
        className="p-1.5 rounded hover:bg-muted/60 transition-colors text-muted-foreground hover:text-negative shrink-0"
        aria-label={`Remove ${symbol} from watchlist`}
        title="Remove from watchlist"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Watchlist() {
  const { symbols, remove } = useWatchlist();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 pt-2">
        <Star className="h-6 w-6 text-primary fill-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
        {symbols.length > 0 && (
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {symbols.length} {symbols.length === 1 ? "stock" : "stocks"}
          </span>
        )}
      </div>

      {symbols.length === 0 ? (
        <Card className="bg-card border-card-border shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Star className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-semibold">No stocks saved yet</p>
              <p className="text-sm text-muted-foreground">
                Search for a stock and click the star icon to add it to your watchlist.
              </p>
            </div>
            <Link
              href="/search"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mt-2"
            >
              <TrendingUp className="h-4 w-4" />
              Browse stocks
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-card-border shadow-md">
          <CardHeader className="pb-0 border-b border-border">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Saved Stocks — auto-refreshes every 30s
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {symbols.map((symbol) => (
              <WatchlistRow key={symbol} symbol={symbol} onRemove={remove} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

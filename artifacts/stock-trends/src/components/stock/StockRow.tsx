import React from "react";
import { Link } from "wouter";
import { Star } from "lucide-react";
import { StockQuote } from "@workspace/api-client-react/src/generated/api.schemas";
import { formatCurrency, formatPercent } from "@/lib/format";
import { useWatchlist } from "@/hooks/use-watchlist";

interface StockRowProps {
  stock: StockQuote;
}

export function StockRow({ stock }: StockRowProps) {
  const isPositive = stock.change >= 0;
  const { toggle, isWatched } = useWatchlist();
  const watched = isWatched(stock.symbol);

  return (
    <div className="group flex items-center border-b border-border hover:bg-muted/30 transition-colors">
      <Link href={`/stock/${stock.symbol}`} className="flex flex-1 items-center justify-between p-4 cursor-pointer min-w-0">
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-base uppercase">{stock.symbol}</span>
          <span className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-xs">{stock.name}</span>
        </div>
        <div className="flex flex-col items-end ml-2 shrink-0">
          <span className="font-mono text-base">{formatCurrency(stock.price, stock.currency)}</span>
          <span className={`font-mono text-sm ${isPositive ? "text-positive" : "text-negative"}`}>
            {isPositive ? "+" : ""}{formatCurrency(stock.change, stock.currency)} ({formatPercent(stock.changePercent)})
          </span>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          toggle(stock.symbol);
        }}
        className={`p-3 shrink-0 transition-colors ${watched ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
        aria-label={watched ? `Remove ${stock.symbol} from watchlist` : `Add ${stock.symbol} to watchlist`}
        title={watched ? "Remove from watchlist" : "Add to watchlist"}
      >
        <Star className={`h-4 w-4 ${watched ? "fill-primary" : ""}`} />
      </button>
    </div>
  );
}

export function StockRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex flex-col space-y-2">
        <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex flex-col items-end space-y-2">
        <div className="h-5 w-20 bg-muted rounded animate-pulse" />
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

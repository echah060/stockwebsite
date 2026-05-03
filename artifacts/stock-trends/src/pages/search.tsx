import React, { useState } from "react";
import { Link } from "wouter";
import { Search as SearchIcon, ArrowRight } from "lucide-react";
import { useSearchStocks, getSearchStocksQueryKey } from "@workspace/api-client-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function Search() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading } = useSearchStocks(
    { q: debouncedQuery },
    {
      query: {
        queryKey: getSearchStocksQueryKey({ q: debouncedQuery }),
        enabled: debouncedQuery.length > 0,
      }
    }
  );

  return (
    <div className="max-w-2xl mx-auto mt-8 space-y-6">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search symbols or companies..."
          className="w-full h-16 pl-14 text-xl bg-card border-card-border focus-visible:ring-primary shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>

      {debouncedQuery.length > 0 && (
        <Card className="bg-card border-card-border shadow-md overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Searching...</div>
          ) : results && results.length > 0 ? (
            <div className="flex flex-col">
              {results.map((result) => (
                <Link key={`${result.symbol}-${result.exchange}`} href={`/stock/${result.symbol}`}>
                  <div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors group cursor-pointer">
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg text-primary">{result.symbol}</span>
                        {result.exchange && (
                          <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
                            {result.exchange}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-foreground/80">{result.name}</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No results found for "{debouncedQuery}"
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

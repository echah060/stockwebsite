import React from "react";
import { Link, useLocation } from "wouter";
import { Search, Activity, Star } from "lucide-react";
import { useHealthCheck, getHealthCheckQueryKey } from "@workspace/api-client-react";
import { useWatchlist } from "@/hooks/use-watchlist";

export function Navbar() {
  const [location] = useLocation();
  const { data: health } = useHealthCheck({
    query: {
      queryKey: getHealthCheckQueryKey(),
      refetchInterval: 60000,
    }
  });
  const { symbols } = useWatchlist();
  const isHealthy = health?.status === "ok";

  const navLink = (href: string, label: React.ReactNode, exact = false) => {
    const active = exact ? location === href : location.startsWith(href);
    return (
      <Link
        href={href}
        className={`transition-colors flex items-center gap-1.5 ${
          active ? "text-foreground font-semibold" : "text-foreground/60 hover:text-foreground/80"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="font-bold tracking-tight text-lg">Stock Trends</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLink("/", "Dashboard", true)}
            {navLink(
              "/watchlist",
              <>
                <Star className="h-4 w-4" />
                Watchlist
                {symbols.length > 0 && (
                  <span className="ml-0.5 bg-primary/20 text-primary text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {symbols.length}
                  </span>
                )}
              </>
            )}
            {navLink(
              "/search",
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </nav>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
              <div className={`h-2 w-2 rounded-full ${isHealthy ? "bg-positive" : "bg-negative"}`} />
              <span className="uppercase tracking-wider">{isHealthy ? "API Connected" : "Offline"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

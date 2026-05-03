import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "stock-trends-watchlist";

function loadFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as string[];
    return [];
  } catch {
    return [];
  }
}

function saveToStorage(symbols: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
  } catch {
    // ignore storage errors
  }
}

export function useWatchlist() {
  const [symbols, setSymbols] = useState<string[]>(() => loadFromStorage());

  useEffect(() => {
    saveToStorage(symbols);
  }, [symbols]);

  const add = useCallback((symbol: string) => {
    setSymbols((prev) =>
      prev.includes(symbol.toUpperCase()) ? prev : [...prev, symbol.toUpperCase()]
    );
  }, []);

  const remove = useCallback((symbol: string) => {
    setSymbols((prev) => prev.filter((s) => s !== symbol.toUpperCase()));
  }, []);

  const toggle = useCallback((symbol: string) => {
    setSymbols((prev) => {
      const upper = symbol.toUpperCase();
      return prev.includes(upper) ? prev.filter((s) => s !== upper) : [...prev, upper];
    });
  }, []);

  const isWatched = useCallback(
    (symbol: string) => symbols.includes(symbol.toUpperCase()),
    [symbols]
  );

  return { symbols, add, remove, toggle, isWatched };
}

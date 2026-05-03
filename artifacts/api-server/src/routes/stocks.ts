import { Router, type IRouter } from "express";
import YahooFinance from "yahoo-finance2";
import {
  SearchStocksQueryParams,
  GetStockQuoteParams,
  GetStockHistoryParams,
  GetStockHistoryQueryParams,
} from "@workspace/api-zod";

const yf = new YahooFinance();
const router: IRouter = Router();

const TRENDING_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA",
  "META", "TSLA", "NFLX", "AMD", "INTC",
];

const INDEX_SYMBOLS = [
  { symbol: "^GSPC", name: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ" },
  { symbol: "^DJI", name: "Dow Jones" },
  { symbol: "^RUT", name: "Russell 2000" },
];

async function fetchQuote(symbol: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quote: any = await (yf as any).quote(symbol);
  return {
    symbol: quote.symbol as string,
    name: (quote.longName ?? quote.shortName ?? symbol) as string,
    price: (quote.regularMarketPrice ?? 0) as number,
    change: (quote.regularMarketChange ?? 0) as number,
    changePercent: (quote.regularMarketChangePercent ?? 0) as number,
    open: quote.regularMarketOpen as number | undefined,
    high: quote.regularMarketDayHigh as number | undefined,
    low: quote.regularMarketDayLow as number | undefined,
    previousClose: quote.regularMarketPreviousClose as number | undefined,
    volume: quote.regularMarketVolume as number | undefined,
    marketCap: quote.marketCap as number | undefined,
    exchange: quote.fullExchangeName as string | undefined,
    currency: quote.currency as string | undefined,
    timestamp: quote.regularMarketTime
      ? Math.floor(new Date(quote.regularMarketTime as string).getTime() / 1000)
      : undefined,
  };
}

router.get("/stocks/search", async (req, res) => {
  const parsed = SearchStocksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { q } = parsed.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const results: any = await (yf as any).search(q, { newsCount: 0 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const quotes = ((results.quotes ?? []) as any[]).slice(0, 10).map((r: any) => ({
    symbol: r.symbol as string,
    name: (r.longname ?? r.shortname ?? r.symbol) as string,
    exchange: r.exchange as string | undefined,
    type: r.quoteType as string | undefined,
  }));
  res.json(quotes);
});

router.get("/stocks/quote/:symbol", async (req, res) => {
  const parsed = GetStockQuoteParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid symbol" });
    return;
  }
  const { symbol } = parsed.data;

  const data = await fetchQuote(symbol);
  if (!data.price) {
    res.status(404).json({ error: "Stock not found" });
    return;
  }
  res.json(data);
});

router.get("/stocks/history/:symbol", async (req, res) => {
  const paramsParsed = GetStockHistoryParams.safeParse(req.params);
  if (!paramsParsed.success) {
    res.status(400).json({ error: "Invalid symbol" });
    return;
  }
  const queryParsed = GetStockHistoryQueryParams.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }
  const { symbol } = paramsParsed.data;
  const { period, interval } = queryParsed.data;

  const periodMap: Record<string, string> = {
    "1d": "1d", "5d": "5d", "1mo": "1mo", "3mo": "3mo",
    "6mo": "6mo", "1y": "1y", "2y": "2y", "5y": "5y",
  };
  const intervalMap: Record<string, "1m" | "5m" | "15m" | "1h" | "1d" | "1wk"> = {
    "1m": "1m", "5m": "5m", "15m": "15m", "1h": "1h",
    "1d": "1d", "1wk": "1wk",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chart: any = await (yf as any).chart(symbol, {
    period1: getPeriodStart(period ?? "1mo"),
    interval: intervalMap[interval ?? "1d"] ?? "1d",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = ((chart.quotes ?? []) as any[]).map((p: any) => ({
    timestamp: Math.floor(new Date(p.date as string).getTime() / 1000),
    open: p.open as number | undefined,
    high: p.high as number | undefined,
    low: p.low as number | undefined,
    close: (p.close ?? 0) as number,
    volume: p.volume as number | undefined,
  }));

  res.json({
    symbol,
    period: periodMap[period ?? "1mo"] ?? "1mo",
    interval: intervalMap[interval ?? "1d"] ?? "1d",
    data,
  });
});

router.get("/stocks/movers", async (_req, res) => {
  const [gainers, losers, actives] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (yf as any).screener({ scrIds: "day_gainers", count: 6 }).catch(() => ({ quotes: [] })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (yf as any).screener({ scrIds: "day_losers", count: 6 }).catch(() => ({ quotes: [] })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (yf as any).screener({ scrIds: "most_actives", count: 6 }).catch(() => ({ quotes: [] })),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapScreener = (q: any) => ({
    symbol: q.symbol as string,
    name: (q.longName ?? q.shortName ?? q.symbol) as string,
    price: (q.regularMarketPrice ?? 0) as number,
    change: (q.regularMarketChange ?? 0) as number,
    changePercent: (q.regularMarketChangePercent ?? 0) as number,
    volume: q.regularMarketVolume as number | undefined,
    marketCap: q.marketCap as number | undefined,
  });

  res.json({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gainers: (gainers.quotes as any[]).map(mapScreener),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    losers: (losers.quotes as any[]).map(mapScreener),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actives: (actives.quotes as any[]).map(mapScreener),
  });
});

router.get("/stocks/trending", async (_req, res) => {
  const quotes = await Promise.all(
    TRENDING_SYMBOLS.map((s) => fetchQuote(s).catch(() => null))
  );
  res.json(quotes.filter(Boolean));
});

router.get("/stocks/market-summary", async (_req, res) => {
  const quotes = await Promise.all(
    INDEX_SYMBOLS.map(async ({ symbol, name }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q: any = await (yf as any).quote(symbol).catch(() => null);
      if (!q) return null;
      return {
        symbol,
        name,
        price: (q.regularMarketPrice ?? 0) as number,
        change: (q.regularMarketChange ?? 0) as number,
        changePercent: (q.regularMarketChangePercent ?? 0) as number,
      };
    })
  );
  res.json(quotes.filter(Boolean));
});

function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case "1d": return new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    case "5d": return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    case "1mo": return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "3mo": return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case "6mo": return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case "1y": return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case "2y": return new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
    case "5y": return new Date(now.getTime() - 1825 * 24 * 60 * 60 * 1000);
    default: return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

export default router;

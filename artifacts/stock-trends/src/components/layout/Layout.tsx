import React from "react";
import { Navbar } from "./Navbar";
import { MarketIndices } from "./MarketIndices";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground dark">
      <MarketIndices />
      <Navbar />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

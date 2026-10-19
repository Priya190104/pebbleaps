"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/utils";

type Tx = { type: string; amount: number; date: Date | string };
type Period = "daily" | "weekly" | "monthly" | "yearly";

const PERIOD_LABELS: Record<Period, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

const PERIOD_TITLES: Record<Period, string> = {
  daily: "Hari Ini",
  weekly: "7 Hari Terakhir",
  monthly: "Bulan Ini",
  yearly: "Tahun Ini",
};

function filterByPeriod(txs: Tx[], period: Period, selectedMonth: number, selectedYear: number): Tx[] {
  const now = new Date();
  return txs.filter((tx) => {
    const d = new Date(tx.date);
    switch (period) {
      case "daily":
        return d.toDateString() === now.toDateString();
      case "weekly": {
        const cut = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return d >= cut;
      }
      case "monthly":
        return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
      case "yearly":
        return d.getFullYear() === now.getFullYear();
    }
  });
}

export function FinanceSummaryClient({
  transactions,
  month,
  year,
}: {
  transactions: Tx[];
  month: number;
  year: number;
}) {
  const [period, setPeriod] = useState<Period>("monthly");

  const filtered = useMemo(() => filterByPeriod(transactions, period, month, year), [transactions, period, month, year]);
  const balance = filtered.reduce((s, t) => s + (t.type === "masuk" ? t.amount : -t.amount), 0);
  const totalIn = filtered.filter((t) => t.type === "masuk").reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter((t) => t.type === "keluar").reduce((s, t) => s + t.amount, 0);
  const now = new Date();
  const selectedMonthTitle = month === now.getMonth() + 1 && year === now.getFullYear()
    ? PERIOD_TITLES.monthly
    : new Date(year, month - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

  return (
    <div className="room-card mb-4 p-5 bg-linear-to-br from-peach-50 to-cream-50">
      {/* Period selector */}
      <div className="flex gap-1 mb-4 bg-cream-100 p-1 rounded-xl">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={cn(
              "flex-1 py-1.5 rounded-lg text-xs font-bold transition-all",
              period === p ? "bg-cream-500 text-white shadow-sm" : "text-room-muted hover:text-room-text",
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Balance */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-2xl bg-peach-100 flex items-center justify-center shrink-0">
          <Wallet size={18} className="text-peach-500" />
        </div>
        <div>
          <p className="text-room-muted text-xs font-bold uppercase tracking-wide">
            {period === "monthly" ? selectedMonthTitle : PERIOD_TITLES[period]}
          </p>
          <p className={cn("text-2xl font-extrabold leading-tight", balance < 0 && "text-peach-500")}>
            {formatRupiah(balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-mint-50 rounded-xl p-3 border border-mint-200">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp size={13} className="text-mint-500" />
            <span className="text-[11px] font-bold text-mint-600 uppercase tracking-wide">Masuk</span>
          </div>
          <p className="text-room-text text-base font-extrabold">{formatRupiah(totalIn)}</p>
        </div>
        <div className="bg-peach-50 rounded-xl p-3 border border-peach-200">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown size={13} className="text-peach-500" />
            <span className="text-[11px] font-bold text-peach-600 uppercase tracking-wide">Keluar</span>
          </div>
          <p className="text-room-text text-base font-extrabold">{formatRupiah(totalOut)}</p>
        </div>
      </div>
    </div>
  );
}

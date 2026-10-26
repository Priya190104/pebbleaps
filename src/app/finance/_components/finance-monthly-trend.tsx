"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatRupiah } from "@/lib/utils";
import type { FinancePeriod } from "./finance-period";

type Transaction = { type: string; amount: number; date: Date | string };
type Bucket = { key: string; label: string; income: number; expense: number };

function shiftDateKey(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function monthLabel(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", { month: "short", year: "numeric" });
}

function dayLabel(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function FinanceMonthlyTrend({
  transactions,
  period: selectedPeriod,
  fromKey,
  throughKey,
}: {
  transactions: Transaction[];
  period?: FinancePeriod;
  fromKey?: string;
  throughKey?: string;
}) {
  const period = selectedPeriod ?? "daily";
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const defaultThrough = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const effectiveFromKey = fromKey ?? `${defaultFrom.getFullYear()}-${String(defaultFrom.getMonth() + 1).padStart(2, "0")}-${String(defaultFrom.getDate()).padStart(2, "0")}`;
  const effectiveThroughKey = throughKey ?? `${defaultThrough.getFullYear()}-${String(defaultThrough.getMonth() + 1).padStart(2, "0")}-${String(defaultThrough.getDate()).padStart(2, "0")}`;

  const data = useMemo(() => {
    const start = new Date(`${effectiveFromKey}T00:00:00.000Z`);
    const end = new Date(`${effectiveThroughKey}T00:00:00.000Z`);
    const dayCount = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
    const monthly = period === "yearly" || (period === "daily" && dayCount > 90);
    const buckets: Bucket[] = [];

    if (monthly) {
      const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
      const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
      while (cursor <= last) {
        const key = cursor.toISOString().slice(0, 7);
        buckets.push({ key, label: monthLabel(key), income: 0, expense: 0 });
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
    } else {
      for (let offset = 0; offset < dayCount; offset++) {
        const key = shiftDateKey(effectiveFromKey, offset);
        buckets.push({ key, label: dayLabel(key), income: 0, expense: 0 });
      }
    }

    const byKey = new Map(buckets.map((bucket) => [bucket.key, bucket]));
    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      if (Number.isNaN(date.getTime())) continue;
      const key = monthly
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      const bucket = byKey.get(key);
      if (!bucket) continue;
      if (transaction.type === "masuk") bucket.income += transaction.amount;
      if (transaction.type === "keluar") bucket.expense += transaction.amount;
    }
    return buckets;
  }, [transactions, period, effectiveFromKey, effectiveThroughKey]);

  const hasTransactions = data.some((bucket) => bucket.income > 0 || bucket.expense > 0);
  const granularity = period === "yearly" || (period === "daily" && data.length > 90) ? "Bulanan" : "Harian";
  const chartLabel = `Tren pemasukan dan pengeluaran ${granularity.toLocaleLowerCase("id-ID")} dari ${dayLabel(effectiveFromKey)} sampai ${dayLabel(effectiveThroughKey)}`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-room-muted">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-mint-400" />Pemasukan</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-peach-400" />Pengeluaran</span>
        <span className="text-room-muted">Tampilan {granularity.toLowerCase()}</span>
      </div>
      {hasTransactions ? (
        <div className="h-56 w-full" role="img" aria-label={chartLabel}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#E8DCC8" vertical={false} />
              <XAxis
                dataKey="label"
                interval="preserveStartEnd"
                minTickGap={20}
                tick={{ fill: "#7A5838", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={48}
                tick={{ fill: "#7A5838", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) =>
                  value >= 1_000_000
                    ? `${(value / 1_000_000).toFixed(0)}jt`
                    : `${Math.round(value / 1000)}rb`
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  formatRupiah(Number(value)),
                  name === "income" || name === "Pemasukan" ? "Pemasukan" : "Pengeluaran",
                ]}
                labelStyle={{ color: "#49331E", fontWeight: 700 }}
              />
              <Bar dataKey="income" name="Pemasukan" fill="#5CC090" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#EDA882" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-36 items-center justify-center rounded-xl bg-cream-50 text-center">
          <p className="max-w-56 text-xs font-semibold text-room-muted">
            Belum ada transaksi pada rentang yang dipilih.
          </p>
        </div>
      )}
    </div>
  );
}

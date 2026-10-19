"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatRupiah } from "@/lib/utils";

type Transaction = { type: string; amount: number; date: Date | string };

export function FinanceMonthlyTrend({ transactions }: { transactions: Transaction[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleDateString("id-ID", { month: "short" }),
        income: 0,
        expense: 0,
      };
    });
    const byMonth = new Map(months.map((month) => [month.key, month]));

    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      const bucket = byMonth.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (!bucket) continue;
      if (transaction.type === "masuk") bucket.income += transaction.amount;
      if (transaction.type === "keluar") bucket.expense += transaction.amount;
    }
    return months;
  }, [transactions]);

  const hasTransactions = data.some((month) => month.income > 0 || month.expense > 0);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-room-muted">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-mint-400" />Pemasukan</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-peach-400" />Pengeluaran</span>
      </div>
      {hasTransactions ? (
        <div className="h-52 w-full" role="img" aria-label="Grafik pemasukan dan pengeluaran enam bulan terakhir">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#E8DCC8" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#7A5838", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                width={48}
                tick={{ fill: "#7A5838", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value: number) => value >= 1_000_000 ? `${(value / 1_000_000).toFixed(0)}jt` : `${Math.round(value / 1000)}rb`}
              />
              <Tooltip
                formatter={(value, name) => [formatRupiah(Number(value)), name === "income" ? "Pemasukan" : "Pengeluaran"]}
                labelStyle={{ color: "#49331E", fontWeight: 700 }}
              />
              <Bar dataKey="income" name="Pemasukan" fill="#5CC090" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Pengeluaran" fill="#EDA882" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-36 items-center justify-center rounded-xl bg-cream-50 text-center">
          <p className="max-w-56 text-xs font-semibold text-room-muted">Grafik akan terisi setelah kamu mencatat transaksi.</p>
        </div>
      )}
    </div>
  );
}

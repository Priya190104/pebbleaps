"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatRupiah } from "@/lib/utils";

const PIE_COLORS = ["#9A6428", "#B4D4F0", "#F5C4A8", "#8ADAB5", "#EDA882", "#F5D9A8"];

interface PieEntry { name: string; value: number; icon: string }

export function FinancePieChart({ data }: { data: PieEntry[] }) {
  if (data.length === 0) return null;
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 h-32 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={52} paddingAngle={3} dataKey="value">
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatRupiah(Number(v))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="flex-1 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            <span className="text-xs font-semibold text-room-muted flex-1 truncate">{d.name}</span>
            <span className="text-xs font-bold text-room-text">{formatRupiah(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

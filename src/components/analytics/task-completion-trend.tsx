"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type CompletionEvent = { completedAt: Date | string };

export function TaskCompletionTrend({ events }: { events: CompletionEvent[] }) {
  const data = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return {
        key: dateKey(date),
        day: date.toLocaleDateString("id-ID", { weekday: "short" }),
        completed: 0,
      };
    });
    const byDate = new Map(days.map((day) => [day.key, day]));

    for (const event of events) {
      const day = byDate.get(dateKey(new Date(event.completedAt)));
      if (day) day.completed++;
    }
    return days;
  }, [events]);

  const hasCompletions = data.some((day) => day.completed > 0);
  return hasCompletions ? (
    <div className="h-40 w-full" role="img" aria-label="Grafik jumlah tugas yang selesai dalam tujuh hari terakhir">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <CartesianGrid stroke="#E8DCC8" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#7A5838", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} width={36} tick={{ fill: "#7A5838", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value) => [Number(value), "Tugas selesai"]}
            labelStyle={{ color: "#49331E", fontWeight: 700 }}
          />
          <Bar dataKey="completed" name="Tugas selesai" fill="#9A6428" radius={[5, 5, 0, 0]} maxBarSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  ) : (
    <div className="flex h-32 items-center justify-center rounded-xl bg-cream-50 px-4 text-center">
      <p className="max-w-56 text-xs font-semibold text-room-muted">Grafik akan terisi saat tugas mulai diselesaikan.</p>
    </div>
  );
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

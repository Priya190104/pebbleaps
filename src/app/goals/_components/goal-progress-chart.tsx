"use client";

import { useMemo, useState } from "react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { RoomCard, RoomCardHeader } from "@/components/ui/room-card";
import { PixelStar } from "@/components/ui/pixel-icons";
import { formatRupiah } from "@/lib/utils";

type Goal = {
  id: string;
  title: string;
  targetValue: number | null;
  currentValue: number | null;
  unit: string | null;
  progressLogs: { id: string; value: number; createdAt: Date | string }[];
};

export function GoalProgressChart({ goals }: { goals: Goal[] }) {
  const [selectedId, setSelectedId] = useState(goals[0]?.id ?? "");
  const selected = goals.find((goal) => goal.id === selectedId) ?? goals[0];

  const data = useMemo(() => {
    if (!selected?.targetValue) return [];
    return [...selected.progressLogs]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((log) => ({
        date: new Date(log.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        progress: Math.min(100, Math.round((log.value / selected.targetValue!) * 100)),
      }));
  }, [selected]);
  const targetLabel = selected.unit === "Rupiah"
    ? formatRupiah(selected.targetValue ?? 0)
    : `${selected.targetValue?.toLocaleString("id-ID")} ${selected.unit ?? ""}`.trim();

  return (
    <RoomCard className="mb-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <RoomCardHeader icon={<PixelStar size={18} />} title="Perjalanan progress" accent="mint" />
        {goals.length > 1 && (
          <label className="sr-only" htmlFor="goal-progress-select">Pilih goal untuk grafik progress</label>
        )}
        {goals.length > 1 && (
          <select
            id="goal-progress-select"
            value={selected.id}
            onChange={(event) => setSelectedId(event.target.value)}
            className="max-w-full rounded-xl border-2 border-mint-200 bg-mint-50 px-3 py-2 text-xs font-bold text-room-text"
          >
            {goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
          </select>
        )}
      </div>
      <p className="mb-2 text-xs font-semibold text-room-muted">
        {selected.title} · target {targetLabel}
      </p>
      {data.length > 1 ? (
        <div className="h-44 w-full" role="img" aria-label={`Grafik perkembangan goal ${selected.title}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="#E8DCC8" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: "#7A5838", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(value: number) => `${value}%`}
                tick={{ fill: "#7A5838", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [`${Number(value)}%`, "Progress"]}
                labelStyle={{ color: "#49331E", fontWeight: 700 }}
              />
              <Line type="monotone" dataKey="progress" name="Progress" stroke="#38A571" strokeWidth={3} dot={{ r: 3, fill: "#38A571" }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center rounded-xl bg-mint-50 px-4 text-center">
          <p className="max-w-60 text-xs font-semibold text-room-muted">
            Grafik akan muncul setelah progress goal ini diperbarui.
          </p>
        </div>
      )}
    </RoomCard>
  );
}

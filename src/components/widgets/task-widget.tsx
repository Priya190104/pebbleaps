"use client";

import { useState } from "react";
import Link from "next/link";
import { RoomCard, RoomCardHeader, CountBadge, PriorityBadge } from "@/components/ui/room-card";
import { PixelQueue } from "@/components/ui/pixel-icons";
import { ArrowRight, Clock, CheckCircle2, Circle } from "lucide-react";
import { daysUntil, cn } from "@/lib/utils";
import { updateTaskStatus } from "@/lib/actions/tasks";

type Task = {
  id: string; title: string; priority: string;
  status: string; deadline?: Date | string | null;
  subtasks: { id: string; title: string; done: boolean }[];
};

export function TaskWidget({ tasks }: { tasks: Task[] }) {
  const [optimistic, setOptimistic] = useState<Record<string, string>>({});

  const getStatus = (t: Task) => optimistic[t.id] ?? t.status;
  const active = tasks.filter((t) => getStatus(t) !== "done");
  const top3 = [...active]
    .sort((a, b) =>
      ({ tinggi: 0, sedang: 1, rendah: 2 }[a.priority] ?? 1) -
      ({ tinggi: 0, sedang: 1, rendah: 2 }[b.priority] ?? 1),
    )
    .slice(0, 3);
  const allDone = active.length === 0;

  const toggle = async (task: Task) => {
    const next = getStatus(task) === "done" ? "todo" : "done";
    setOptimistic((prev) => ({ ...prev, [task.id]: next }));
    await updateTaskStatus(task.id, next as "todo" | "progress" | "done");
  };

  return (
    <RoomCard className="widget-enter">
      <RoomCardHeader
        icon={<PixelQueue size={20} />}
        title="Tugas Hari Ini"
        accent="cream"
        badge={<CountBadge count={active.length} />}
        action={
          <Link href="/queue" className="text-cream-500 hover:text-cream-700 transition-colors">
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        }
      />

      {allDone ? (
        <div className="text-center py-4">
          <span className="text-2xl">🎉</span>
          <p className="text-room-muted text-sm font-semibold mt-1">Semua tugas selesai!</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {top3.map(task => {
            const done = getStatus(task) === "done";
            return (
              <li key={task.id} className="flex items-start gap-2.5 group">
                <button
                  onClick={() => toggle(task)}
                  className={cn(
                    "mt-0.5 shrink-0 transition-colors rounded-full",
                    done ? "text-mint-400 task-check-done" : "text-room-subtle hover:text-cream-400"
                  )}
                  aria-label={done ? "Tandai belum selesai" : "Tandai selesai"}
                >
                  {done
                    ? <CheckCircle2 size={18} strokeWidth={2.5} />
                    : <Circle size={18} strokeWidth={2} />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-semibold truncate leading-snug transition-all",
                    done ? "line-through text-room-subtle" : "text-room-text"
                  )}>
                    {task.title}
                  </p>
                  {!done && (
                    <div className="flex items-center gap-2 mt-0.5">
                      <PriorityBadge priority={task.priority as "tinggi" | "sedang" | "rendah"} />
                      {task.deadline && (
                        <span className="flex items-center gap-1 text-[11px] text-room-muted font-medium">
                          <Clock size={10} />
                          {daysUntil(task.deadline) === 0
                            ? "Hari ini"
                            : daysUntil(task.deadline) === 1
                            ? "Besok"
                            : `${daysUntil(task.deadline)} hari lagi`}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {active.length > 3 && (
        <Link href="/queue" className="block mt-3 text-center text-xs font-bold text-cream-500 hover:text-cream-700 transition-colors">
          +{active.length - 3} tugas lainnya →
        </Link>
      )}
    </RoomCard>
  );
}

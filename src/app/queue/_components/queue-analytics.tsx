import { RoomCard, RoomCardHeader } from "@/components/ui/room-card";
import { PixelQueue } from "@/components/ui/pixel-icons";
import { TaskCompletionTrend } from "@/components/analytics/task-completion-trend";

type Task = { status: string; deadline: Date | string | null };
type CompletionEvent = { completedAt: Date | string };

export function QueueAnalytics({ tasks, events }: { tasks: Task[]; events: CompletionEvent[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeTasks = tasks.filter((task) => task.status !== "done");
  const dueToday = activeTasks.filter((task) => task.deadline && isSameDay(new Date(task.deadline), today)).length;
  const overdue = activeTasks.filter((task) => task.deadline && new Date(task.deadline) < today).length;
  const completedThisWeek = events.filter((event) => {
    const completedAt = new Date(event.completedAt);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    return completedAt >= weekAgo;
  }).length;

  return (
    <RoomCard className="mb-4">
      <RoomCardHeader icon={<PixelQueue size={18} />} title="Ringkasan Queue" accent="cream" />
      <div className="mb-4 grid grid-cols-3 divide-x divide-room-border rounded-xl bg-cream-50 py-3 text-center">
        <Metric label="Terlambat" value={overdue} warning={overdue > 0} />
        <Metric label="Jatuh tempo hari ini" value={dueToday} />
        <Metric label="Selesai 7 hari" value={completedThisWeek} />
      </div>
      <p className="mb-2 text-xs font-bold text-room-muted">Penyelesaian tugas · 7 hari terakhir</p>
      <TaskCompletionTrend events={events} />
    </RoomCard>
  );
}

function Metric({ label, value, warning = false }: { label: string; value: number; warning?: boolean }) {
  return (
    <div className="px-2">
      <p className={`text-lg font-extrabold leading-tight ${warning ? "text-peach-500" : "text-room-text"}`}>{value}</p>
      <p className="mt-1 text-[10px] font-bold leading-tight text-room-muted">{label}</p>
    </div>
  );
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

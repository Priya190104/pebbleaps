import Link from "next/link";
import { RoomCard, RoomCardHeader, ProgressBar, CountBadge } from "@/components/ui/room-card";
import { PixelStar } from "@/components/ui/pixel-icons";
import { daysUntil, getHabitStreak, getStoredDateKey } from "@/lib/utils";
import { ArrowRight, Flame, CheckCircle2 } from "lucide-react";

type Milestone = { id: string; title: string; done: boolean; deadline?: Date | string | null };
type HabitLog = { id: string; goalId: string; date: Date | string; done: boolean };
type Goal = {
  id: string; type: string; title: string;
  targetValue?: number | null; currentValue?: number | null; unit?: string | null;
  deadline?: Date | string | null; milestones: Milestone[]; habitLogs: HabitLog[];
};

export function GoalWidget({ goals }: { goals: Goal[] }) {
  const active = goals;
  const urgent = [...active]
    .filter((g) => g.deadline)
    .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())[0] ?? active[0];

  const numericProgress =
    urgent?.type === "angka" && urgent.targetValue && urgent.currentValue != null
      ? Math.round((urgent.currentValue / urgent.targetValue) * 100)
      : null;

  const milestoneProgress =
    urgent?.type === "milestone" && urgent.milestones.length > 0
      ? Math.round((urgent.milestones.filter((m) => m.done).length / urgent.milestones.length) * 100)
      : null;

  const progress = numericProgress ?? milestoneProgress ?? 0;

  const habitGoal = active.find((g) => g.type === "habit");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const completedHabitDates = habitGoal?.habitLogs.filter((log) => log.done).map((log) => log.date) ?? [];
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const habitToday = completedHabitDates.some((date) => getStoredDateKey(date) === todayKey);
  const habitStreak = getHabitStreak(completedHabitDates);

  return (
    <RoomCard className="widget-enter-3">
      <RoomCardHeader
        icon={<PixelStar size={20} />}
        title="Goal Aktif"
        accent="mint"
        badge={<CountBadge count={active.length} variant="mint" />}
        action={
          <Link href="/goals" className="text-mint-400 hover:text-mint-500 transition-colors">
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        }
      />

      {urgent && (
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <p className="text-room-text text-sm font-bold leading-snug pr-2">{urgent.title}</p>
            {urgent.deadline && (
              <span className="text-[11px] font-bold text-mint-500 shrink-0 bg-mint-50 px-2 py-0.5 rounded-full border border-mint-200">
                {daysUntil(urgent.deadline) <= 0
                  ? "Hari ini"
                  : `${daysUntil(urgent.deadline)}h`}
              </span>
            )}
          </div>

          {(numericProgress !== null || milestoneProgress !== null) && (
            <>
              <ProgressBar value={progress} color="mint" />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-room-muted font-medium">
                  {urgent.type === "angka"
                    ? `${urgent.currentValue?.toLocaleString("id-ID")} / ${urgent.targetValue?.toLocaleString("id-ID")} ${urgent.unit ?? ""}`
                    : `${urgent.milestones.filter(m => m.done).length} / ${urgent.milestones.length} milestone`}
                </span>
                <span className="text-[11px] font-extrabold text-mint-500">{progress}%</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Habit streak */}
      {habitGoal && (
        <div className="flex items-center gap-3 pt-3 border-t border-room-border">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${habitToday ? "bg-mint-100" : "bg-canvas"}`}>
            {habitToday
              ? <CheckCircle2 size={18} className="text-mint-500" />
              : <Flame size={18} className="text-peach-400" />}
          </div>
          <div>
            <p className="text-room-text text-xs font-bold truncate">{habitGoal.title}</p>
            <p className="text-room-muted text-[11px] font-semibold flex items-center gap-1">
              <Flame size={10} className="text-peach-400" />
              {habitStreak} hari berturut-turut
            </p>
          </div>
        </div>
      )}
    </RoomCard>
  );
}

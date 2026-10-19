import { RoomShell } from "@/components/layout/room-shell";
import { RoomCard, RoomCardHeader, ProgressBar, CountBadge } from "@/components/ui/room-card";
import { PixelStar } from "@/components/ui/pixel-icons";
import { getGoals } from "@/lib/actions/goals";
import { formatRupiah, daysUntil, getHabitStreak, getStoredDateKey } from "@/lib/utils";
import { Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { HabitButton } from "./_components/habit-button";
import { MilestoneItem } from "./_components/milestone-item";
import { PageFab } from "@/app/_components/page-fab";
import { AddMilestone, GoalNotes, NumericGoalProgress } from "./_components/goal-controls";
import { GoalProgressChart } from "./_components/goal-progress-chart";
import { GoalDeleteButton } from "./_components/goal-delete-button";

type GoalItem = Awaited<ReturnType<typeof getGoals>>[number];
type HabitLog = GoalItem["habitLogs"][number];
type Milestone = GoalItem["milestones"][number];

export default async function GoalsPage() {
  const goals: GoalItem[] = await getGoals();
  const numeric = goals.filter((g: GoalItem) => g.type === "angka");
  const habits = goals.filter((g: GoalItem) => g.type === "habit");
  const milestones = goals.filter((g: GoalItem) => g.type === "milestone");
  const free = goals.filter((g: GoalItem) => g.type === "bebas");
  const measurable = [...numeric, ...milestones];
  const averageProgress = measurable.length
    ? Math.round(measurable.reduce((sum, goal) => {
        if (goal.type === "angka") {
          return sum + Math.min(100, Math.round(((goal.currentValue ?? 0) / (goal.targetValue ?? 1)) * 100));
        }
        const done = goal.milestones.filter((milestone) => milestone.done).length;
        return sum + (goal.milestones.length ? Math.round((done / goal.milestones.length) * 100) : 0);
      }, 0) / measurable.length)
    : 0;

  return (
    <RoomShell>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-room-text text-xl font-extrabold">Goal Aktif</h1>
          <p className="text-room-muted text-sm font-semibold">{goals.length} goal berjalan</p>
        </div>
        <PageFab defaultTab="goal" />
      </div>

      {goals.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 rounded-2xl border-2 border-mint-200 bg-mint-50 px-4 py-3 text-xs font-bold text-room-muted">
          <span><strong className="text-room-text">{numeric.length}</strong> target angka</span>
          <span><strong className="text-room-text">{habits.length}</strong> habit</span>
          <span><strong className="text-room-text">{milestones.length}</strong> milestone</span>
          {measurable.length > 0 && <span><strong className="text-mint-600">{averageProgress}%</strong> rata-rata progress</span>}
        </div>
      )}

      {numeric.length > 0 && <GoalProgressChart goals={numeric} />}

      <div className="space-y-4">
        {goals.length === 0 && (
          <div className="room-card p-10 text-center">
            <p className="text-4xl mb-3">⭐</p>
            <p className="text-room-text font-extrabold text-base">Belum ada goal</p>
            <p className="text-room-muted text-sm font-semibold mt-1">
              Tekan tombol + di atas untuk buat goal pertamamu
            </p>
          </div>
        )}
        {/* Numeric goals */}
        {numeric.map((g: GoalItem) => {
          const pct = g.targetValue && g.currentValue !== null
            ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))
            : 0;
          return (
            <RoomCard key={g.id}>
              <RoomCardHeader
                icon={<Target size={16} className="text-mint-500" />}
                title={g.title}
                accent="mint"
                action={<GoalDeleteButton goalId={g.id} title={g.title} />}
                badge={g.deadline ? (
                  <span className="text-[11px] font-bold text-mint-500 bg-mint-50 px-2 py-0.5 rounded-full border border-mint-200">
                    {daysUntil(g.deadline)}h lagi
                  </span>
                ) : undefined}
              />
              {g.description && (
                <p className="text-room-muted text-xs font-medium mb-3">{g.description}</p>
              )}
              <ProgressBar value={pct} color="mint" />
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-room-muted font-semibold">
                  Target: {g.unit === "Rupiah"
                    ? formatRupiah(g.targetValue ?? 0)
                    : `${g.targetValue} ${g.unit ?? ""}`}
                </span>
                <span className="text-xs font-extrabold text-mint-500">{pct}%</span>
              </div>
              <NumericGoalProgress id={g.id} currentValue={g.currentValue} targetValue={g.targetValue} unit={g.unit} />
              <GoalNotes goalId={g.id} initialNotes={g.notes} />
            </RoomCard>
          );
        })}

        {/* Habit goals */}
        {habits.length > 0 && (
          <RoomCard>
            <RoomCardHeader
              icon={<Flame size={16} className="text-peach-400" />}
              title="Habit Harian"
              accent="peach"
              badge={<CountBadge count={habits.length} variant="peach" />}
            />
            <ul className="space-y-3">
              {habits.map((g: GoalItem) => {
                const loggedDays = new Set(
                  g.habitLogs
                    .filter((log: HabitLog) => log.done)
                    .map((log: HabitLog) => getStoredDateKey(log.date)),
                );
                const todayKey = localDateKey(new Date());
                const habitToday = loggedDays.has(todayKey);
                const streak = getHabitStreak([...loggedDays]);
                return (
                  <li key={g.id}>
                    <div className="flex items-center gap-3">
                      <HabitButton goalId={g.id} habitToday={habitToday} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-room-text">{g.title}</p>
                        <div className="mt-0.5 flex items-center gap-1">
                          <Flame size={11} className="text-peach-400" />
                          <span className="text-[11px] font-bold text-peach-500">{streak} hari berturut-turut</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1" aria-label="Aktivitas habit 7 hari terakhir">
                        {Array.from({ length: 7 }, (_, index) => {
                          const date = new Date();
                          date.setDate(date.getDate() - (6 - index));
                          const complete = loggedDays.has(localDateKey(date));
                          return (
                            <span
                              key={index}
                              aria-label={complete ? "Selesai" : "Belum selesai"}
                              className={cn("h-5 w-2 rounded-sm", complete ? "bg-peach-300" : "bg-cream-100")}
                            />
                          );
                        })}
                      </div>
                      <GoalDeleteButton goalId={g.id} title={g.title} />
                    </div>
                    <div className="ml-12">
                      <GoalNotes goalId={g.id} initialNotes={g.notes} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </RoomCard>
        )}

        {/* Milestone goals */}
        {milestones.map((g: GoalItem) => {
          const done = g.milestones.filter((m: Milestone) => m.done).length;
          const total = g.milestones.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          return (
            <RoomCard key={g.id}>
              <RoomCardHeader
                icon={<PixelStar size={18} />}
                title={g.title}
                accent="cream"
                action={<GoalDeleteButton goalId={g.id} title={g.title} />}
                badge={
                  <span className="text-[11px] font-bold text-cream-600 bg-cream-100 px-2 py-0.5 rounded-full border border-cream-200">
                    {done}/{total}
                  </span>
                }
              />
              {g.deadline && (
                <p className="text-room-muted text-xs font-semibold mb-2">
                  🗓 {daysUntil(g.deadline)} hari menuju deadline
                </p>
              )}
              <ProgressBar value={pct} color="cream" />
              <ul className="mt-3 space-y-2">
                {g.milestones.map((m: Milestone) => (
                <MilestoneItem key={m.id} id={m.id} title={m.title} done={m.done} deadline={m.deadline} />
                ))}
              </ul>
              <AddMilestone goalId={g.id} milestones={g.milestones} />
              <GoalNotes goalId={g.id} initialNotes={g.notes} />
            </RoomCard>
          );
        })}

        {/* Free-form goals */}
        {free.map((g: GoalItem) => (
          <RoomCard key={g.id}>
            <RoomCardHeader
              icon={<PixelStar size={18} />}
              title={g.title}
              accent="sky"
              action={<GoalDeleteButton goalId={g.id} title={g.title} />}
            />
            {g.description && (
              <p className="text-room-muted text-sm font-medium mb-2">{g.description}</p>
            )}
            <GoalNotes goalId={g.id} initialNotes={g.notes} />
          </RoomCard>
        ))}
      </div>
    </RoomShell>
  );
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

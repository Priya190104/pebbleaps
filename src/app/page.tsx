import { RoomShell } from "@/components/layout/room-shell";
import { RoomHeader } from "@/components/layout/room-header";
import { TaskWidget } from "@/components/widgets/task-widget";
import { FinanceWidget } from "@/components/widgets/finance-widget";
import { GoalWidget } from "@/components/widgets/goal-widget";
import { WelcomeOverlay } from "@/components/onboarding/welcome-overlay";
import { HomeActions } from "./_components/home-actions";
import { DashboardAnalytics } from "./_components/dashboard-analytics";
import { RoomCard } from "@/components/ui/room-card";
import { formatRupiah, daysUntil } from "@/lib/utils";
import { getTaskCompletionEvents, getTasks } from "@/lib/actions/tasks";
import { getFinanceData } from "@/lib/actions/finance";
import { getGoals } from "@/lib/actions/goals";

export default async function HomePage() {
  const [tasks, { transactions, categories, budgets }, goals, completionEvents] = await Promise.all([
    getTasks(),
    getFinanceData(),
    getGoals(),
    getTaskCompletionEvents(),
  ]);

  const activeTasks = tasks.filter((t) => t.status !== "done").length;
  const overdueTasks = tasks.filter((task) => task.status !== "done" && task.deadline && daysUntil(task.deadline) < 0).length;
  const now = new Date();
  const monthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthExpenses = monthTransactions
    .filter((transaction) => transaction.type === "keluar")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const measurableGoals = goals.filter((goal) => goal.type === "angka" || goal.type === "milestone");
  const averageGoalProgress = measurableGoals.length
    ? Math.round(measurableGoals.reduce((sum, goal) => {
        if (goal.type === "angka") {
          return sum + Math.min(100, Math.round(((goal.currentValue ?? 0) / (goal.targetValue ?? 1)) * 100));
        }
        const done = goal.milestones.filter((milestone) => milestone.done).length;
        return sum + (goal.milestones.length ? Math.round((done / goal.milestones.length) * 100) : 0);
      }, 0) / measurableGoals.length)
    : null;

  return (
    <RoomShell>
      <WelcomeOverlay />
      <RoomHeader />

      <DashboardSummary
        activeTasks={activeTasks}
        overdueTasks={overdueTasks}
        monthExpenses={monthExpenses}
        averageGoalProgress={averageGoalProgress}
        measurableGoalCount={measurableGoals.length}
        activeGoalCount={goals.length}
      />

      <DashboardAnalytics transactions={transactions} completionEvents={completionEvents} />

      <div className="mb-4 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <TaskWidget tasks={tasks} />
        <FinanceWidget transactions={transactions} categories={categories} budgets={budgets} />
        <GoalWidget goals={goals} />
      </div>

      <HomeActions />
    </RoomShell>
  );
}

function DashboardSummary({ activeTasks, overdueTasks, monthExpenses, averageGoalProgress, measurableGoalCount, activeGoalCount }: {
  activeTasks: number;
  overdueTasks: number;
  monthExpenses: number;
  averageGoalProgress: number | null;
  measurableGoalCount: number;
  activeGoalCount: number;
}) {
  return (
    <RoomCard className="mb-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-extrabold text-room-text">Ringkasan hari ini</h2>
        <p className="text-[11px] font-bold text-room-muted">
          {new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-y-4 lg:grid-cols-4 lg:divide-x lg:divide-room-border">
        <SummaryMetric label="Tugas aktif" value={String(activeTasks)} detail="belum selesai" />
        <SummaryMetric label="Terlambat" value={String(overdueTasks)} detail="perlu ditinjau" warning={overdueTasks > 0} />
        <SummaryMetric label="Pengeluaran bulan ini" value={formatRupiah(monthExpenses)} detail="total transaksi keluar" />
        <SummaryMetric
          label="Progress goal"
          value={averageGoalProgress === null ? "—" : `${averageGoalProgress}%`}
          detail={`${activeGoalCount} goal aktif · ${measurableGoalCount} terukur`}
        />
      </div>
    </RoomCard>
  );
}

function SummaryMetric({ label, value, detail, warning = false }: {
  label: string; value: string; detail: string; warning?: boolean;
}) {
  return (
    <div className="min-w-0 px-3 first:pl-0 lg:px-4 lg:first:pl-0">
      <p className="truncate text-[10px] font-bold uppercase tracking-wide text-room-muted">{label}</p>
      <p className={`mt-0.5 truncate text-lg font-extrabold leading-tight ${warning ? "text-peach-500" : "text-room-text"}`}>{value}</p>
      <p className="mt-0.5 truncate text-[10px] font-semibold text-room-muted">{detail}</p>
    </div>
  );
}

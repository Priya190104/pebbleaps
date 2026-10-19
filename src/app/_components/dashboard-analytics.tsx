import Link from "next/link";
import { RoomCard, RoomCardHeader } from "@/components/ui/room-card";
import { PixelCoin, PixelQueue } from "@/components/ui/pixel-icons";
import { TaskCompletionTrend } from "@/components/analytics/task-completion-trend";
import { FinanceMonthlyTrend } from "@/app/finance/_components/finance-monthly-trend";

type Transaction = { type: string; amount: number; date: Date | string };
type CompletionEvent = { completedAt: Date | string };

export function DashboardAnalytics({ transactions, completionEvents }: {
  transactions: Transaction[];
  completionEvents: CompletionEvent[];
}) {
  return (
    <section aria-label="Analitik aktivitas" className="mb-4 grid gap-4 xl:grid-cols-2">
      <RoomCard>
        <RoomCardHeader
          icon={<PixelCoin size={18} />}
          title="Arus kas · 6 bulan"
          accent="peach"
          action={<Link href="/finance" className="text-xs font-extrabold text-peach-500 hover:text-peach-600">Detail</Link>}
        />
        <FinanceMonthlyTrend transactions={transactions} />
      </RoomCard>
      <RoomCard>
        <RoomCardHeader
          icon={<PixelQueue size={18} />}
          title="Tugas selesai · 7 hari"
          accent="cream"
          action={<Link href="/queue" className="text-xs font-extrabold text-cream-600 hover:text-cream-700">Detail</Link>}
        />
        <TaskCompletionTrend events={completionEvents} />
      </RoomCard>
    </section>
  );
}

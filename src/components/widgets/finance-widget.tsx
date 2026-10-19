import Link from "next/link";
import { RoomCard, RoomCardHeader, ProgressBar } from "@/components/ui/room-card";
import { PixelCoin } from "@/components/ui/pixel-icons";
import { formatRupiah } from "@/lib/utils";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

type Category = { id: string; name: string; icon: string };
type Transaction = { id: string; type: string; amount: number; note: string; categoryId: string; date: Date | string };
type Budget = { categoryId: string; amount: number; month: number; year: number };

interface Props {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

export function FinanceWidget({ transactions, categories, budgets }: Props) {
  const now = new Date();
  const monthTransactions = transactions.filter((transaction) => {
    const date = new Date(transaction.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const balance = monthTransactions.reduce((sum, t) => sum + (t.type === "masuk" ? t.amount : -t.amount), 0);
  const lastTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const lastCat = categories.find((c) => c.id === lastTx?.categoryId);

  const budgetHealth = budgets
    .filter((b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear())
    .map((b) => {
      const spent = monthTransactions.filter((t) => t.categoryId === b.categoryId && t.type === "keluar").reduce((s, t) => s + t.amount, 0);
      const cat = categories.find((c) => c.id === b.categoryId);
      return { ...b, spent, cat, pct: Math.round((spent / b.amount) * 100) };
    })
    .sort((a, b) => b.pct - a.pct)[0];

  const isOverBudget = budgetHealth && budgetHealth.pct >= 100;

  return (
    <RoomCard className="widget-enter-2">
      <RoomCardHeader
        icon={<PixelCoin size={20} />}
        title="Keuangan"
        accent="peach"
        action={
          <Link href="/finance" className="text-peach-400 hover:text-peach-500 transition-colors">
            <ArrowRight size={16} strokeWidth={2.5} />
          </Link>
        }
      />

      {/* Balance */}
      <div className="bg-linear-to-br from-peach-50 to-peach-100 rounded-xl p-3 mb-3 border border-peach-200">
        <p className="text-room-muted text-[11px] font-bold uppercase tracking-wide mb-0.5">Arus kas bulan ini</p>
        <p className="text-room-text text-xl font-extrabold leading-tight">{formatRupiah(balance)}</p>
      </div>

      {/* Last transaction */}
      {lastTx && (
        <div className="flex items-center gap-2 mb-3 py-2 border-b border-room-border">
          <span className="text-base">{lastCat?.icon ?? "💸"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-room-text text-xs font-semibold truncate">{lastTx.note}</p>
            <p className="text-room-muted text-[11px] font-medium">{lastCat?.name}</p>
          </div>
          <span className={`text-sm font-extrabold ${lastTx.type === "masuk" ? "text-mint-500" : "text-peach-500"}`}>
            {lastTx.type === "masuk" ? <TrendingUp size={13} className="inline mr-0.5" /> : <TrendingDown size={13} className="inline mr-0.5" />}
            {formatRupiah(lastTx.amount)}
          </span>
        </div>
      )}

      {/* Budget health */}
      {budgetHealth && (
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-semibold text-room-muted">
              {budgetHealth.cat?.icon} {budgetHealth.cat?.name}
              {isOverBudget && <span className="ml-1 text-peach-500 font-bold">⚠ Over</span>}
            </span>
            <span className={`text-xs font-bold ${isOverBudget ? "text-peach-500" : "text-room-muted"}`}>
              {budgetHealth.pct}%
            </span>
          </div>
          <ProgressBar value={budgetHealth.pct} color={isOverBudget ? "peach" : "cream"} />
          <p className="text-[11px] text-room-muted font-medium mt-1">
            {formatRupiah(budgetHealth.spent)} / {formatRupiah(budgetHealth.amount)}
          </p>
        </div>
      )}
    </RoomCard>
  );
}

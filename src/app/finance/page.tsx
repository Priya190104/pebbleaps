import { RoomShell } from "@/components/layout/room-shell";
import { RoomCard, RoomCardHeader } from "@/components/ui/room-card";
import { PixelCoin } from "@/components/ui/pixel-icons";
import { getFinanceData } from "@/lib/actions/finance";
import { FinancePieChart } from "./_components/finance-pie-chart";
import { TransactionList } from "./_components/transaction-list";
import { PageFab } from "@/app/_components/page-fab";
import { FinanceSummaryClient } from "./_components/finance-summary-client";
import { WalletsCard } from "./_components/wallets-card";
import { CategoryManagerModal } from "./_components/category-manager-modal";
import { BudgetManagerCard } from "./_components/budget-manager-card";
import { FinanceMonthlyTrend } from "./_components/finance-monthly-trend";
import { FinanceSubnav, type FinanceTab } from "./_components/finance-subnav";

type FinanceData = Awaited<ReturnType<typeof getFinanceData>>;
type Tx = FinanceData["transactions"][number];
type Cat = FinanceData["categories"][number];
type SearchParams = Promise<{ month?: string; year?: string; tab?: string }>;

function selectedPeriod(params: { month?: string; year?: string }) {
  const now = new Date();
  const month = params.month && /^\d{1,2}$/.test(params.month) ? Number(params.month) : NaN;
  const year = params.year && /^\d{4}$/.test(params.year) ? Number(params.year) : NaN;

  if (Number.isInteger(month) && month >= 1 && month <= 12 &&
      Number.isInteger(year) && year >= 2000 && year <= 9999) {
    return { month, year };
  }
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export default async function FinancePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const period = selectedPeriod(params);
  const tab: FinanceTab = params.tab === "transactions" || params.tab === "budget" || params.tab === "wallets"
    ? params.tab
    : "summary";
  const { transactions, categories, budgets, wallets }: FinanceData = await getFinanceData();

  const activeCategories = categories.filter((c: Cat) => c.isActive);
  const expenseCats = categories.filter((c: Cat) => !c.forIncome);
  const pieData = expenseCats
    .map((c: Cat) => {
      const value = transactions
        .filter((t: Tx) => {
          const date = new Date(t.date);
          return t.categoryId === c.id && t.type === "keluar" &&
            date.getMonth() + 1 === period.month && date.getFullYear() === period.year;
        })
        .reduce((s: number, t: Tx) => s + t.amount, 0);
      return { name: c.name, value, icon: c.icon };
    })
    .filter((d: { name: string; value: number; icon: string }) => d.value > 0);

  const sorted = [...transactions].sort(
    (a: Tx, b: Tx) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <RoomShell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-room-text text-xl font-extrabold">Keuangan</h1>
          <p className="text-room-muted text-sm font-semibold">
            {tab === "summary" && "Pantau keuanganmu"}
            {tab === "transactions" && "Catat dan telusuri transaksi"}
            {tab === "budget" && "Atur batas pengeluaran"}
            {tab === "wallets" && "Kelola saldo dan rekonsiliasi"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {tab === "transactions" && <CategoryManagerModal categories={activeCategories} />}
          <PageFab defaultTab="keuangan" onlyTab="keuangan" />
        </div>
      </div>

      <FinanceSubnav activeTab={tab} month={period.month} year={period.year} />

      {tab === "summary" && (
        <>
          <FinanceSummaryClient transactions={transactions} month={period.month} year={period.year} />
          <RoomCard className="mb-4 min-w-0">
            <RoomCardHeader icon={<PixelCoin size={18} />} title="Tren Keuangan 6 Bulan" accent="mint" />
            <FinanceMonthlyTrend transactions={transactions} />
          </RoomCard>
          <RoomCard className="mb-4 min-w-0">
            <RoomCardHeader
              icon={<PixelCoin size={18} />}
              title={`Pengeluaran per Kategori · ${new Date(period.year, period.month - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`}
              accent="peach"
            />
            {pieData.length > 0 ? (
              <FinancePieChart data={pieData} />
            ) : (
              <p className="py-2 text-center text-sm font-semibold text-room-muted">
                Belum ada pengeluaran tercatat pada periode ini.
              </p>
            )}
          </RoomCard>
        </>
      )}

      {tab === "wallets" && (
        <WalletsCard
          key={wallets.map((wallet) =>
            [wallet.id, wallet.name, wallet.type, wallet.icon, wallet.color, wallet.balance, wallet.hasReconciliation].join(":"),
          ).join("|")}
          wallets={wallets}
          transactions={transactions.map(({ id, walletId, type, amount, note, date, reconciliationId }) => ({
            id, walletId, type, amount, note, date, reconciliationId,
          }))}
        />
      )}

      {tab === "budget" && (
        <BudgetManagerCard
          key={`${period.month}-${period.year}`}
          categories={categories}
          budgets={budgets}
          transactions={transactions}
          month={period.month}
          year={period.year}
        />
      )}

      {tab === "transactions" && (
        <RoomCard className="min-w-0">
          <RoomCardHeader icon={<PixelCoin size={18} />} title="Transaksi" accent="peach" />
          <TransactionList
            key={`${period.month}-${period.year}`}
            transactions={sorted}
            categories={categories}
            wallets={wallets.map(({ id, name }) => ({ id, name }))}
            month={period.month}
            year={period.year}
          />
        </RoomCard>
      )}
    </RoomShell>
  );
}

import { RoomShell } from "@/components/layout/room-shell";
import { RoomCard, RoomCardHeader } from "@/components/ui/room-card";
import { PixelCoin } from "@/components/ui/pixel-icons";
import { getFinanceData } from "@/lib/actions/finance";
import { FinancePieChart } from "./_components/finance-pie-chart";
import { TransactionList } from "./_components/transaction-list";
import { PageFab } from "@/app/_components/page-fab";
import { FinanceSummaryClient } from "./_components/finance-summary-client";
import { WalletsCard } from "./_components/wallets-card";
import { CategoryManager } from "./_components/category-manager-modal";
import { BudgetManagerCard } from "./_components/budget-manager-card";
import { FinanceMonthlyTrend } from "./_components/finance-monthly-trend";
import { FinanceSubnav, type FinanceTab } from "./_components/finance-subnav";
import { financeFilterQuery, resolveFinanceFilter } from "./_components/finance-period";

type FinanceData = Awaited<ReturnType<typeof getFinanceData>>;
type Tx = FinanceData["transactions"][number];
type Cat = FinanceData["categories"][number];
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function periodLabel(period: ReturnType<typeof resolveFinanceFilter>) {
  const formatDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  if (period.period === "daily") {
    return period.fromKey === period.throughKey
      ? formatDate(period.fromKey)
      : `${formatDate(period.fromKey)} – ${formatDate(period.throughKey)}`;
  }
  if (period.period === "weekly") return `Minggu ${formatDate(period.fromKey)} – ${formatDate(period.throughKey)}`;
  if (period.period === "yearly") return `Tahun ${period.year}`;
  return new Date(period.year, period.month - 1, 1).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
}

export default async function FinancePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const filter = resolveFinanceFilter(params);
  const query = financeFilterQuery(params, filter);
  const tab: FinanceTab =
    params.tab === "transactions" ||
    params.tab === "budget" ||
    params.tab === "wallets" ||
    params.tab === "categories"
      ? params.tab
      : "summary";
  const { transactions, categories, budgets, wallets }: FinanceData = await getFinanceData();

  const filteredTransactions = transactions.filter((transaction: Tx) => {
    const time = new Date(transaction.date).getTime();
    return time >= filter.start.getTime() && time < filter.end.getTime();
  });
  const activeCategories = categories.filter((category: Cat) => category.isActive);
  const expensesByCategory = new Map<string, number>();
  for (const transaction of filteredTransactions) {
    if (transaction.type !== "keluar") continue;
    expensesByCategory.set(
      transaction.categoryId,
      (expensesByCategory.get(transaction.categoryId) ?? 0) + transaction.amount,
    );
  }
  const pieData = categories
    .filter((category: Cat) => !category.forIncome)
    .map((category: Cat) => ({
      name: category.name,
      value: expensesByCategory.get(category.id) ?? 0,
      icon: category.icon,
    }))
    .filter((entry) => entry.value > 0);
  const sorted = [...filteredTransactions].sort(
    (a: Tx, b: Tx) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const selectedLabel = periodLabel(filter);

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
            {tab === "categories" && "Atur kategori pemasukan dan pengeluaran"}
          </p>
        </div>
        <PageFab defaultTab="keuangan" onlyTab="keuangan" />
      </div>

      <FinanceSubnav activeTab={tab} query={query} />

      {tab === "summary" && (
        <>
          <FinanceSummaryClient
            key={`${filter.period}-${filter.month}-${filter.year}-${filter.fromKey}-${filter.throughKey}-${filter.week}-${filter.dateMode}`}
            transactions={filteredTransactions}
            period={filter.period}
            month={filter.month}
            year={filter.year}
            fromKey={filter.fromKey}
            throughKey={filter.throughKey}
            week={filter.week}
            dateMode={filter.dateMode}
          />
          <RoomCard className="mb-4 min-w-0">
            <RoomCardHeader icon={<PixelCoin size={18} />} title="Tren Keuangan" accent="mint" />
            <FinanceMonthlyTrend
              transactions={filteredTransactions}
              period={filter.period}
              fromKey={filter.fromKey}
              throughKey={filter.throughKey}
            />
          </RoomCard>
          <RoomCard className="mb-4 min-w-0">
            <RoomCardHeader
              icon={<PixelCoin size={18} />}
              title={`Pengeluaran per Kategori · ${selectedLabel}`}
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
          key={`${filter.budgetMonth}-${filter.budgetYear}`}
          categories={categories}
          budgets={budgets}
          transactions={transactions}
          month={filter.budgetMonth}
          year={filter.budgetYear}
        />
      )}

      {tab === "transactions" && (
        <RoomCard className="min-w-0">
          <RoomCardHeader icon={<PixelCoin size={18} />} title="Transaksi" accent="peach" />
          <TransactionList
            key={`${filter.period}-${filter.fromKey}-${filter.throughKey}`}
            transactions={sorted}
            categories={categories}
            wallets={wallets.map(({ id, name }) => ({ id, name }))}
          />
        </RoomCard>
      )}

      {tab === "categories" && <CategoryManager categories={activeCategories} />}
    </RoomShell>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import {
  copyPreviousMonthBudgets,
  deleteBudget,
  upsertBudget,
} from "@/lib/actions/finance";
import { RoomCard, RoomCardHeader, ProgressBar } from "@/components/ui/room-card";
import { PixelCoin } from "@/components/ui/pixel-icons";

type Category = {
  id: string;
  name: string;
  icon: string;
  forIncome: boolean;
  isActive: boolean;
};
type Budget = { id: string; categoryId: string; amount: number; rolloverAmount: number; month: number; year: number };
type Tx = { type: string; amount: number; categoryId: string; date: Date | string };

interface BudgetManagerCardProps {
  categories: Category[];
  budgets: Budget[];
  transactions: Tx[];
  month: number;
  year: number;
}

function adjacentPeriod(month: number, year: number, direction: -1 | 1) {
  const date = new Date(year, month - 1 + direction, 1);
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function validAmount(value: string) {
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount > 0 && amount <= 2_147_483_647 ? amount : null;
}

export function BudgetManagerCard({ categories, budgets, transactions, month, year }: BudgetManagerCardProps) {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [newCategoryId, setNewCategoryId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const spentMap = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const transaction of transactions) {
      const date = new Date(transaction.date);
      if (transaction.type === "keluar" && date.getMonth() + 1 === month && date.getFullYear() === year) {
        totals[transaction.categoryId] = (totals[transaction.categoryId] ?? 0) + transaction.amount;
      }
    }
    return totals;
  }, [transactions, month, year]);

  const budgetMap = useMemo(() => {
    const map: Record<string, Budget> = {};
    for (const budget of budgets) {
      if (budget.month === month && budget.year === year) map[budget.categoryId] = budget;
    }
    return map;
  }, [budgets, month, year]);

  const expenseCategories = categories.filter((category) =>
    !category.forIncome && (category.isActive || Boolean(budgetMap[category.id])),
  );
  const withBudget = expenseCategories.filter((category) => Boolean(budgetMap[category.id]));
  const withoutBudget = expenseCategories.filter((category) => category.isActive && !budgetMap[category.id]);
  const periodLabel = new Date(year, month - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  const previous = adjacentPeriod(month, year, -1);
  const cannotGoPrevious = previous.year < 2000;

  const clearFeedback = () => {
    setMessage("");
    setError("");
  };

  const saveBudget = async (categoryId: string, value: string) => {
    const amount = validAmount(value);
    if (!amount) {
      setError("Masukkan anggaran bulanan berupa angka bulat yang lebih besar dari 0.");
      setMessage("");
      return;
    }
    setBusy("save");
    clearFeedback();
    try {
      await upsertBudget({ categoryId, amount, month, year });
      setEditId(null);
      setNewCategoryId(null);
      setEditAmount("");
      setNewAmount("");
      setMessage("Anggaran berhasil disimpan.");
      router.refresh();
    } catch {
      setError("Anggaran belum tersimpan. Periksa nominal lalu coba lagi.");
    } finally {
      setBusy("");
    }
  };

  const removeBudget = async (categoryId: string) => {
    if (!window.confirm("Hapus anggaran kategori ini untuk periode yang dipilih?")) return;
    setBusy("delete");
    clearFeedback();
    try {
      await deleteBudget(categoryId, month, year);
      setMessage("Anggaran berhasil dihapus.");
      router.refresh();
    } catch {
      setError("Anggaran gagal dihapus. Coba lagi.");
    } finally {
      setBusy("");
    }
  };

  const copyPrevious = async () => {
    if (cannotGoPrevious) return;
    if (!window.confirm(`Salin anggaran bulan sebelumnya ke ${periodLabel}? Anggaran yang sudah ada tidak akan ditimpa.`)) return;
    setBusy("copy");
    clearFeedback();
    try {
      const created = await copyPreviousMonthBudgets(month, year);
      setMessage(created === 0
        ? "Tidak ada anggaran baru untuk disalin; kategori yang sudah memiliki anggaran tetap utuh."
        : `${created} anggaran berhasil disalin ke ${periodLabel}.`);
      router.refresh();
    } catch {
      setError("Anggaran bulan sebelumnya gagal disalin. Coba lagi.");
    } finally {
      setBusy("");
    }
  };

  const inputClass =
    "min-w-0 flex-1 rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2 text-sm font-bold text-room-text focus:border-cream-400 focus:outline-none focus:ring-2 focus:ring-cream-200";

  return (
    <RoomCard className="mb-4">
      <RoomCardHeader
        icon={<PixelCoin size={18} />}
        title={`Anggaran Bulanan · ${periodLabel}`}
        accent="cream"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void copyPrevious()}
          disabled={Boolean(busy) || cannotGoPrevious}
          className="inline-flex min-h-9 items-center gap-2 rounded-full border-2 border-cream-200 bg-cream-50 px-3 py-1.5 text-xs font-extrabold text-cream-700 hover:bg-cream-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Copy size={13} aria-hidden="true" />
          {busy === "copy" ? "Menyalin..." : "Salin anggaran bulan lalu"}
        </button>
      </div>

      {message && <p role="status" className="mb-3 rounded-lg bg-mint-50 px-3 py-2 text-xs font-bold text-room-text">{message}</p>}
      {error && <p role="alert" className="mb-3 rounded-lg bg-peach-50 px-3 py-2 text-xs font-bold text-room-text">{error}</p>}

      {withBudget.length === 0 && withoutBudget.length === 0 && (
        <p className="py-3 text-center text-sm font-semibold text-room-muted">Belum ada kategori pengeluaran.</p>
      )}

      <ul className="mb-3 space-y-4">
        {withBudget.map((category) => {
          const budget = budgetMap[category.id];
          const spent = spentMap[category.id] ?? 0;
          const effectiveLimit = budget.amount + budget.rolloverAmount;
          const percentage = effectiveLimit > 0 ? Math.min(Math.round((spent / effectiveLimit) * 100), 100) : spent > 0 ? 100 : 0;
          const over = spent > effectiveLimit;

          return (
            <li key={category.id}>
              {editId === category.id ? (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="w-6 shrink-0 text-base">{category.icon}</span>
                  <span className="min-w-20 flex-1 text-xs font-bold text-room-text">{category.name}</span>
                  <label className="sr-only" htmlFor={`budget-edit-${category.id}`}>Anggaran dasar kategori {category.name}</label>
                  <input
                    id={`budget-edit-${category.id}`}
                    type="number"
                    min={1}
                    step={1}
                    value={editAmount}
                    onChange={(event) => setEditAmount(event.target.value)}
                    placeholder={budget.amount === 0 ? "Tambah anggaran (Rp)" : "Anggaran dasar (Rp)"}
                    className={cn(inputClass, "max-w-48")}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => void saveBudget(category.id, editAmount)}
                    disabled={Boolean(busy)}
                    aria-label={`Simpan anggaran ${category.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-room-text hover:bg-mint-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-400 disabled:opacity-50"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditId(null)}
                    aria-label="Batalkan perubahan"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-room-muted hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="mb-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="flex min-w-0 items-center gap-1.5 text-xs font-bold text-room-text">
                    <span aria-hidden="true">{category.icon}</span>
                    <span className="truncate">{category.name}</span>
                    {!category.isActive && (
                      <span className="shrink-0 rounded-full bg-cream-100 px-2 py-0.5 text-[10px] text-room-muted">Diarsipkan</span>
                    )}
                    {over && <span className="shrink-0 text-[10px] font-bold text-room-text">Melebihi anggaran</span>}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={cn("text-right text-xs font-bold", over ? "text-room-text" : "text-room-muted")}>
                      {formatRupiah(spent)} / {formatRupiah(effectiveLimit)}
                    </span>
                    {category.isActive && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditId(category.id);
                            setEditAmount(budget.amount > 0 ? String(budget.amount) : "");
                            clearFeedback();
                          }}
                          aria-label={`Edit anggaran ${category.name}`}
                          title="Edit anggaran"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100 text-room-muted hover:bg-cream-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeBudget(category.id)}
                          disabled={Boolean(busy)}
                          aria-label={`Hapus anggaran ${category.name}`}
                          title="Hapus anggaran"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-cream-100 text-room-muted hover:bg-peach-100 hover:text-room-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-peach-400 disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {budget.rolloverAmount > 0 && (
                <p className="mb-1 ml-8 text-[10px] font-semibold text-room-muted">
                  Termasuk sisa bulan lalu {formatRupiah(budget.rolloverAmount)}
                </p>
              )}
              {editId !== category.id && <ProgressBar value={percentage} color={over ? "peach" : "cream"} />}
            </li>
          );
        })}
      </ul>

      {withoutBudget.length > 0 && (
        <div className="space-y-2 border-t border-room-border pt-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-room-muted">Tambahkan anggaran:</p>
          {!newCategoryId ? (
            <div className="flex flex-wrap gap-2">
              {withoutBudget.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setNewCategoryId(category.id);
                    setNewAmount("");
                    clearFeedback();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-cream-300 px-3 py-1.5 text-xs font-bold text-cream-700 hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
                >
                  <span aria-hidden="true">{category.icon}</span>
                  {category.name}
                  <Plus size={12} aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cream-200 bg-cream-50 p-2">
              <span aria-hidden="true" className="text-base">
                {withoutBudget.find((category) => category.id === newCategoryId)?.icon}
              </span>
              <label className="sr-only" htmlFor="new-budget-amount">Nominal anggaran baru</label>
              <input
                id="new-budget-amount"
                type="number"
                min={1}
                step={1}
                value={newAmount}
                onChange={(event) => setNewAmount(event.target.value)}
                placeholder="Anggaran (Rp)"
                className={inputClass}
                autoFocus
              />
              <button
                type="button"
                onClick={() => void saveBudget(newCategoryId, newAmount)}
                disabled={Boolean(busy)}
                className="min-h-9 rounded-xl bg-cream-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-cream-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400 disabled:opacity-50"
              >
                {busy === "save" ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setNewCategoryId(null)}
                aria-label="Batalkan tambah anggaran"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-room-muted hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </RoomCard>
  );
}

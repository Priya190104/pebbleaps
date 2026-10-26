"use client";

import { useMemo, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import { LockKeyhole, RotateCcw, Trash2 } from "lucide-react";
import { deleteTransaction } from "@/lib/actions/finance";
import { TransactionEditDialog } from "./transaction-edit-dialog";

type Category = { id: string; name: string; icon: string; forIncome: boolean; isActive: boolean };
type Wallet = { id: string; name: string };
type Transaction = {
  id: string;
  type: string;
  amount: number;
  note: string;
  categoryId: string;
  walletId: string | null;
  date: Date | string;
  reconciliationId: string | null;
  category: { id: string; name: string; icon: string; forIncome: boolean; isActive: boolean };
};

const controlClass =
  "w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2 text-sm font-semibold text-room-text focus:border-cream-400 focus:outline-none focus:ring-2 focus:ring-cream-200";

export function TransactionList({
  transactions,
  categories,
  wallets,
}: {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
}) {
  const [deleted, setDeleted] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [noteSearch, setNoteSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("semua");
  const [categoryFilter, setCategoryFilter] = useState("semua");
  const [walletFilter, setWalletFilter] = useState("semua");

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus transaksi ini?")) return;
    setError("");
    setDeleted((previous) => new Set(previous).add(id));
    try {
      await deleteTransaction(id);
    } catch {
      setDeleted((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
      setError("Transaksi gagal dihapus. Coba lagi.");
    }
  };

  const visible = useMemo(() => {
    const normalizedSearch = noteSearch.trim().toLocaleLowerCase("id-ID");
    return transactions.filter((transaction) => {
      if (deleted.has(transaction.id)) return false;
      if (normalizedSearch && !transaction.note.toLocaleLowerCase("id-ID").includes(normalizedSearch)) return false;
      if (typeFilter !== "semua" && transaction.type !== typeFilter) return false;
      if (categoryFilter !== "semua" && transaction.categoryId !== categoryFilter) return false;
      if (walletFilter === "tanpa-kantong" && transaction.walletId !== null) return false;
      if (walletFilter !== "semua" && walletFilter !== "tanpa-kantong" && transaction.walletId !== walletFilter) return false;
      return true;
    });
  }, [transactions, deleted, noteSearch, typeFilter, categoryFilter, walletFilter]);

  const resetFilters = () => {
    setNoteSearch("");
    setTypeFilter("semua");
    setCategoryFilter("semua");
    setWalletFilter("semua");
  };
  const filtersChanged = noteSearch !== "" || typeFilter !== "semua" ||
    categoryFilter !== "semua" || walletFilter !== "semua";

  return (
    <>
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-bold text-room-muted">
          Cari catatan
          <input
            type="search"
            value={noteSearch}
            onChange={(event) => setNoteSearch(event.target.value)}
            placeholder="Contoh: makan siang"
            className={`${controlClass} mt-1`}
          />
        </label>
        <label className="text-xs font-bold text-room-muted">
          Jenis transaksi
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className={`${controlClass} mt-1`}>
            <option value="semua">Semua jenis</option>
            <option value="masuk">Pemasukan</option>
            <option value="keluar">Pengeluaran</option>
          </select>
        </label>
        <label className="text-xs font-bold text-room-muted">
          Kategori
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={`${controlClass} mt-1`}>
            <option value="semua">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-room-muted">
          Kantong
          <select value={walletFilter} onChange={(event) => setWalletFilter(event.target.value)} className={`${controlClass} mt-1`}>
            <option value="semua">Semua kantong</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
            ))}
            <option value="tanpa-kantong">Tanpa kantong</option>
          </select>
        </label>
        {filtersChanged && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-room-muted hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Atur ulang filter
            </button>
          </div>
        )}
      </div>

      {error && <p role="alert" className="mb-3 rounded-lg bg-peach-50 px-3 py-2 text-xs font-semibold text-room-text">{error}</p>}
      {visible.length === 0 ? (
        <div className="py-5 text-center">
          <p className="text-sm font-semibold text-room-muted">
            {transactions.length === 0 ? "Belum ada transaksi pada periode ini." : "Tidak ada transaksi yang cocok dengan filter."}
          </p>
          {filtersChanged && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-2 rounded-lg px-3 py-1.5 text-xs font-extrabold text-cream-700 hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
            >
              Hapus semua filter
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="mb-2 text-[11px] font-semibold text-room-muted" aria-live="polite">
            {visible.length} transaksi ditemukan
          </p>
          <ul className="divide-y divide-room-border">
            {visible.map((transaction) => {
              const reconciled = Boolean(transaction.reconciliationId);
              return (
                <li key={transaction.id} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream-50 text-base">
                    {transaction.category.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-room-text">{transaction.note}</p>
                    <p className="text-[11px] font-medium text-room-muted">
                      {transaction.category.name} · {new Date(transaction.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      {reconciled && (
                        <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-sky-50 px-1.5 py-0.5 font-bold text-room-text">
                          <LockKeyhole size={10} aria-hidden="true" /> Terekonsiliasi
                        </span>
                      )}
                    </p>
                  </div>
                  <span className={`shrink-0 text-sm font-extrabold ${transaction.type === "masuk" ? "text-mint-500" : "text-peach-500"}`}>
                    {transaction.type === "masuk" ? "+" : "−"}{formatRupiah(transaction.amount)}
                  </span>
                  {reconciled ? (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center text-room-text" title="Transaksi terkunci setelah rekonsiliasi">
                      <LockKeyhole size={14} aria-hidden="true" />
                      <span className="sr-only">Transaksi terkunci setelah rekonsiliasi</span>
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void handleDelete(transaction.id)}
                        aria-label={`Hapus transaksi ${transaction.note}`}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-room-subtle hover:bg-peach-50 hover:text-peach-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
                        title="Hapus transaksi"
                      >
                        <Trash2 size={14} />
                      </button>
                      <TransactionEditDialog
                        transaction={transaction}
                        categories={transaction.category.isActive
                          ? categories.filter((category) => category.isActive)
                          : [...categories.filter((category) => category.isActive), transaction.category]}
                        wallets={wallets}
                      />
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}

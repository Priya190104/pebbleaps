"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { updateTransaction } from "@/lib/actions/finance";

type Category = { id: string; name: string; forIncome: boolean };
type Wallet = { id: string; name: string };
type Transaction = {
  id: string;
  type: string;
  amount: number;
  note: string;
  categoryId: string;
  walletId: string | null;
  date: Date | string;
};

function localDateInputValue(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function TransactionEditDialog({
  transaction,
  categories,
  wallets,
}: {
  transaction: Transaction;
  categories: Category[];
  wallets: Wallet[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"masuk" | "keluar">(transaction.type === "masuk" ? "masuk" : "keluar");
  const [amount, setAmount] = useState(String(transaction.amount));
  const [note, setNote] = useState(transaction.note);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [walletId, setWalletId] = useState(transaction.walletId ?? "");
  const [date, setDate] = useState(localDateInputValue(transaction.date));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableCategories = categories.filter((category) => category.forIncome === (type === "masuk"));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateTransaction(transaction.id, {
        type,
        amount: Number(amount),
        note,
        categoryId,
        walletId,
        date: date ? new Date(`${date}T12:00:00`) : undefined,
      });
      setOpen(false);
      router.refresh();
    } catch {
      setError("Transaksi gagal diperbarui. Periksa nominal, kategori, kantong, dan tanggal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setType(transaction.type === "masuk" ? "masuk" : "keluar");
          setAmount(String(transaction.amount));
          setNote(transaction.note);
          setCategoryId(transaction.categoryId);
          setWalletId(transaction.walletId ?? "");
          setDate(localDateInputValue(transaction.date));
          setError("");
        }
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={`Edit transaksi ${transaction.note}`}
          title="Edit transaksi"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-room-muted hover:bg-cream-100 hover:text-cream-700"
        >
          <Pencil size={14} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-room-text/25 backdrop-blur-[2px]" />
        <Dialog.Content className="modal-sheet fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl border-t-2 border-room-border bg-white p-5 pb-safe lg:inset-x-auto lg:left-1/2 lg:top-1/2 lg:bottom-auto lg:w-full lg:max-w-md lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:border-2">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-extrabold text-room-text">Edit transaksi</Dialog.Title>
            <Dialog.Close aria-label="Tutup" className="rounded-lg p-2 text-room-muted hover:bg-cream-50">
              <X size={16} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Perbarui tanggal, jenis, nominal, kategori, kantong, atau catatan transaksi.
          </Dialog.Description>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-room-muted">
              Jenis
              <select
                value={type}
                onChange={(event) => {
                  const nextType = event.target.value as "masuk" | "keluar";
                  setType(nextType);
                  const nextCategories = categories.filter((category) => category.forIncome === (nextType === "masuk"));
                  if (!nextCategories.some((category) => category.id === categoryId)) {
                    setCategoryId(nextCategories[0]?.id ?? "");
                  }
                }}
                className="mt-1 w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2.5 text-sm text-room-text focus:border-cream-400 focus:outline-none"
              >
                <option value="keluar">Pengeluaran</option>
                <option value="masuk">Pemasukan</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-room-muted">
              Nominal (Rp)
              <input
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2.5 text-sm text-room-text focus:border-cream-400 focus:outline-none"
              />
            </label>
            <label className="block text-xs font-bold text-room-muted">
              Kategori
              <select
                value={categoryId}
                onChange={(event) => setCategoryId(event.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2.5 text-sm text-room-text focus:border-cream-400 focus:outline-none"
              >
                <option value="">Pilih kategori</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-room-muted">
              Kantong
              <select
                value={walletId}
                onChange={(event) => setWalletId(event.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2.5 text-sm text-room-text focus:border-cream-400 focus:outline-none"
              >
                <option value="">Pilih kantong</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-bold text-room-muted">
              Tanggal
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2.5 text-sm text-room-text focus:border-cream-400 focus:outline-none"
              />
            </label>
            <label className="block text-xs font-bold text-room-muted">
              Catatan
              <input
                maxLength={200}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2.5 text-sm text-room-text focus:border-cream-400 focus:outline-none"
              />
            </label>
          </div>
          {error && <p role="alert" className="mt-3 text-xs font-semibold text-peach-600">{error}</p>}
          <div className="mt-5 flex gap-2">
            <Dialog.Close className="flex-1 rounded-xl border-2 border-room-border px-3 py-2.5 text-sm font-bold text-room-muted">
              Batal
            </Dialog.Close>
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || !walletId || !categoryId || !amount || !note.trim() || !date}
              className="flex-1 rounded-xl bg-peach-400 px-3 py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

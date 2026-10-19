"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, LockKeyhole, Scale, X } from "lucide-react";
import { createWalletReconciliation } from "@/lib/actions/finance";
import { formatRupiah } from "@/lib/utils";

type WalletTransaction = {
  id: string;
  type: string;
  amount: number;
  note: string;
  date: Date | string;
  reconciliationId: string | null;
};

function localDateValue(value: Date | string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayValue() {
  return localDateValue(new Date());
}

function signedAmount(transaction: WalletTransaction) {
  return transaction.type === "masuk" ? transaction.amount : -transaction.amount;
}

export function WalletReconciliationDialog({
  walletId,
  walletName,
  transactions,
}: {
  walletId: string;
  walletName: string;
  transactions: WalletTransaction[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [statementDate, setStatementDate] = useState(todayValue);
  const [statementBalance, setStatementBalance] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reconciled = useMemo(() => transactions.filter((transaction) => {
    const date = localDateValue(transaction.date);
    return Boolean(transaction.reconciliationId) && Boolean(statementDate && date) && date <= statementDate;
  }), [transactions, statementDate]);

  const eligible = useMemo(() => transactions.filter((transaction) => {
    const date = localDateValue(transaction.date);
    return !transaction.reconciliationId && Boolean(statementDate && date) && date <= statementDate;
  }), [transactions, statementDate]);

  const reconciledTotal = reconciled.reduce((total, transaction) => total + signedAmount(transaction), 0);
  const selected = eligible.filter((transaction) => selectedIds.includes(transaction.id));
  const selectedTotal = selected.reduce((total, transaction) => total + signedAmount(transaction), 0);
  const calculatedBalance = reconciledTotal + selectedTotal;
  const parsedStatement = statementBalance === "" ? NaN : Number(statementBalance);
  const validStatement = Number.isSafeInteger(parsedStatement) && parsedStatement >= -2_147_483_648 &&
    parsedStatement <= 2_147_483_647;
  const difference = validStatement ? parsedStatement - calculatedBalance : null;
  const matches = difference === 0;

  const toggleTransaction = (id: string) => {
    setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
  };

  const toggleAll = () => {
    const allSelected = eligible.length > 0 && eligible.every((transaction) => selectedIds.includes(transaction.id));
    setSelectedIds(allSelected ? [] : eligible.map((transaction) => transaction.id));
  };

  const submit = async () => {
    if (!statementDate || !validStatement || !matches) return;
    setSaving(true);
    setError("");
    try {
      const [year, month, day] = statementDate.split("-").map(Number);
      const localMidnight = new Date(year, month - 1, day);
      const nextLocalMidnight = new Date(localMidnight);
      nextLocalMidnight.setDate(nextLocalMidnight.getDate() + 1);
      await createWalletReconciliation(walletId, {
        statementDate,
        statementBalance: parsedStatement,
        transactionIds: selected.map((transaction) => transaction.id),
        timezoneOffsetMinutes: localMidnight.getTimezoneOffset(),
        nextDayTimezoneOffsetMinutes: nextLocalMidnight.getTimezoneOffset(),
      });
      setOpen(false);
      setSelectedIds([]);
      setStatementBalance("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error && caught.message
        ? caught.message
        : "Rekonsiliasi gagal disimpan. Periksa kembali tanggal dan transaksi yang dipilih, lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2.5 text-sm font-semibold text-room-text focus:border-cream-400 focus:outline-none focus:ring-2 focus:ring-cream-200";

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) {
          setStatementDate(todayValue());
          setStatementBalance("");
          setSelectedIds([]);
          setError("");
        }
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={`Rekonsiliasi kantong ${walletName}`}
          title="Rekonsiliasi saldo dengan rekening"
          className="inline-flex min-h-8 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-room-text hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <Scale size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Rekonsiliasi</span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-room-text/25 backdrop-blur-[2px]" />
        <Dialog.Content className="modal-sheet fixed inset-x-0 bottom-0 z-50 max-h-[92dvh] overflow-y-auto rounded-t-3xl border-t-2 border-room-border bg-white p-5 pb-safe lg:inset-x-auto lg:left-1/2 lg:top-1/2 lg:bottom-auto lg:w-full lg:max-w-xl lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:border-2">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="font-extrabold text-room-text">Rekonsiliasi {walletName}</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs font-semibold text-room-muted">
                Cocokkan transaksi dengan saldo pada rekening atau catatan saldo di tanggal tertentu.
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Tutup" className="rounded-lg p-2 text-room-muted hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400">
              <X size={16} />
            </Dialog.Close>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-room-muted">
              Tanggal saldo
              <input
                type="date"
                value={statementDate}
                onChange={(event) => {
                  setStatementDate(event.target.value);
                  setSelectedIds([]);
                  setError("");
                }}
                className={inputClass}
              />
            </label>
            <label className="text-xs font-bold text-room-muted">
              Saldo pada rekening (Rp)
              <input
                type="number"
                min={-2_147_483_648}
                step={1}
                value={statementBalance}
                onChange={(event) => {
                  setStatementBalance(event.target.value);
                  setError("");
                }}
                placeholder="Contoh: 1250000"
                className={inputClass}
              />
            </label>
          </div>

          <div className="mb-4 grid grid-cols-1 gap-2 rounded-xl bg-cream-50 p-3 sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-bold text-room-muted">Transaksi terekonsiliasi</p>
              <p className="text-sm font-extrabold text-room-text">{formatRupiah(reconciledTotal)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-room-muted">Dengan pilihan saat ini</p>
              <p className="text-sm font-extrabold text-room-text">{formatRupiah(calculatedBalance)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-room-muted">Selisih menuju saldo rekening</p>
              <p className="text-sm font-extrabold text-room-text">
                {difference === null ? "Masukkan saldo" : formatRupiah(difference)}
              </p>
            </div>
          </div>

          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-xs font-extrabold text-room-text">Pilih transaksi sampai tanggal tersebut</h3>
            {eligible.length > 0 && (
              <button
                type="button"
                onClick={toggleAll}
                className="rounded-lg px-2 py-1 text-xs font-bold text-cream-700 hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
              >
                {eligible.every((transaction) => selectedIds.includes(transaction.id)) ? "Batalkan semua" : "Pilih semua"}
              </button>
            )}
          </div>
          <div className="max-h-56 overflow-y-auto rounded-xl border border-room-border">
            {eligible.length === 0 ? (
              <p className="p-4 text-center text-xs font-semibold text-room-muted">
                Tidak ada transaksi yang belum direkonsiliasi hingga tanggal ini.
              </p>
            ) : (
              <ul className="divide-y divide-room-border">
                {eligible.map((transaction) => {
                  const checked = selectedIds.includes(transaction.id);
                  return (
                    <li key={transaction.id}>
                      <label className="flex cursor-pointer items-center gap-3 px-3 py-2.5 hover:bg-cream-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTransaction(transaction.id)}
                          className="h-4 w-4 shrink-0 accent-cream-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-bold text-room-text">{transaction.note}</span>
                          <span className="block text-[10px] font-medium text-room-muted">
                            {new Date(transaction.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs font-extrabold text-room-text">
                          {transaction.type === "masuk" ? "+" : "−"}{formatRupiah(transaction.amount)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          {error && <p role="alert" className="mt-3 rounded-lg bg-peach-50 px-3 py-2 text-xs font-bold text-room-text">{error}</p>}
          {matches && validStatement && statementDate && (
            <p role="status" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-mint-50 px-2 py-1 text-xs font-bold text-room-text">
              <Check size={14} aria-hidden="true" /> Saldo dan transaksi sudah cocok.
            </p>
          )}
          <div className="mt-5 flex gap-2">
            <Dialog.Close className="flex-1 rounded-xl border-2 border-room-border px-3 py-2.5 text-sm font-bold text-room-muted hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400">
              Batal
            </Dialog.Close>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={saving || !validStatement || !statementDate || !matches}
              className="flex-1 rounded-xl bg-cream-600 px-3 py-2.5 text-sm font-extrabold text-white hover:bg-cream-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan rekonsiliasi"}
            </button>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] font-semibold text-room-muted">
            <LockKeyhole size={11} aria-hidden="true" />
            Transaksi yang disimpan dalam rekonsiliasi akan terkunci dari edit dan hapus.
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

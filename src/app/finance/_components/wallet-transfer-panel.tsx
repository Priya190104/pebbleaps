"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDownLeft, ArrowLeftRight, ArrowUpRight, Trash2, X } from "lucide-react";
import { createWalletTransfer, deleteWalletTransfer } from "@/lib/actions/finance";
import { formatRupiah } from "@/lib/utils";

type Wallet = { id: string; name: string; icon: string; balance: number };
type Transfer = {
  id: string;
  amount: number;
  note: string;
  date: Date | string;
  fromWallet: { id: string; name: string; icon: string };
  toWallet: { id: string; name: string; icon: string };
};

function localDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function WalletTransferPanel({
  wallets,
  transfers,
}: {
  wallets: Wallet[];
  transfers: Transfer[];
}) {
  const router = useRouter();
  const [fromWalletId, setFromWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => localDateInput(new Date()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const selectedSource = wallets.find((wallet) => wallet.id === fromWalletId);
  const selectedAmount = Number(amount);

  const createTransfer = async () => {
    setSaving(true);
    setError("");
    try {
      const [year, month, day] = date.split("-").map(Number);
      await createWalletTransfer({
        fromWalletId,
        toWalletId,
        amount: selectedAmount,
        note,
        date: new Date(year, month - 1, day),
      });
      setAmount("");
      setNote("");
      setDate(localDateInput(new Date()));
      setOpen(false);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error && caught.message
        ? caught.message
        : "Transfer gagal disimpan. Periksa saldo dan kantong yang dipilih, lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const removeTransfer = async (transfer: Transfer) => {
    if (!window.confirm(`Hapus transfer ${formatRupiah(transfer.amount)} dari ${transfer.fromWallet.name} ke ${transfer.toWallet.name}?`)) {
      return;
    }
    setError("");
    try {
      await deleteWalletTransfer(transfer.id);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error && caught.message
        ? caught.message
        : "Transfer gagal dihapus. Coba lagi.");
    }
  };

  const inputClass =
    "w-full rounded-xl border-2 border-room-border bg-white px-3 py-2.5 text-sm font-semibold text-room-text focus:border-cream-400 focus:outline-none focus:ring-2 focus:ring-cream-200";

  return (
    <section className="mt-5 border-t border-room-border pt-5" aria-labelledby="wallet-transfer-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 id="wallet-transfer-heading" className="text-sm font-extrabold text-room-text">Transfer antar kantong</h3>
        <Dialog.Root open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (nextOpen) setError(""); }}>
          <Dialog.Trigger asChild>
            <button
              type="button"
              disabled={wallets.length < 2}
              aria-label="Buat transfer antar kantong"
              title={wallets.length < 2 ? "Tambahkan minimal dua kantong untuk transfer" : "Buat transfer"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 transition-colors hover:bg-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4"
            >
              <ArrowLeftRight size={17} aria-hidden="true" />
              <span className="hidden text-sm font-extrabold sm:inline">Transfer</span>
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-room-text/25 backdrop-blur-[2px]" />
            <Dialog.Content className="modal-sheet fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl border-t-2 border-room-border bg-white p-5 pb-safe lg:inset-x-auto lg:left-1/2 lg:top-1/2 lg:bottom-auto lg:w-full lg:max-w-lg lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:border-2">
              <div className="mb-1 flex items-center justify-between gap-3">
                <Dialog.Title className="font-extrabold text-room-text">Transfer antar kantong</Dialog.Title>
                <Dialog.Close aria-label="Tutup" className="flex h-11 w-11 items-center justify-center rounded-xl text-room-muted hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400">
                  <X size={18} />
                </Dialog.Close>
              </div>
              <Dialog.Description className="mb-4 text-xs font-semibold text-room-muted">
                Perpindahan saldo tidak dihitung sebagai pemasukan atau pengeluaran.
              </Dialog.Description>
              {error && <p role="alert" className="mb-3 rounded-lg bg-peach-50 px-3 py-2 text-xs font-semibold text-room-text">{error}</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold text-room-muted">
                  Dari kantong
                  <select value={fromWalletId} onChange={(event) => setFromWalletId(event.target.value)} className={`${inputClass} mt-1`}>
                    <option value="">Pilih kantong asal</option>
                    {wallets.map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>{wallet.name} · {formatRupiah(wallet.balance)}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-room-muted">
                  Ke kantong
                  <select value={toWalletId} onChange={(event) => setToWalletId(event.target.value)} className={`${inputClass} mt-1`}>
                    <option value="">Pilih kantong tujuan</option>
                    {wallets.filter((wallet) => wallet.id !== fromWalletId).map((wallet) => (
                      <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-room-muted">
                  Jumlah (Rp)
                  <input
                    type="number"
                    min={1}
                    max={selectedSource?.balance ?? undefined}
                    step={1}
                    inputMode="numeric"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Contoh: 50000"
                    className={`${inputClass} mt-1`}
                  />
                  {selectedSource && <span className="mt-1 block font-medium">Saldo tersedia: {formatRupiah(selectedSource.balance)}</span>}
                </label>
                <label className="text-xs font-bold text-room-muted">
                  Tanggal
                  <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={`${inputClass} mt-1`} />
                </label>
                <label className="text-xs font-bold text-room-muted sm:col-span-2">
                  Catatan
                  <input
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={200}
                    placeholder="Contoh: Pindah dana ke tabungan"
                    className={`${inputClass} mt-1`}
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => void createTransfer()}
                disabled={saving || !fromWalletId || !toWalletId || !amount || !Number.isSafeInteger(selectedAmount) ||
                  selectedAmount < 1 || selectedAmount > (selectedSource?.balance ?? 0) || !note.trim() || !date}
                className="mt-4 min-h-11 w-full rounded-xl bg-cream-500 px-4 text-sm font-extrabold text-white transition-colors hover:bg-cream-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Menyimpan transfer..." : "Simpan transfer"}
              </button>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {wallets.length < 2 && (
        <p className="mb-3 rounded-xl bg-cream-50 px-3 py-2 text-xs font-semibold text-room-muted">
          Tambahkan minimal dua kantong untuk mulai transfer.
        </p>
      )}
      {error && !open && <p role="alert" className="mb-3 rounded-lg bg-peach-50 px-3 py-2 text-xs font-semibold text-room-text">{error}</p>}

      <div className="mt-4">
        <h4 className="mb-2 text-xs font-extrabold text-room-text">Transfer terbaru</h4>
        {transfers.length === 0 ? (
          <p className="rounded-xl bg-cream-50 px-3 py-3 text-xs font-semibold text-room-muted">
            Transfer yang kamu buat akan muncul di sini.
          </p>
        ) : (
          <ul className="divide-y divide-room-border">
            {transfers.map((transfer) => (
              <li key={transfer.id} className="flex items-center gap-3 py-3 first:pt-1">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700" aria-hidden="true">
                  <ArrowUpRight size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-room-text">{transfer.note}</p>
                  <p className="truncate text-[11px] font-medium text-room-muted">
                    {transfer.fromWallet.icon} {transfer.fromWallet.name}
                    <ArrowDownLeft className="mx-1 inline" size={11} aria-hidden="true" />
                    {transfer.toWallet.icon} {transfer.toWallet.name}
                    {" · "}
                    {new Date(transfer.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-extrabold text-room-text">{formatRupiah(transfer.amount)}</span>
                <button
                  type="button"
                  onClick={() => void removeTransfer(transfer)}
                  aria-label={`Hapus transfer ${transfer.note}`}
                  title="Hapus transfer"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-room-muted hover:bg-peach-50 hover:text-peach-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
                >
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

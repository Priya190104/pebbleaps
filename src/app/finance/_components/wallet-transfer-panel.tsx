"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Trash2 } from "lucide-react";
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
      <div className="mb-3">
        <h3 id="wallet-transfer-heading" className="text-sm font-extrabold text-room-text">Transfer antar kantong</h3>
        <p className="mt-1 text-xs font-semibold text-room-muted">
          Perpindahan saldo tidak dihitung sebagai pemasukan atau pengeluaran.
        </p>
      </div>

      {error && <p role="alert" className="mb-3 rounded-lg bg-peach-50 px-3 py-2 text-xs font-semibold text-room-text">{error}</p>}

      {wallets.length < 2 ? (
        <p className="rounded-xl bg-cream-50 px-3 py-3 text-xs font-semibold text-room-muted">
          Tambahkan minimal dua kantong untuk mulai transfer.
        </p>
      ) : (
        <div className="grid gap-2 rounded-xl bg-cream-50 p-3 sm:grid-cols-2">
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
          <button
            type="button"
            onClick={() => void createTransfer()}
            disabled={saving || !fromWalletId || !toWalletId || !amount || !Number.isSafeInteger(selectedAmount) ||
              selectedAmount < 1 || selectedAmount > (selectedSource?.balance ?? 0) || !note.trim() || !date}
            className="min-h-11 rounded-xl bg-cream-500 px-4 text-sm font-extrabold text-white transition-colors hover:bg-cream-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
          >
            {saving ? "Menyimpan transfer..." : "Simpan transfer"}
          </button>
        </div>
      )}

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
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-room-subtle hover:bg-peach-50 hover:text-peach-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

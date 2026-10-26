"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/utils";
import { createWallet, updateWallet, deleteWallet, setWalletBalance } from "@/lib/actions/finance";
import { RoomCard, RoomCardHeader } from "@/components/ui/room-card";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { WalletReconciliationDialog } from "./wallet-reconciliation-dialog";

type Wallet = {
  id: string;
  name: string;
  type: string;
  balance: number;
  icon: string;
  color: string;
  hasReconciliation: boolean;
};
type WalletTransaction = {
  id: string;
  walletId: string | null;
  type: string;
  amount: number;
  note: string;
  date: Date | string;
  reconciliationId: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  cash: "Tunai",
  bank: "Bank",
  card: "Kartu",
  ewallet: "e-Wallet",
  other: "Lainnya",
};

export function WalletsCard({ wallets: initial, transactions }: { wallets: Wallet[]; transactions: WalletTransaction[] }) {
  const router = useRouter();
  const [wallets, setWallets] = useState(initial);
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [targetBal, setTargetBal] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("💵");
  const [newType, setNewType] = useState("cash");
  const [newInitialBalance, setNewInitialBalance] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const total = wallets.reduce((s, w) => s + w.balance, 0);

  const applySetBalance = async (wallet: Wallet) => {
    const target = Math.round(parseFloat(targetBal));
    if (isNaN(target)) return;
    setSaving(true);
    setError("");
    try {
      await setWalletBalance(wallet.id, target);
      setWallets((ws) => ws.map((w) => (w.id === wallet.id ? { ...w, balance: target } : w)));
      setAdjustId(null);
      setTargetBal("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error && caught.message
        ? caught.message
        : "Saldo gagal disesuaikan. Periksa kategori pemasukan/pengeluaran lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setError("");
    try {
      await updateWallet(id, { name: editName, icon: editIcon });
      setWallets((ws) => ws.map((w) => (w.id === id ? { ...w, name: editName.trim(), icon: editIcon.trim() } : w)));
      setEditId(null);
    } catch {
      setError("Kantong gagal diperbarui. Periksa nama dan ikon lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const initialBalance = newInitialBalance.trim() ? Number(newInitialBalance) : 0;
      const w = await createWallet({
        name: newName.trim(),
        icon: newIcon,
        type: newType,
        initialBalance,
      });
      setWallets((ws) => [...ws, w]);
      setShowAdd(false);
      setNewName("");
      setNewIcon("💵");
      setNewType("cash");
      setNewInitialBalance("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error && caught.message
        ? caught.message
        : "Kantong gagal ditambahkan. Periksa nama, saldo awal, dan kategori pemasukan lalu coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus kantong ini? Transaksi yang terkait tetap disimpan tanpa kantong.")) return;
    setError("");
    try {
      await deleteWallet(id);
      setWallets((ws) => ws.filter((w) => w.id !== id));
    } catch {
      setError("Kantong gagal dihapus. Coba lagi.");
    }
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border-2 border-room-border bg-cream-50 text-room-text text-sm font-bold focus:outline-none focus:border-cream-400 transition-colors";

  return (
    <RoomCard className="mb-4">
      <RoomCardHeader
        icon={<span className="text-base">👛</span>}
        title="Kantong Keuangan"
        accent="peach"
        action={
          <button
            type="button"
            onClick={() => setShowAdd((s) => !s)}
            aria-label={showAdd ? "Tutup tambah kantong" : "Tambah kantong"}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-cream-100 text-cream-600 transition-colors hover:bg-cream-200"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        }
      />

      {/* Total */}
      {error && <p role="alert" className="mb-3 rounded-lg bg-peach-50 px-3 py-2 text-xs font-semibold text-room-text">{error}</p>}
      <div className="mb-4 p-3 bg-peach-50 rounded-xl border border-peach-100">
        <p className="text-[10px] font-bold text-room-muted uppercase tracking-wide">Total Semua Kantong</p>
        <p className="text-xl font-extrabold text-room-text">{formatRupiah(total)}</p>
      </div>

      {/* Wallet list */}
      <div className="space-y-2">
        {wallets.length === 0 && !showAdd && (
          <p className="text-center text-room-muted text-sm font-semibold py-2">
            Belum ada kantong. Tekan + untuk tambah!
          </p>
        )}

        {wallets.map((wallet) => (
          <div key={wallet.id}>
            <div className="group flex flex-wrap items-center gap-3 rounded-xl border border-room-border bg-cream-50 p-3">
              <span className="text-xl w-8 text-center shrink-0">{wallet.icon}</span>

              <div className="flex-1 min-w-0">
                {editId === wallet.id ? (
                  <div className="space-y-2">
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      aria-label="Nama kantong"
                      maxLength={80}
                      className="w-full rounded-lg border-2 border-room-border bg-white px-2 py-2 text-sm font-bold text-room-text focus:border-cream-400 focus:outline-none"
                    />
                    <EmojiPicker value={editIcon} onChange={setEditIcon} label="Pilih emoji kantong" />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(wallet.id)}
                        disabled={saving || !editName.trim()}
                        className="flex min-h-10 items-center gap-1.5 rounded-lg bg-mint-100 px-3 text-xs font-bold text-mint-600 hover:bg-mint-200 disabled:opacity-50"
                      >
                        <Check size={14} /> Simpan
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditId(null)}
                        className="flex min-h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-room-muted hover:bg-cream-100"
                      >
                        <X size={14} /> Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-room-text truncate">{wallet.name}</p>
                    <p className="text-[10px] text-room-muted font-medium">{TYPE_LABELS[wallet.type] ?? wallet.type}</p>
                  </>
                )}
              </div>

              {editId !== wallet.id && (
                <div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-1.5 sm:w-auto sm:justify-end">
                  <p className="text-sm font-extrabold text-room-text">{formatRupiah(wallet.balance)}</p>
                  <WalletReconciliationDialog
                    walletId={wallet.id}
                    walletName={wallet.name}
                    transactions={transactions.filter((transaction) => transaction.walletId === wallet.id)}
                  />
                  <div className="flex gap-1 opacity-100 transition-opacity group-focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    {!wallet.hasReconciliation && (
                      <button
                        type="button"
                        onClick={() => {
                          setAdjustId(adjustId === wallet.id ? null : wallet.id);
                          setTargetBal(String(wallet.balance));
                          setEditId(null);
                        }}
                        aria-label={`Set saldo ${wallet.name}`}
                        title="Set saldo sebelum rekonsiliasi"
                        className="flex h-11 w-11 items-center justify-center rounded-lg bg-peach-100 text-peach-500 transition-colors hover:bg-peach-200"
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => { setEditId(wallet.id); setEditName(wallet.name); setEditIcon(wallet.icon); setAdjustId(null); }}
                      aria-label={`Edit kantong ${wallet.name}`}
                      title="Edit nama"
                      className="flex h-11 w-11 items-center justify-center rounded-lg bg-cream-100 text-room-muted transition-colors hover:bg-cream-200"
                    >
                      <span className="text-[9px] font-bold">Aa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(wallet.id)}
                      aria-label={`Hapus kantong ${wallet.name}`}
                      title="Hapus kantong"
                      className="flex h-11 w-11 items-center justify-center rounded-lg bg-cream-100 text-room-muted transition-colors hover:bg-peach-100 hover:text-peach-500"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Set-balance form */}
            {adjustId === wallet.id && (
              <div className="mt-1 p-3 bg-white rounded-xl border-2 border-peach-200 space-y-2">
                <p className="text-[11px] font-bold text-room-muted">
                  Sesuaikan saldo sebelum rekonsiliasi; perubahan akan tercatat sebagai transaksi.
                </p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={targetBal}
                    onChange={(e) => setTargetBal(e.target.value)}
                    placeholder="Saldo baru (Rp)"
                    min={0}
                    className={cn(inputCls, "focus:border-peach-400")}
                  />
                  <button
                    onClick={() => applySetBalance(wallet)}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl bg-peach-400 text-white text-sm font-bold hover:bg-peach-500 disabled:opacity-50 transition-colors shrink-0"
                  >
                    Set
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add wallet form */}
      {showAdd && (
        <div className="mt-3 p-3 bg-cream-50 rounded-xl border-2 border-cream-200 space-y-2">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama kantong"
              className={inputCls}
            />
            <EmojiPicker value={newIcon} onChange={setNewIcon} label="Pilih emoji kantong" />
          </div>
          <label className="block text-xs font-bold text-room-muted">
            Saldo awal (Rp)
            <input
              type="number"
              min={0}
              step={1}
              value={newInitialBalance}
              onChange={(event) => setNewInitialBalance(event.target.value)}
              placeholder="0"
              className={cn(inputCls, "mt-1")}
            />
          </label>
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            className={inputCls}
          >
            <option value="cash">💵 Tunai</option>
            <option value="bank">🏦 Bank</option>
            <option value="card">💳 Kartu</option>
            <option value="ewallet">📱 e-Wallet</option>
            <option value="other">📦 Lainnya</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={saving || !newName.trim()}
              className="flex-1 py-2.5 rounded-xl bg-cream-500 text-white text-sm font-bold hover:bg-cream-600 disabled:opacity-50 transition-colors"
            >
              Tambah Kantong
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 rounded-xl border-2 border-room-border text-room-muted text-sm font-bold hover:bg-cream-50 transition-colors"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </RoomCard>
  );
}

"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRupiah } from "@/lib/utils";
import { createWallet, updateWallet, deleteWallet, setWalletBalance } from "@/lib/actions/finance";
import { RoomCard, RoomCardHeader } from "@/components/ui/room-card";
import { WalletReconciliationDialog } from "./wallet-reconciliation-dialog";

type Wallet = { id: string; name: string; type: string; balance: number; icon: string; color: string };
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
    } catch {
      setError("Saldo gagal disesuaikan. Periksa kategori pemasukan/pengeluaran lalu coba lagi.");
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
      const w = await createWallet({ name: newName.trim(), icon: newIcon, type: newType });
      setWallets((ws) => [...ws, w]);
      setShowAdd(false);
      setNewName("");
      setNewIcon("💵");
      setNewType("cash");
    } catch {
      setError("Kantong gagal ditambahkan. Periksa isian lalu coba lagi.");
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
            className="w-7 h-7 rounded-xl bg-cream-100 flex items-center justify-center text-cream-600 hover:bg-cream-200 transition-colors"
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
            <div className="flex items-center gap-3 p-3 rounded-xl bg-cream-50 border border-room-border group">
              <span className="text-xl w-8 text-center shrink-0">{wallet.icon}</span>

              <div className="flex-1 min-w-0">
                {editId === wallet.id ? (
                  <div className="flex gap-2 items-center">
                    <input
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="w-10 text-center border-2 rounded-lg border-room-border p-1 text-sm bg-white"
                    />
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 border-2 rounded-lg border-room-border px-2 py-1 text-sm font-bold text-room-text bg-white focus:outline-none focus:border-cream-400"
                    />
                    <button onClick={() => saveEdit(wallet.id)} className="text-mint-500 hover:text-mint-600">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditId(null)} className="text-room-muted hover:text-room-text">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-bold text-room-text truncate">{wallet.name}</p>
                    <p className="text-[10px] text-room-muted font-medium">{TYPE_LABELS[wallet.type] ?? wallet.type}</p>
                  </>
                )}
              </div>

              {editId !== wallet.id && (
                <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
                  <p className="text-sm font-extrabold text-room-text">{formatRupiah(wallet.balance)}</p>
                  <WalletReconciliationDialog
                    walletId={wallet.id}
                    walletName={wallet.name}
                    transactions={transactions.filter((transaction) => transaction.walletId === wallet.id)}
                  />
                  <div className="flex gap-1 opacity-100 transition-opacity group-focus-within:opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAdjustId(adjustId === wallet.id ? null : wallet.id);
                        setTargetBal(String(wallet.balance));
                        setEditId(null);
                      }}
                      aria-label={`Set saldo ${wallet.name}`}
                      title="Set saldo"
                      className="w-6 h-6 rounded-lg bg-peach-100 text-peach-500 flex items-center justify-center hover:bg-peach-200 transition-colors"
                    >
                      <Pencil size={10} />
                    </button>
                    <button
                      type="button"
                      onClick={() => { setEditId(wallet.id); setEditName(wallet.name); setEditIcon(wallet.icon); setAdjustId(null); }}
                      aria-label={`Edit kantong ${wallet.name}`}
                      title="Edit nama"
                      className="w-6 h-6 rounded-lg bg-cream-100 text-room-muted flex items-center justify-center hover:bg-cream-200 transition-colors"
                    >
                      <span className="text-[9px] font-bold">Aa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(wallet.id)}
                      aria-label={`Hapus kantong ${wallet.name}`}
                      title="Hapus kantong"
                      className="w-6 h-6 rounded-lg bg-cream-100 text-room-muted flex items-center justify-center hover:bg-peach-100 hover:text-peach-500 transition-colors"
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
                  Set saldo baru → akan dibuat transaksi penyesuaian otomatis <span className="text-room-subtle">(balance)</span>
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
          <div className="flex gap-2">
            <input
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-12 text-center border-2 rounded-xl border-room-border p-2 text-lg bg-white"
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama kantong"
              className={inputCls}
            />
          </div>
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

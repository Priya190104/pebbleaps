"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Pencil, Trash2, Check, X, Tags } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCategory, createCategory, deleteCategory } from "@/lib/actions/finance";

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isSavings: boolean;
  forIncome: boolean;
};

function CategoryRow({
  cat,
  onDelete,
  onUpdate,
}: {
  cat: Category;
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string, icon: string, forIncome: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);
  const [icon, setIcon] = useState(cat.icon);
  const [forIncome, setForIncome] = useState(cat.forIncome);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateCategory(cat.id, { name, icon, forIncome });
      onUpdate(cat.id, name.trim(), icon.trim(), forIncome);
      setEditing(false);
    } catch {
      setError("Kategori gagal diperbarui. Periksa nama atau transaksi terkait.");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <div>
        <div className="flex flex-col gap-2 p-2 rounded-xl bg-cream-50 border border-room-border sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-2">
            <input aria-label="Ikon kategori" value={icon} onChange={(e) => setIcon(e.target.value)}
              className="h-11 w-11 shrink-0 text-center text-lg border-2 rounded-lg border-room-border p-1 bg-white" />
            <input aria-label="Nama kategori" value={name} onChange={(e) => setName(e.target.value)}
              readOnly={cat.isSavings}
              className="min-w-0 flex-1 px-2 py-2 rounded-lg border-2 border-room-border bg-white text-sm font-bold text-room-text focus:outline-none focus:border-cream-400" />
          </div>
          <div className="flex items-center gap-2 sm:shrink-0">
            {cat.isSavings ? (
              <span className="inline-flex min-h-10 items-center rounded-lg border-2 border-peach-200 bg-peach-100 px-2 py-1 text-xs font-bold text-peach-600">
                💸 Pengeluaran · sistem
              </span>
            ) : (
              <button
                onClick={() => setForIncome((v) => !v)}
                className={cn("min-h-10 flex-1 px-2 py-1 rounded-lg text-xs font-bold border-2 transition-all sm:flex-none",
                  forIncome ? "bg-mint-100 text-mint-600 border-mint-200" : "bg-peach-100 text-peach-500 border-peach-200")}
              >
                {forIncome ? "💰 Masuk" : "💸 Keluar"}
              </button>
            )}
            <button aria-label="Simpan kategori" onClick={save} disabled={saving}
              className="h-10 w-10 shrink-0 rounded-lg text-mint-500 hover:bg-mint-100 hover:text-mint-600 disabled:opacity-50">
              <Check size={16} className="mx-auto" />
            </button>
            <button aria-label="Batal mengedit kategori" onClick={() => setEditing(false)}
              className="h-10 w-10 shrink-0 rounded-lg text-room-muted hover:bg-cream-100 hover:text-room-text">
              <X size={16} className="mx-auto" />
            </button>
          </div>
        </div>
        {error && <p role="alert" className="px-2 pt-1 text-[11px] font-semibold text-peach-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="group flex flex-wrap items-center gap-2 p-2 rounded-xl hover:bg-cream-50 transition-colors">
      <span className="text-base w-7 text-center shrink-0">{cat.icon}</span>
      <span className="min-w-0 flex-1 wrap-break-word text-sm font-bold text-room-text">{cat.name}</span>
      {cat.isSavings && (
        <span className="shrink-0 rounded-full bg-cream-100 px-2 py-0.5 text-[10px] font-bold text-room-muted">
          Penampung sisa
        </span>
      )}
      <span className={cn("shrink-0 whitespace-nowrap text-[10px] font-bold px-2 py-0.5 rounded-full",
        cat.forIncome ? "bg-mint-100 text-mint-600" : "bg-peach-100 text-peach-500")}>
        {cat.forIncome ? "Masuk" : "Keluar"}
      </span>
      <div className="ml-auto flex w-full shrink-0 justify-end gap-2 sm:w-auto">
        <button onClick={() => setEditing(true)} title="Edit" aria-label={`Edit kategori ${cat.name}`}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-room-border bg-cream-100 px-3 text-xs font-bold text-room-text hover:bg-cream-200 sm:w-10 sm:px-0">
          <Pencil size={14} />
          <span className="sm:hidden">Edit</span>
        </button>
        {!cat.isSavings && (
          <button onClick={() => onDelete(cat.id)} title="Hapus" aria-label={`Hapus kategori ${cat.name}`}
            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-peach-200 bg-peach-50 px-3 text-xs font-bold text-peach-600 hover:bg-peach-100 sm:w-10 sm:px-0">
            <Trash2 size={14} />
            <span className="sm:hidden">Hapus</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function CategoryManagerModal({ categories: initial }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addIcon, setAddIcon] = useState("📦");
  const [addForIncome, setAddForIncome] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus kategori ini dari daftar? Transaksi dan anggaran lama tetap tersimpan.")) return;
    setError("");
    try {
      await deleteCategory(id);
      setCategories((cs) => cs.filter((c) => c.id !== id));
    } catch {
      setError("Kategori gagal dihapus. Coba lagi.");
    }
  };

  const handleUpdate = (id: string, name: string, icon: string, forIncome: boolean) => {
    setCategories((cs) => cs.map((c) => (c.id === id ? { ...c, name, icon, forIncome } : c)));
  };

  const handleAdd = async () => {
    if (!addName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const cat = await createCategory({ name: addName.trim(), icon: addIcon, forIncome: addForIncome });
      setCategories((cs) => [...cs, cat]);
      setShowAdd(false);
      setAddName(""); setAddIcon("📦"); setAddForIncome(false);
    } catch {
      setError("Kategori gagal ditambahkan. Periksa nama dan coba lagi.");
    } finally { setSaving(false); }
  };

  const inputCls = "w-full px-3 py-2.5 rounded-xl border-2 border-room-border bg-white text-room-text text-sm font-bold focus:outline-none focus:border-cream-400 transition-colors";

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex min-h-10 items-center gap-1.5 px-2 text-xs font-bold text-cream-600 hover:text-cream-700 transition-colors">
        <Tags size={13} /> Kelola Kategori
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="modal-overlay fixed inset-0 bg-cream-900/40 backdrop-blur-[2px] z-50" />
          <Dialog.Content className="modal-sheet fixed bottom-0 inset-x-0 z-50 max-h-[90dvh] overflow-y-auto overscroll-contain rounded-t-3xl bg-white border-t-2 border-room-border pb-safe
            lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:inset-x-auto lg:rounded-2xl lg:max-w-lg lg:w-full lg:border-2 lg:max-h-[80dvh]">
            <div className="flex justify-center pt-3 pb-1 lg:hidden">
              <div className="w-10 h-1 rounded-full bg-room-border" />
            </div>
            <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-room-border">
              <Dialog.Title className="text-room-text font-extrabold text-base">Kelola Kategori</Dialog.Title>
              <Dialog.Close aria-label="Tutup pengelola kategori"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-50 hover:bg-cream-100 text-room-muted transition-colors">
                <X size={15} strokeWidth={2.5} />
              </Dialog.Close>
            </div>

            <div className="px-5 py-4 space-y-4">
              {error && <p role="alert" className="text-xs font-semibold text-peach-600">{error}</p>}
              {/* Category list */}
              <div className="space-y-1">
                {categories.length === 0 && (
                  <p className="text-center text-room-muted text-sm font-semibold py-4">Belum ada kategori.</p>
                )}
                {categories.map((cat) => (
                  <CategoryRow key={cat.id} cat={cat} onDelete={handleDelete} onUpdate={handleUpdate} />
                ))}
              </div>

              {/* Add new category */}
              {!showAdd ? (
                <button onClick={() => setShowAdd(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-cream-300 text-sm font-bold text-cream-500 hover:bg-cream-50 transition-colors">
                  <Plus size={15} /> Tambah Kategori
                </button>
              ) : (
                <div className="p-3 bg-cream-50 rounded-xl border-2 border-cream-200 space-y-2">
                  <div className="flex gap-2">
                    <input value={addIcon} onChange={(e) => setAddIcon(e.target.value)}
                      className="w-12 text-center border-2 rounded-xl border-room-border p-2 text-lg bg-white" />
                    <input value={addName} onChange={(e) => setAddName(e.target.value)}
                      placeholder="Nama kategori" className={inputCls} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setAddForIncome(false)}
                      className={cn("flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all",
                        !addForIncome ? "bg-peach-400 text-white border-peach-400" : "border-room-border text-room-muted")}>
                      💸 Pengeluaran
                    </button>
                    <button onClick={() => setAddForIncome(true)}
                      className={cn("flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all",
                        addForIncome ? "bg-mint-400 text-white border-mint-400" : "border-room-border text-room-muted")}>
                      💰 Pemasukan
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAdd} disabled={saving || !addName.trim()}
                      className="flex-1 py-2.5 rounded-xl bg-cream-500 text-white text-sm font-bold hover:bg-cream-600 disabled:opacity-50 transition-colors">
                      Tambah
                    </button>
                    <button onClick={() => setShowAdd(false)}
                      className="px-4 py-2.5 rounded-xl border-2 border-room-border text-room-muted text-sm font-bold hover:bg-cream-50">
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

"use client";

import { useState } from "react";
import { Check, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { RoomCard, RoomCardHeader } from "@/components/ui/room-card";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions/finance";

type Category = {
  id: string;
  name: string;
  icon: string;
  forIncome: boolean;
};

function CategoryRow({
  category,
  onDelete,
  onUpdate,
}: {
  category: Category;
  onDelete: (id: string) => void;
  onUpdate: (id: string, name: string, icon: string, forIncome: boolean) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [icon, setIcon] = useState(category.icon);
  const [forIncome, setForIncome] = useState(category.forIncome);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateCategory(category.id, { name, icon, forIncome });
      onUpdate(category.id, name.trim(), icon, forIncome);
      setEditing(false);
    } catch {
      setError("Kategori gagal diperbarui. Periksa nama atau transaksi terkait.");
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <li className="rounded-xl border border-room-border bg-cream-50 p-3">
        <div className="mb-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <label className="min-w-0 text-xs font-bold text-room-muted">
            Nama kategori
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              className="mt-1 w-full rounded-xl border-2 border-room-border bg-white px-3 py-2.5 text-sm font-bold text-room-text focus:border-cream-400 focus:outline-none"
            />
          </label>
          <EmojiPicker value={icon} onChange={setIcon} label="Pilih emoji" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setForIncome((value) => !value)}
            aria-pressed={forIncome}
            className={cn(
              "min-h-10 rounded-lg border-2 px-3 py-2 text-xs font-bold transition-colors",
              forIncome
                ? "border-mint-200 bg-mint-100 text-mint-600"
                : "border-peach-200 bg-peach-100 text-peach-600",
            )}
          >
            {forIncome ? "Pemasukan" : "Pengeluaran"}
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !name.trim()}
            className="flex h-10 items-center gap-1.5 rounded-lg bg-mint-100 px-3 text-xs font-bold text-mint-600 hover:bg-mint-200 disabled:opacity-50"
          >
            <Check size={14} /> Simpan
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setName(category.name); setIcon(category.icon); setForIncome(category.forIncome); setError(""); }}
            className="flex h-10 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-bold text-room-muted hover:bg-cream-100"
          >
            <X size={14} /> Batal
          </button>
        </div>
        {error && <p role="alert" className="mt-2 text-xs font-semibold text-peach-600">{error}</p>}
      </li>
    );
  }

  return (
    <li className="flex flex-wrap items-center gap-2 rounded-xl px-2 py-3 transition-colors hover:bg-cream-50">
      <span className="w-8 shrink-0 text-center text-lg" aria-hidden="true">{category.icon}</span>
      <span className="min-w-0 flex-1 text-sm font-bold text-room-text">{category.name}</span>
      <span className={cn(
        "rounded-full px-2 py-1 text-[10px] font-bold",
        category.forIncome ? "bg-mint-100 text-mint-600" : "bg-peach-100 text-peach-600",
      )}>
        {category.forIncome ? "Pemasukan" : "Pengeluaran"}
      </span>
      <div className="ml-auto flex gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Edit kategori ${category.name}`}
          className="flex h-10 items-center gap-1.5 rounded-lg border border-room-border bg-white px-3 text-xs font-bold text-room-text hover:bg-cream-50"
        >
          <Pencil size={13} /> Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(category.id)}
          aria-label={`Hapus kategori ${category.name}`}
          className="flex h-10 items-center gap-1.5 rounded-lg border border-peach-200 bg-peach-50 px-3 text-xs font-bold text-peach-600 hover:bg-peach-100"
        >
          <Trash2 size={13} /> Hapus
        </button>
      </div>
    </li>
  );
}

export function CategoryManager({ categories: initial }: { categories: Category[] }) {
  const [categories, setCategories] = useState(initial);
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState("");
  const [addIcon, setAddIcon] = useState("📦");
  const [addForIncome, setAddForIncome] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category || !window.confirm(`Hapus kategori ${category.name}? Transaksi dan anggaran lama tetap tersimpan.`)) return;
    setError("");
    try {
      await deleteCategory(id);
      setCategories((items) => items.filter((item) => item.id !== id));
    } catch {
      setError("Kategori gagal dihapus. Coba lagi.");
    }
  };

  const handleUpdate = (id: string, name: string, icon: string, forIncome: boolean) => {
    setCategories((items) => items.map((item) =>
      item.id === id ? { ...item, name, icon, forIncome } : item,
    ));
  };

  const handleAdd = async () => {
    if (!addName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const category = await createCategory({ name: addName.trim(), icon: addIcon, forIncome: addForIncome });
      setCategories((items) => [...items, category]);
      setShowAdd(false);
      setAddName("");
      setAddIcon("📦");
      setAddForIncome(false);
    } catch {
      setError("Kategori gagal ditambahkan. Periksa nama dan coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border-2 border-room-border bg-white px-3 py-2.5 text-sm font-bold text-room-text focus:border-cream-400 focus:outline-none";

  return (
    <RoomCard className="mb-4 min-w-0">
      <RoomCardHeader
        icon={<Tags size={18} />}
        title="Kategori"
        accent="cream"
        action={
          <button
            type="button"
            onClick={() => setShowAdd((value) => !value)}
            className="flex min-h-10 items-center gap-1.5 rounded-xl bg-cream-100 px-3 text-xs font-bold text-cream-700 hover:bg-cream-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
          >
            {showAdd ? <X size={14} /> : <Plus size={14} />}
            {showAdd ? "Tutup" : "Tambah kategori"}
          </button>
        }
      />
      <p className="mb-3 text-xs font-semibold text-room-muted">
        Atur kategori pemasukan dan pengeluaran. Menghapus kategori tidak menghapus transaksi atau anggaran yang sudah tercatat.
      </p>
      {error && <p role="alert" className="mb-3 rounded-lg bg-peach-50 px-3 py-2 text-xs font-semibold text-peach-600">{error}</p>}

      {showAdd && (
        <div className="mb-3 rounded-xl border-2 border-cream-200 bg-cream-50 p-3">
          <div className="mb-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <label className="text-xs font-bold text-room-muted">
              Nama kategori
              <input
                value={addName}
                onChange={(event) => setAddName(event.target.value)}
                maxLength={80}
                placeholder="Contoh: Tagihan"
                className={`${inputClass} mt-1`}
              />
            </label>
            <EmojiPicker value={addIcon} onChange={setAddIcon} label="Pilih emoji" />
          </div>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setAddForIncome(false)}
              aria-pressed={!addForIncome}
              className={cn(
                "min-h-10 flex-1 rounded-xl border-2 px-3 py-2 text-xs font-bold",
                !addForIncome ? "border-peach-400 bg-peach-400 text-white" : "border-room-border bg-white text-room-muted",
              )}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setAddForIncome(true)}
              aria-pressed={addForIncome}
              className={cn(
                "min-h-10 flex-1 rounded-xl border-2 px-3 py-2 text-xs font-bold",
                addForIncome ? "border-mint-400 bg-mint-400 text-white" : "border-room-border bg-white text-room-muted",
              )}
            >
              Pemasukan
            </button>
          </div>
          <button
            type="button"
            onClick={() => void handleAdd()}
            disabled={saving || !addName.trim()}
            className="min-h-10 rounded-xl bg-cream-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-cream-600 disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Simpan kategori"}
          </button>
        </div>
      )}

      {categories.length === 0 ? (
        <p className="py-4 text-center text-sm font-semibold text-room-muted">Belum ada kategori.</p>
      ) : (
        <ul className="divide-y divide-room-border">
          {categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </ul>
      )}
    </RoomCard>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addGoalNote, addMilestone, updateGoalValue } from "@/lib/actions/goals";
import { formatRupiah } from "@/lib/utils";

type Note = { id: string; content: string; createdAt: Date | string };
type Milestone = { id: string; title: string; done: boolean; deadline: Date | string | null };

const inputClass =
  "min-w-0 rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2 text-sm font-semibold text-room-text focus:border-mint-400 focus:outline-none";

export function NumericGoalProgress({
  id,
  currentValue,
  targetValue,
  unit,
}: {
  id: string;
  currentValue: number | null;
  targetValue: number | null;
  unit: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState(String(currentValue ?? 0));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue) || nextValue < 0) {
      setMessage("Masukkan angka 0 atau lebih.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await updateGoalValue(id, nextValue);
      setMessage("Progress tersimpan.");
      router.refresh();
    } catch {
      setMessage("Progress gagal disimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <label className="flex-1">
        <span className="mb-1 block text-xs font-bold text-room-muted">Progress saat ini {unit ? `(${unit})` : ""}</span>
        <input
          type="number"
          min="0"
          step="any"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className={`${inputClass} w-full`}
        />
      </label>
      <button
        type="button"
        disabled={saving}
        onClick={save}
        className="rounded-xl bg-mint-400 px-4 py-2 text-sm font-extrabold text-white hover:bg-mint-500 disabled:cursor-wait disabled:opacity-60"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
      {message && <p role="status" className="w-full text-xs font-semibold text-room-muted">{message}</p>}
      {unit === "Rupiah" && targetValue !== null && (
        <p className="w-full text-xs font-semibold text-room-muted">
          {formatRupiah(currentValue ?? 0)} dari {formatRupiah(targetValue)}
        </p>
      )}
    </div>
  );
}

export function GoalNotes({ goalId, initialNotes }: { goalId: string; initialNotes: Note[] }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    const text = content.trim();
    if (!text) {
      setError("Tulis catatan terlebih dahulu.");
      return;
    }
    if (text.length > 1000) {
      setError("Catatan maksimal 1.000 karakter.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addGoalNote(goalId, text);
      setContent("");
      router.refresh();
    } catch {
      setError("Catatan gagal disimpan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 border-t border-room-border pt-3">
      <label className="mb-1.5 block text-xs font-bold text-room-muted" htmlFor={`goal-note-${goalId}`}>Catatan progress</label>
      <div className="flex items-start gap-2">
        <textarea
          id={`goal-note-${goalId}`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          maxLength={1000}
          rows={2}
          placeholder="Catat perkembangan atau refleksimu..."
          className={`${inputClass} flex-1 resize-y`}
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || !content.trim()}
          className="rounded-xl bg-cream-500 px-3 py-2 text-xs font-extrabold text-white hover:bg-cream-600 disabled:opacity-50"
        >
          {saving ? "..." : "Simpan"}
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-peach-600">{error}</p>}
      {initialNotes.length > 0 && (
        <ul className="mt-3 space-y-2">
          {initialNotes.map((note) => (
            <li key={note.id} className="rounded-xl bg-cream-50 px-3 py-2">
              <p className="whitespace-pre-wrap text-xs font-medium text-room-text">{note.content}</p>
              <time className="mt-1 block text-[10px] font-semibold text-room-muted">
                {new Date(note.createdAt).toLocaleDateString("id-ID", { dateStyle: "medium" })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function AddMilestone({ goalId, milestones }: { goalId: string; milestones: Milestone[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!title.trim()) {
      setError("Nama milestone wajib diisi.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addMilestone(goalId, {
        title,
        deadline: deadline ? new Date(deadline) : undefined,
      });
      setTitle("");
      setDeadline("");
      router.refresh();
    } catch {
      setError("Milestone gagal ditambahkan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 border-t border-room-border pt-3">
      <label className="mb-1.5 block text-xs font-bold text-room-muted" htmlFor={`milestone-${goalId}`}>Tambah milestone</label>
      <div className="flex flex-wrap gap-2">
        <input
          id={`milestone-${goalId}`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void save(); } }}
          maxLength={120}
          placeholder="Langkah berikutnya"
          className={`${inputClass} flex-1`}
        />
        <input
          type="date"
          aria-label="Deadline milestone"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className={inputClass}
        />
        <button
          type="button"
          onClick={save}
          disabled={saving || !title.trim()}
          className="rounded-xl bg-cream-500 px-3 py-2 text-xs font-extrabold text-white hover:bg-cream-600 disabled:opacity-50"
        >
          {saving ? "..." : "Tambah"}
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-xs font-semibold text-peach-600">{error}</p>}
      {milestones.length === 0 && (
        <p className="mt-2 text-xs font-medium text-room-muted">Belum ada langkah. Tambahkan milestone pertama di atas.</p>
      )}
    </div>
  );
}

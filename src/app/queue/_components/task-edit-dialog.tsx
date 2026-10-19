"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { updateTask } from "@/lib/actions/tasks";

type TaskEditDialogProps = {
  task: {
    id: string;
    title: string;
    priority: string;
    deadline?: Date | string | null;
  };
};

function dateInputValue(value?: Date | string | null) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

export function TaskEditDialog({ task }: TaskEditDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [priority, setPriority] = useState(task.priority);
  const [deadline, setDeadline] = useState(dateInputValue(task.deadline));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      await updateTask(task.id, {
        title,
        priority,
        deadline: deadline ? new Date(deadline) : undefined,
      });
      setOpen(false);
      router.refresh();
    } catch {
      setError("Perubahan tugas gagal disimpan. Periksa isian lalu coba lagi.");
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
          setTitle(task.title);
          setPriority(task.priority);
          setDeadline(dateInputValue(task.deadline));
          setError("");
        }
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label={`Edit tugas ${task.title}`}
          title="Edit tugas"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-room-muted hover:bg-cream-100 hover:text-cream-700"
        >
          <Pencil size={14} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-room-text/25 backdrop-blur-[2px]" />
        <Dialog.Content className="modal-sheet fixed inset-x-0 bottom-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl border-t-2 border-room-border bg-white p-5 pb-safe lg:inset-x-auto lg:left-1/2 lg:top-1/2 lg:bottom-auto lg:w-full lg:max-w-md lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-2xl lg:border-2">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="font-extrabold text-room-text">Edit tugas</Dialog.Title>
            <Dialog.Close aria-label="Tutup" className="rounded-lg p-2 text-room-muted hover:bg-cream-50">
              <X size={16} />
            </Dialog.Close>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-bold text-room-muted">
              Judul
              <input
                autoFocus
                maxLength={200}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2.5 text-sm text-room-text focus:border-cream-400 focus:outline-none"
              />
            </label>
            <label className="block text-xs font-bold text-room-muted">
              Prioritas
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="mt-1 w-full rounded-xl border-2 border-room-border bg-cream-50 px-3 py-2.5 text-sm text-room-text focus:border-cream-400 focus:outline-none"
              >
                <option value="tinggi">Tinggi</option>
                <option value="sedang">Sedang</option>
                <option value="rendah">Rendah</option>
              </select>
            </label>
            <label className="block text-xs font-bold text-room-muted">
              Deadline
              <input
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
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
              disabled={saving || !title.trim()}
              className="flex-1 rounded-xl bg-cream-500 px-3 py-2.5 text-sm font-extrabold text-white disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Simpan perubahan"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

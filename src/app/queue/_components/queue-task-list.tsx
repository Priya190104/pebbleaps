"use client";

import { Fragment, useState } from "react";
import { RoomCard, PriorityBadge, CountBadge } from "@/components/ui/room-card";
import { PixelQueue } from "@/components/ui/pixel-icons";
import { daysUntil, cn } from "@/lib/utils";
import { CheckSquare2, Circle, Clock, ChevronDown, Trash2 } from "lucide-react";
import { createSubtask, toggleSubtask, updateTaskStatus, deleteTask } from "@/lib/actions/tasks";
import { TaskEditDialog } from "./task-edit-dialog";

type Task = {
  id: string; title: string; priority: string; status: string;
  deadline?: Date | string | null;
  subtasks: { id: string; title: string; done: boolean }[];
};

interface QueueTaskListProps {
  todo: Task[];
  progress: Task[];
  done: Task[];
}

export function QueueTaskList({ todo, progress, done }: QueueTaskListProps) {
  if (todo.length === 0 && progress.length === 0 && done.length === 0) {
    return (
      <div className="room-card p-10 text-center">
        <p className="text-4xl mb-3">📋</p>
        <p className="text-room-text font-extrabold text-base">Belum ada tugas</p>
        <p className="text-room-muted text-sm font-semibold mt-1">
          Tekan tombol + di atas untuk tambah tugas pertamamu
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <TaskSection title="Sedang Dikerjakan" tasks={progress} badge={progress.length} accent="sky" />
      <TaskSection title="Belum Mulai" tasks={todo} badge={todo.length} accent="cream" />
      <TaskSection title="Selesai" tasks={done} badge={done.length} accent="mint" collapsed />
    </div>
  );
}

function TaskSection({ title, tasks, badge, accent, collapsed = false }: {
  title: string; tasks: Task[]; badge: number;
  accent: "cream" | "sky" | "mint"; collapsed?: boolean;
}) {
  const [open, setOpen] = useState(!collapsed);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});

  const getStatus = (t: Task) => statuses[t.id] ?? t.status;
  const visible = tasks.filter((t) => getStatus(t) !== "__deleted__");

  if (visible.length === 0) return null;

  const cycleStatus = async (task: Task) => {
    const cur = getStatus(task);
    const next: "todo" | "progress" | "done" = cur === "todo" ? "progress" : cur === "progress" ? "done" : "todo";
    setStatuses((p) => ({ ...p, [task.id]: next }));
    setActionErrors((errors) => ({ ...errors, [task.id]: "" }));
    try {
      await updateTaskStatus(task.id, next);
    } catch {
      setStatuses((p) => {
        const nextStatuses = { ...p };
        delete nextStatuses[task.id];
        return nextStatuses;
      });
      setActionErrors((errors) => ({ ...errors, [task.id]: "Status tugas gagal diperbarui." }));
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setStatuses((p) => ({ ...p, [id]: "__deleted__" }));
    setActionErrors((errors) => ({ ...errors, [id]: "" }));
    try {
      await deleteTask(id);
    } catch {
      setStatuses((p) => {
        const nextStatuses = { ...p };
        delete nextStatuses[id];
        return nextStatuses;
      });
      setActionErrors((errors) => ({ ...errors, [id]: "Tugas gagal dihapus." }));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <RoomCard>
      <button
        className="w-full flex items-center justify-between mb-4"
        onClick={() => collapsed && setOpen((o) => !o)}
      >
        <div className="flex items-center gap-2.5">
          <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
            { cream: "bg-cream-100 text-cream-700", sky: "bg-sky-100 text-sky-500", mint: "bg-mint-100 text-mint-500" }[accent])}>
            <PixelQueue size={18} />
          </span>
          <span className="font-extrabold text-room-text text-sm">{title}</span>
          <CountBadge count={badge} variant={accent} />
        </div>
        {collapsed && <ChevronDown size={16} className={cn("text-room-muted transition-transform", open && "rotate-180")} />}
      </button>

      {(!collapsed || open) && (
        <ul className="space-y-3">
          {visible.map((task) => {
            const status = getStatus(task);
            const isDone = status === "done";
            return (
              <Fragment key={task.id}>
              <li className="group flex items-start gap-3">
                <button
                  onClick={() => cycleStatus(task)}
                  className="mt-0.5 shrink-0 text-room-subtle hover:text-cream-500 transition-colors"
                  title="Ubah status"
                >
                  {isDone
                    ? <CheckSquare2 size={18} className="text-mint-400" />
                    : <Circle size={18} />}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={cn("wrap-anywhere text-sm font-bold leading-snug", isDone ? "line-through text-room-subtle" : "text-room-text")}>
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <PriorityBadge priority={task.priority as "tinggi" | "sedang" | "rendah"} />
                    {task.deadline && !isDone && (
                      <span className={cn(
                        "flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border",
                        daysUntil(task.deadline) <= 1
                          ? "bg-peach-100 text-peach-500 border-peach-200"
                          : "bg-cream-50 text-room-muted border-room-border",
                      )}>
                        <Clock size={10} />
                        {daysUntil(task.deadline) === 0 ? "Hari ini" : daysUntil(task.deadline) === 1 ? "Besok" : `${daysUntil(task.deadline)} hari`}
                      </span>
                    )}
                  </div>
                  <TaskSubtasks taskId={task.id} initialSubtasks={task.subtasks} />
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <TaskEditDialog task={task} />
                  <button
                    type="button"
                    onClick={() => void handleDelete(task.id)}
                    disabled={deleting === task.id}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-room-subtle hover:bg-peach-50 hover:text-peach-500 disabled:opacity-50"
                    title="Hapus tugas"
                    aria-label={`Hapus tugas ${task.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
              {actionErrors[task.id] && (
                <li role="alert" className="pl-8 text-xs font-semibold text-peach-600">
                  {actionErrors[task.id]}
                </li>
              )}
              </Fragment>
            );
          })}
        </ul>
      )}
    </RoomCard>
  );
}

function TaskSubtasks({ taskId, initialSubtasks }: {
  taskId: string;
  initialSubtasks: Task["subtasks"];
}) {
  const [subtasks, setSubtasks] = useState(initialSubtasks);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const toggle = async (id: string, done: boolean) => {
    setSubtasks((items) => items.map((item) => item.id === id ? { ...item, done: !done } : item));
    setError("");
    try {
      await toggleSubtask(id, !done);
    } catch {
      setSubtasks((items) => items.map((item) => item.id === id ? { ...item, done } : item));
      setError("Status sub-tugas gagal diperbarui.");
    }
  };

  const add = async () => {
    const title = draft.trim();
    if (!title) return;
    setSaving(true);
    setError("");
    try {
      const subtask = await createSubtask(taskId, title);
      setSubtasks((items) => [...items, subtask]);
      setDraft("");
    } catch {
      setError("Sub-tugas gagal ditambahkan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-2 space-y-1">
      {subtasks.map((subtask) => (
        <label key={subtask.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={subtask.done}
            onChange={() => void toggle(subtask.id, subtask.done)}
            className="h-3.5 w-3.5 shrink-0 accent-emerald-500"
            aria-label={`Tandai ${subtask.title} ${subtask.done ? "belum selesai" : "selesai"}`}
          />
          <span className={cn("text-xs font-medium", subtask.done ? "line-through text-room-subtle" : "text-room-muted")}>
            {subtask.title}
          </span>
        </label>
      ))}
      <div className="flex gap-2 pt-1">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void add(); } }}
          maxLength={120}
          placeholder="Tambah sub-tugas"
          aria-label="Nama sub-tugas baru"
          className="min-w-0 flex-1 rounded-lg border border-room-border bg-white px-2 py-1 text-xs text-room-text focus:border-cream-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void add()}
          disabled={saving || !draft.trim()}
          className="rounded-lg px-2 py-1 text-xs font-bold text-cream-700 hover:bg-cream-50 disabled:opacity-50"
        >
          {saving ? "..." : "Tambah"}
        </button>
      </div>
      {error && <p role="alert" className="text-[11px] font-semibold text-peach-600">{error}</p>}
    </div>
  );
}

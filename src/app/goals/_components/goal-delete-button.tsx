"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteGoal } from "@/lib/actions/goals";

export function GoalDeleteButton({ goalId, title }: { goalId: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const remove = async () => {
    if (!window.confirm(`Hapus goal "${title}" beserta riwayat progress dan catatannya?`)) return;
    setDeleting(true);
    setError("");
    try {
      await deleteGoal(goalId);
      router.refresh();
    } catch {
      setError("Goal gagal dihapus. Coba lagi.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={() => void remove()}
        disabled={deleting}
        aria-label={`Hapus goal ${title}`}
        title="Hapus goal"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-room-muted hover:bg-peach-50 hover:text-peach-500 disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
      {error && <span role="alert" className="max-w-40 text-right text-[10px] font-semibold text-peach-600">{error}</span>}
    </div>
  );
}

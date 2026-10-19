"use client";

import { useState } from "react";
import { CheckCircle2, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { logHabit } from "@/lib/actions/goals";

interface HabitButtonProps {
  goalId: string;
  habitToday: boolean;
}

export function HabitButton({ goalId, habitToday: initial }: HabitButtonProps) {
  const [done, setDone] = useState(initial);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (done || loading) return;
    setLoading(true);
    setDone(true);
    await logHabit(goalId).catch(() => setDone(false));
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={done || loading}
      className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all",
        done
          ? "bg-mint-100 border-mint-300 text-mint-500 cursor-default"
          : "bg-cream-50 border-room-border text-room-muted hover:border-mint-300 active:scale-95",
      )}
      title={done ? "Sudah selesai hari ini!" : "Tandai selesai hari ini"}
    >
      {done ? <CheckCircle2 size={18} /> : <Flame size={18} className="text-peach-400" />}
    </button>
  );
}

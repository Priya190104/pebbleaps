"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { toggleMilestone } from "@/lib/actions/goals";

interface MilestoneItemProps {
  id: string;
  title: string;
  done: boolean;
  deadline?: Date | string | null;
}

export function MilestoneItem({ id, title, done: initial, deadline }: MilestoneItemProps) {
  const [done, setDone] = useState(initial);

  const handleToggle = async () => {
    const next = !done;
    setDone(next);
    await toggleMilestone(id, next).catch(() => setDone(!next));
  };

  return (
    <li className="flex items-center gap-2.5">
      <button
        onClick={handleToggle}
        className={cn(
          "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
          done ? "bg-mint-300 border-mint-400" : "border-room-border hover:border-mint-300",
        )}
        title={done ? "Tandai belum selesai" : "Tandai selesai"}
      >
        {done && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
      </button>
      <div className="min-w-0 flex-1">
        <span className={cn("wrap-anywhere text-xs font-medium", done ? "line-through text-room-subtle" : "text-room-muted")}>
          {title}
        </span>
        {deadline && <time className="ml-2 text-[10px] font-semibold text-room-muted">{new Date(deadline).toLocaleDateString("id-ID", { dateStyle: "medium" })}</time>}
      </div>
    </li>
  );
}

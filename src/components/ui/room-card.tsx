import { cn } from "@/lib/utils";

interface RoomCardProps {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
  onClick?: () => void;
  interactive?: boolean;
}

export function RoomCard({ children, className, as: Tag = "div", onClick, interactive }: RoomCardProps) {
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "room-card p-5",
        interactive && "cursor-pointer",
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface RoomCardHeaderProps {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  accent?: "cream" | "sky" | "peach" | "mint";
}

const accentColors = {
  cream: "bg-cream-100 text-cream-700",
  sky: "bg-sky-100 text-sky-500",
  peach: "bg-peach-100 text-peach-500",
  mint: "bg-mint-100 text-mint-500",
};

export function RoomCardHeader({ icon, title, badge, action, accent = "cream" }: RoomCardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", accentColors[accent])}>
          {icon}
        </span>
        <span className="min-w-0 wrap-anywhere text-sm font-extrabold text-room-text">{title}</span>
        {badge !== undefined && badge !== null && <span className="shrink-0">{badge}</span>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface CountBadgeProps {
  count: number;
  variant?: "cream" | "peach" | "mint" | "sky";
}

const badgeVariants = {
  cream: "bg-cream-100 text-cream-700",
  peach: "bg-peach-100 text-peach-500",
  mint: "bg-mint-100 text-mint-500",
  sky: "bg-sky-100 text-sky-500",
};

export function CountBadge({ count, variant = "cream" }: CountBadgeProps) {
  return (
    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", badgeVariants[variant])}>
      {count}
    </span>
  );
}

interface ProgressBarProps {
  value: number; // 0–100
  color?: "cream" | "peach" | "mint" | "sky";
}

const progressColors = {
  cream: "from-cream-500 to-cream-300",
  peach: "from-peach-400 to-peach-200",
  mint: "from-mint-400 to-mint-200",
  sky: "from-sky-500 to-sky-300",
};

export function ProgressBar({ value, color = "cream" }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="progress-track">
      <div
        className={cn("progress-fill bg-linear-to-r", progressColors[color])}
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}

interface PriorityBadgeProps {
  priority: "tinggi" | "sedang" | "rendah";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const labels = { tinggi: "Tinggi", sedang: "Sedang", rendah: "Rendah" };
  const cls = { tinggi: "priority-high", sedang: "priority-medium", rendah: "priority-low" };
  return (
    <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-full", cls[priority])}>
      {labels[priority]}
    </span>
  );
}

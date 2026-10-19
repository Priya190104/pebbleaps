"use client";

import { getGreeting, formatDate } from "@/lib/utils";
import { PixelCat, PixelFlower, PixelStar } from "@/components/ui/pixel-icons";
import { Settings2 } from "lucide-react";
import Link from "next/link";
import { useRoom } from "@/providers/room-provider";
import { cn } from "@/lib/utils";
import type { Wallpaper } from "@/lib/types";

const wallpapers: { id: Wallpaper; label: string; bg: string; dot: string }[] = [
  { id: "dots",    label: "Polka",   bg: "#FFF9F2", dot: "#E8BE78" },
  { id: "gingham", label: "Garis",   bg: "#FFF9F2", dot: "#E8BE78" },
  { id: "stars",   label: "Bintang", bg: "#FFF9F2", dot: "#9A6428" },
  { id: "cloud",   label: "Awan",    bg: "#EFF8FF", dot: "#B4D4F0" },
  { id: "plain",   label: "Polos",   bg: "#FFF8EE", dot: "#F0D8B0" },
];

const wallpaperEmoji: Record<Wallpaper, string> = {
  dots: "🔵", gingham: "╱", stars: "✨", cloud: "☁️", plain: "▫️",
};

export function RoomHeader() {
  const greeting = getGreeting();
  const today = formatDate(new Date());
  const { wallpaper, setWallpaper, roomName, userName } = useRoom();

  return (
    <div className="relative mb-5">
      <header className="relative overflow-hidden rounded-2xl bg-linear-to-br from-cream-200 via-cream-100 to-sky-100 border-2 border-room-border p-5">
      {/* Decorative pixel elements */}
      <div className="absolute top-3 right-16 opacity-60 deco-float">
        <PixelStar size={16} />
      </div>
      <div className="absolute top-4 right-8 opacity-40 deco-float-slow">
        <PixelFlower size={14} />
      </div>
      <div className="absolute bottom-14 right-5 opacity-70">
        <PixelCat size={48} />
      </div>
      <div className="absolute top-2 left-40 opacity-30 deco-float-slow">
        <PixelStar size={12} />
      </div>

      <div className="relative z-10 pr-16">
        {/* Room name badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/60 backdrop-blur-sm rounded-full px-3 py-1 mb-3 border border-cream-200">
          <span className="text-cream-600 text-[11px] font-extrabold tracking-wide uppercase">
            🏠 {roomName}
          </span>
        </div>

        {/* Greeting */}
        <h1 className="text-room-text text-xl font-extrabold leading-tight mb-0.5">
          {greeting}, {userName}! 👋
        </h1>
        <p className="text-room-muted text-sm font-semibold capitalize mb-3">{today}</p>

        {/* Wallpaper quick-switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-room-muted uppercase tracking-wide mr-0.5">Wallpaper:</span>
          {wallpapers.map(w => (
            <button
              key={w.id}
              onClick={() => setWallpaper(w.id)}
              title={w.label}
              aria-label={`Wallpaper ${w.label}`}
              className={cn(
                "wallpaper-swatch w-7 h-7 rounded-full border-2 border-white/70 text-xs leading-none flex items-center justify-center",
                wallpaper === w.id ? "active" : "opacity-70 hover:opacity-100"
              )}
              style={{ background: w.bg }}
            >
              <span style={{ fontSize: "10px" }}>{wallpaperEmoji[w.id]}</span>
            </button>
          ))}
        </div>
      </div>
      </header>

      {/* settings shortcut outside overflow-hidden so it never gets clipped or covered */}
      <Link
        href="/settings"
        className="lg:hidden absolute top-3 right-3 z-20 w-8 h-8 rounded-xl bg-white/80 hover:bg-white flex items-center justify-center text-cream-500 shadow-sm transition-colors"
        title="Personalisasi Ruangan"
      >
        <Settings2 size={15} />
      </Link>
    </div>
  );
}

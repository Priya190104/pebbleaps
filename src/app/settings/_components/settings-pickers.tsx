"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { upsertRoomSettings } from "@/lib/actions/settings";
import { useRoom } from "@/providers/room-provider";
import type { Wallpaper, ThemeColor } from "@/lib/types";

const wallpapers: { id: Wallpaper; label: string; className: string }[] = [
  { id: "dots", label: "Polka Dot", className: "wallpaper-dots" },
  { id: "gingham", label: "Gingham", className: "wallpaper-gingham" },
  { id: "stars", label: "Bintang", className: "wallpaper-stars" },
  { id: "cloud", label: "Awan", className: "wallpaper-cloud" },
  { id: "plain", label: "Polos", className: "wallpaper-plain" },
];

const themes: { id: ThemeColor; label: string; swatch: string }[] = [
  { id: "cream", label: "Cream Hangat", swatch: "#9A6428" },
  { id: "sky", label: "Sky Blue", swatch: "#7AB2E0" },
  { id: "peach", label: "Peach", swatch: "#EDA882" },
  { id: "mint", label: "Mint", swatch: "#5CC090" },
  { id: "rose", label: "Rose", swatch: "#E8829A" },
];

export function SettingsPickers({ currentWallpaper, currentTheme }: {
  currentWallpaper: Wallpaper;
  currentTheme: ThemeColor;
}) {
  const [wallpaper, setWallpaper] = useState<Wallpaper>(currentWallpaper);
  const [theme, setTheme] = useState<ThemeColor>(currentTheme);
  const { setWallpaper: setRoomWallpaper, setThemeColor: setRoomTheme } = useRoom();

  const handleWallpaper = async (w: Wallpaper) => {
    setWallpaper(w);
    setRoomWallpaper(w);
    await upsertRoomSettings({ wallpaper: w });
  };

  const handleTheme = async (t: ThemeColor) => {
    setTheme(t);
    setRoomTheme(t);
    await upsertRoomSettings({ themeColor: t });
  };

  return (
    <>
      {/* Wallpaper picker */}
      <div className="grid grid-cols-5 gap-2">
        {wallpapers.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => handleWallpaper(w.id)}
            title={w.label}
            className={cn(
              "flex flex-col items-center gap-1.5 p-1 rounded-xl border-2 transition-all",
              wallpaper === w.id
                ? "border-cream-500 bg-cream-50"
                : "border-room-border hover:border-cream-300",
            )}
          >
            <div className={cn("w-full aspect-square rounded-lg", w.className)} />
            <span className="text-[10px] font-bold text-room-muted leading-none">{w.label}</span>
          </button>
        ))}
      </div>

      {/* Theme color picker */}
      <div className="flex gap-3 flex-wrap mt-4">
        {themes.map((t) => (
          <button key={t.id} type="button" onClick={() => handleTheme(t.id)} title={t.label}
            className="flex flex-col items-center gap-1.5">
            <span
              className={cn(
                "w-10 h-10 rounded-2xl border-4 transition-all",
                theme === t.id ? "border-room-text scale-110" : "border-transparent hover:scale-105",
              )}
              style={{ background: t.swatch }}
            />
            <span className="text-[10px] font-bold text-room-muted">{t.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

"use client";

import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { useRoom } from "@/providers/room-provider";
import { cn } from "@/lib/utils";

const wallpaperClass: Record<string, string> = {
  dots: "wallpaper-dots",
  gingham: "wallpaper-gingham",
  stars: "wallpaper-stars",
  cloud: "wallpaper-cloud",
  plain: "wallpaper-plain",
};

interface RoomShellProps {
  children: React.ReactNode;
}

export function RoomShell({ children }: RoomShellProps) {
  const { wallpaper } = useRoom();
  const wallpaperCls = wallpaperClass[wallpaper] ?? "wallpaper-dots";

  return (
    <div className="min-h-screen flex">
      <Sidebar />

      {/* Room canvas — wallpaper class reacts to user selection */}
      <main className={cn("min-h-screen min-w-0 flex-1", wallpaperCls)}>
        <div className="mx-auto w-full max-w-2xl min-w-0 px-4 pt-5 pb-24 lg:max-w-none lg:px-8 lg:pt-7 lg:pb-8">
          {children}
        </div>
        <BottomNav />
      </main>
    </div>
  );
}

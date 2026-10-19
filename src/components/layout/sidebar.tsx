"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PixelCat, PixelFlower } from "@/components/ui/pixel-icons";
import { cn } from "@/lib/utils";
import { useRoom } from "@/providers/room-provider";
import {
  Home, CheckSquare, Wallet, Target, Settings
} from "lucide-react";

const navLinks = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/queue", label: "Queue", icon: CheckSquare },
  { href: "/finance", label: "Keuangan", icon: Wallet },
  { href: "/goals", label: "Goal", icon: Target },
];

export function Sidebar() {
  const pathname = usePathname();
  const { roomName, userName } = useRoom();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white border-r-2 border-room-border overflow-y-auto">
      {/* Room identity */}
      <div className="p-5 border-b-2 border-room-border">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-cream-500 font-extrabold text-lg tracking-tight">🪨 Pebble</span>
        </div>
        <p className="text-room-muted text-xs font-semibold">{roomName}</p>
      </div>

      {/* Avatar + decorations */}
      <div className="px-5 py-4 flex items-center gap-3 border-b-2 border-room-border">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-cream-100 flex items-center justify-center overflow-hidden">
            <PixelCat size={40} />
          </div>
          <span className="absolute -bottom-1 -right-1 text-xs">✨</span>
        </div>
        <div>
          <p className="font-extrabold text-room-text text-sm">{userName}</p>
          <p className="text-room-muted text-xs font-medium">Penghuni aktif</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={cn("nav-item", active && "active")}>
              <Icon size={17} strokeWidth={2.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings + decoration */}
      <div className="p-3 border-t-2 border-room-border space-y-1">
        <Link
          href="/settings"
          className={cn("nav-item", pathname === "/settings" && "active")}
        >
          <Settings size={17} strokeWidth={2.5} />
          <span>Personalisasi</span>
        </Link>
        {/* Decorative flowers */}
        <div className="flex gap-2 px-2 pt-2 opacity-50">
          <PixelFlower size={14} />
          <PixelFlower size={14} />
          <PixelFlower size={14} />
        </div>
      </div>
    </aside>
  );
}

import { RoomShell } from "@/components/layout/room-shell";
import { RoomCard, RoomCardHeader } from "@/components/ui/room-card";
import { getRoomSettings } from "@/lib/actions/settings";
import { auth, signOut } from "@/lib/auth";
import { Palette, Smile, LogOut, Bell } from "lucide-react";
import type { Wallpaper, ThemeColor } from "@/lib/types";
import { SettingsPickers } from "./_components/settings-pickers";
import { SettingsIdentity } from "./_components/settings-identity";
import { PushSettings } from "./_components/push-settings";

export default async function SettingsPage() {
  const [settings, session] = await Promise.all([getRoomSettings(), auth()]);
  const current = {
    wallpaper: (settings?.wallpaper ?? "plain") as Wallpaper,
    themeColor: (settings?.themeColor ?? "cream") as ThemeColor,
  };

  return (
    <RoomShell>
      <div className="mb-5">
        <h1 className="text-room-text text-xl font-extrabold">Personalisasi Ruangan</h1>
        <p className="text-room-muted text-sm font-semibold">Buat ruanganmu terasa seperti milikmu</p>
      </div>

      {/* Identity — client component, auto-saves on blur */}
      <RoomCard className="mb-4">
        <RoomCardHeader icon={<Smile size={16} className="text-cream-500" />} title="Identitas Ruangan" accent="cream" />
        <SettingsIdentity />
      </RoomCard>

      {/* Wallpaper & tema — client component, saves instantly on pick */}
      <RoomCard className="mb-4">
        <RoomCardHeader icon={<Palette size={16} className="text-cream-500" />} title="Wallpaper & Tema" accent="cream" />
        <SettingsPickers currentWallpaper={current.wallpaper} currentTheme={current.themeColor} />
      </RoomCard>

      <RoomCard className="mb-4">
        <RoomCardHeader icon={<Bell size={16} className="text-peach-500" />} title="Pengingat Deadline" accent="peach" />
        <PushSettings />
      </RoomCard>

      {/* Account */}
      {session?.user && (
        <RoomCard>
          <RoomCardHeader icon={<LogOut size={16} className="text-room-muted" />} title="Akun" accent="cream" />
          <div className="flex items-center gap-3 mb-4">
            {session.user.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-10 h-10 rounded-2xl object-cover border-2 border-room-border" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-room-text truncate">{session.user.name}</p>
              <p className="text-xs font-semibold text-room-muted truncate">{session.user.email}</p>
            </div>
          </div>
          <form action={async () => { "use server"; await signOut({ redirectTo: "/login" }); }}>
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl border-2 border-peach-200 bg-peach-50 text-peach-600 text-sm font-bold hover:bg-peach-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} /> Keluar dari akun
            </button>
          </form>
        </RoomCard>
      )}
    </RoomShell>
  );
}

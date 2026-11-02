import Link from "next/link";
import { ArrowLeft, Users, Activity, LogIn, Repeat2, CalendarDays } from "lucide-react";
import { RoomShell } from "@/components/layout/room-shell";
import { RoomCard } from "@/components/ui/room-card";
import { getAdminAnalytics } from "@/lib/actions/admin-analytics";

export default async function AdminPage() {
  const analytics = await getAdminAnalytics();
  const maxDaily = Math.max(1, ...analytics.dailyTrend.flatMap((day) => [day.activeUsers, day.loginUsers]));
  const maxFeature = Math.max(1, ...analytics.featureUsage.map((feature) => feature.activeUsers));

  return (
    <RoomShell>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-room-text">Analitik aplikasi</h1>
          <p className="mt-1 text-sm font-semibold text-room-muted">
            Ringkasan penggunaan Pebble, tanpa membuka data pribadi pengguna.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-room-border bg-white px-3 text-sm font-bold text-room-text hover:bg-cream-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          Kembali
        </Link>
      </header>

      <RoomCard className="mb-4">
        <div className="grid grid-cols-2 divide-x divide-y divide-room-border sm:grid-cols-3 2xl:grid-cols-5 sm:divide-y-0">
          <Metric icon={<Users size={16} />} label="Pengguna terdaftar" value={analytics.registeredUsers} detail={`+${analytics.newUsers30d} dalam 30 hari`} />
          <Metric icon={<LogIn size={16} />} label="Login berhasil hari ini" value={analytics.loginsToday} detail="Pengguna unik" />
          <Metric icon={<Activity size={16} />} label="DAU · aktif hari ini" value={analytics.activeToday} detail="Membuka area aplikasi" />
          <Metric icon={<CalendarDays size={16} />} label="WAU · aktif 7 hari" value={analytics.active7d} detail="Pengguna unik" />
          <Metric icon={<Repeat2 size={16} />} label="MAU · aktif 30 hari" value={analytics.active30d} detail={`${analytics.returnRate30d}% kembali di hari berbeda`} />
        </div>
      </RoomCard>

      <RoomCard className="mb-4">
        <div className="mb-4">
          <h2 className="text-sm font-extrabold text-room-text">Login dan pengguna aktif · 14 hari</h2>
          <p className="mt-1 text-xs font-semibold text-room-muted">
            Pengguna aktif dihitung dari halaman fitur yang dibuka, terpisah dari event login.
          </p>
        </div>
        <div className="mb-3 flex flex-wrap gap-4 text-xs font-bold text-room-muted">
          <Legend color="bg-mint-500" label="Aktif" />
          <Legend color="bg-cream-500" label="Login" />
        </div>
        <div className="grid grid-cols-7 gap-x-2 gap-y-4 sm:grid-cols-14" role="list" aria-label="Grafik login dan pengguna aktif per hari">
          {analytics.dailyTrend.map((day) => (
            <div key={day.date} role="listitem" className="min-w-0 text-center" title={`${day.label}: ${day.activeUsers} aktif, ${day.loginUsers} login`}>
              <div className="flex h-28 items-end justify-center gap-1 border-b border-room-border pb-1">
                <div
                  role="img"
                  className="w-2.5 rounded-t bg-mint-500"
                  style={{ height: day.activeUsers ? `${Math.max(4, (day.activeUsers / maxDaily) * 100)}%` : "0%" }}
                  aria-label={`${day.activeUsers} pengguna aktif`}
                />
                <div
                  role="img"
                  className="w-2.5 rounded-t bg-cream-500"
                  style={{ height: day.loginUsers ? `${Math.max(4, (day.loginUsers / maxDaily) * 100)}%` : "0%" }}
                  aria-label={`${day.loginUsers} login`}
                />
              </div>
              <p className="mt-1 truncate text-[9px] font-bold text-room-muted">{day.label}</p>
            </div>
          ))}
        </div>
      </RoomCard>

      <RoomCard className="mb-4">
        <div className="mb-4">
          <h2 className="text-sm font-extrabold text-room-text">Penggunaan fitur · 30 hari</h2>
          <p className="mt-1 text-xs font-semibold text-room-muted">
            Jumlah pengguna unik yang membuka tiap area; satu pengguna dihitung sekali per fitur.
          </p>
        </div>
        {analytics.featureUsage.length ? (
          <ul className="space-y-4">
            {analytics.featureUsage.map((feature) => (
              <li key={feature.feature}>
                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-room-text">{feature.label}</span>
                  <span className="shrink-0 font-extrabold text-room-muted">{feature.activeUsers} pengguna</span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full bg-cream-100"
                  role="progressbar"
                  aria-label={`Pengguna aktif fitur ${feature.label}`}
                  aria-valuemin={0}
                  aria-valuemax={analytics.active30d}
                  aria-valuenow={feature.activeUsers}
                >
                  <div
                    className="h-full rounded-full bg-mint-500"
                    style={{ width: `${Math.round((feature.activeUsers / maxFeature) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-center text-sm font-semibold text-room-muted">
            Aktivitas fitur akan muncul setelah pengguna mulai memakai aplikasi.
          </p>
        )}
      </RoomCard>

      <p className="px-1 text-xs font-medium leading-relaxed text-room-muted">
        Data analitik mulai terkumpul setelah fitur ini dipasang. Aktivitas harian dicatat maksimal satu kali per area untuk setiap pengguna. Login lama tidak direkonstruksi.
      </p>
    </RoomShell>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <div className="min-w-0 px-3 py-3 first:pl-0 sm:px-4 sm:first:pl-0">
      <div className="mb-2 flex items-center gap-2 text-room-muted">
        {icon}
        <p className="truncate text-[10px] font-bold uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xl font-extrabold leading-tight text-room-text">{value.toLocaleString("id-ID")}</p>
      <p className="mt-1 text-[10px] font-semibold text-room-muted">{detail}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} aria-hidden="true" />
      {label}
    </span>
  );
}

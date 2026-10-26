import Link from "next/link";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "summary", label: "Ringkasan" },
  { id: "transactions", label: "Transaksi" },
  { id: "budget", label: "Anggaran" },
  { id: "wallets", label: "Kantong & Rekonsiliasi" },
  { id: "categories", label: "Kategori" },
] as const;

export type FinanceTab = (typeof tabs)[number]["id"];

export function FinanceSubnav({
  activeTab,
  query,
}: {
  activeTab: FinanceTab;
  query: string;
}) {
  return (
    <nav aria-label="Menu Keuangan" className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
      {tabs.map(({ id, label }) => {
        const active = activeTab === id;
        const params = new URLSearchParams(query);
        params.set("tab", id);
        return (
          <Link
            key={id}
            href={`/finance?${params.toString()}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-11 min-w-0 items-center justify-center rounded-xl border-2 px-2 py-2 text-center text-xs font-extrabold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400",
              active
                ? "border-cream-500 bg-cream-500 text-white"
                : "border-room-border bg-white text-room-muted hover:bg-cream-50",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, CheckSquare, Wallet, Target } from "lucide-react";
import { QuickAddAction } from "@/components/ui/quick-add-action";

const navLinks = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/queue", label: "Queue", icon: CheckSquare },
  { href: "/finance", label: "Keuangan", icon: Wallet },
  { href: "/goals", label: "Goal", icon: Target },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const renderLink = ({ href, label, icon: Icon }: (typeof navLinks)[number]) => {
    const active = href === "/finance"
      ? pathname.startsWith("/finance")
      : pathname === href;

    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn("mobile-nav-link", active && "active")}
      >
        <span className="mobile-nav-icon">
          <Icon size={17} strokeWidth={active ? 2.8 : 2} />
        </span>
        <span className="mobile-nav-label">{label}</span>
      </Link>
    );
  };

  return (
    <nav aria-label="Navigasi utama" className="mobile-bottom-nav lg:hidden">
      <div className="mobile-bottom-nav-inner">
        {renderLink(navLinks[0])}
        {renderLink(navLinks[1])}
        <QuickAddAction
          ariaLabel="Tambah tugas, transaksi, atau goal"
          className="mobile-add-action"
          label="Tambah"
          mobile
        />
        {renderLink(navLinks[2])}
        {renderLink(navLinks[3])}
      </div>
    </nav>
  );
}

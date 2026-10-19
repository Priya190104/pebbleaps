"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { getCategories, getWallets } from "@/lib/actions/finance";
import { QuickAddModal } from "@/components/ui/quick-add-modal";
import type { ModalCategory, ModalWallet } from "@/components/ui/quick-add-modal";

type Tab = "tugas" | "keuangan" | "goal";

interface QuickAddActionProps {
  defaultTab?: Tab;
  onlyTab?: Tab;
  label: string;
  ariaLabel: string;
  className: string;
  mobile?: boolean;
}

export function QuickAddAction({
  defaultTab = "tugas",
  onlyTab,
  label,
  ariaLabel,
  className,
  mobile = false,
}: QuickAddActionProps) {
  const [open, setOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [dataReady, setDataReady] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [categories, setCategories] = useState<ModalCategory[]>([]);
  const [wallets, setWallets] = useState<ModalWallet[]>([]);

  const handleOpen = async () => {
    setOpen(true);
    setLoadError("");
    if (loadingData) return;

    setDataReady(false);
    setLoadingData(true);
    try {
      const [nextCategories, nextWallets] = await Promise.all([getCategories(), getWallets()]);
      setCategories(nextCategories);
      setWallets(nextWallets);
    } catch {
      setCategories([]);
      setWallets([]);
      setLoadError("Kategori dan kantong gagal dimuat. Coba tutup lalu buka lagi.");
    } finally {
      setDataReady(true);
      setLoadingData(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={className}
        title={ariaLabel}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={loadingData}
      >
        <Plus size={mobile ? 25 : 19} strokeWidth={2.8} />
        {mobile
          ? <span className="mobile-add-label" aria-hidden="true">{label}</span>
          : <span>{loadingData ? "Memuat..." : label}</span>}
      </button>
      <QuickAddModal
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
        wallets={wallets}
        dataReady={dataReady}
        defaultTab={defaultTab}
        onlyTab={onlyTab}
        loadError={loadError}
      />
    </>
  );
}

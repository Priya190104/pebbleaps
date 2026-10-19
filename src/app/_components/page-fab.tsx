import { QuickAddAction } from "@/components/ui/quick-add-action";

type Tab = "tugas" | "keuangan" | "goal";

interface PageFabProps {
  defaultTab?: Tab;
  onlyTab?: Tab;
}

export function PageFab({ defaultTab = "tugas", onlyTab }: PageFabProps) {
  const tab = onlyTab ?? defaultTab;
  const label = tab === "keuangan" ? "Tambah transaksi" : tab === "goal" ? "Tambah goal" : "Tambah tugas";

  return (
    <QuickAddAction
      defaultTab={defaultTab}
      onlyTab={onlyTab}
      className="quick-add-trigger hidden lg:inline-flex"
      label={label}
      ariaLabel={label}
    />
  );
}

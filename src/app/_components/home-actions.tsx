import { QuickAddAction } from "@/components/ui/quick-add-action";

export function HomeActions() {
  return (
    <QuickAddAction
      className="quick-add-trigger quick-add-trigger-floating hidden lg:inline-flex"
      label="Tambah baru"
      ariaLabel="Tambah tugas, transaksi, atau goal"
    />
  );
}

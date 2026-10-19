"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { PixelCat, PixelFlower, PixelStar, PixelQueue, PixelCoin } from "@/components/ui/pixel-icons";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "pebble_welcomed";

export function WelcomeOverlay() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  };

  const goPersonalize = () => {
    dismiss();
    router.push("/settings");
  };

  return (
    <Dialog.Root open={open} onOpenChange={o => !o && dismiss()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 bg-cream-900/40 backdrop-blur-sm z-60" />

        <Dialog.Content
          className="modal-sheet fixed bottom-0 inset-x-0 z-61 rounded-t-[2rem] bg-white border-t-2 border-room-border
            lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:inset-x-auto
            lg:rounded-3xl lg:max-w-sm lg:w-full lg:border-2"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 lg:hidden">
            <div className="w-10 h-1 rounded-full bg-room-border" />
          </div>

          {/* Illustration zone */}
          <div className="mx-5 mt-3 rounded-2xl bg-linear-to-br from-cream-100 via-cream-50 to-sky-50 border-2 border-room-border p-6 flex items-center justify-center gap-4">
            <div className="deco-float-slow"><PixelFlower size={18} /></div>
            <PixelCat size={64} />
            <div className="flex flex-col gap-2">
              <div className="deco-float"><PixelStar size={14} /></div>
              <div className="deco-float-slow opacity-70"><PixelFlower size={12} /></div>
            </div>
          </div>

          {/* Copy */}
          <div className="px-5 pt-4 pb-2">
            <Dialog.Title className="text-room-text text-xl font-extrabold leading-tight mb-1">
              Selamat datang di ruanganmu! 🏠
            </Dialog.Title>
            <p className="text-room-muted text-sm font-semibold mb-4">
              Pebble adalah satu tempat untuk semua yang penting.
            </p>

            <ul className="space-y-2.5 mb-5">
              <FeatureItem
                icon={<PixelQueue size={16} />}
                color="cream"
                title="Tugas"
                desc="Atur prioritas, deadline, dan sub-tugas harianmu"
              />
              <FeatureItem
                icon={<PixelCoin size={16} />}
                color="peach"
                title="Keuangan"
                desc="Catat pengeluaran dan pantau budget bulananmu"
              />
              <FeatureItem
                icon={<PixelStar size={16} />}
                color="mint"
                title="Goal"
                desc="Tetapkan target dan pantau progress setiap hari"
              />
            </ul>
          </div>

          {/* Actions */}
          <div className="px-5 pb-6 space-y-2.5">
            <button
              onClick={goPersonalize}
              className="w-full py-3 rounded-2xl bg-cream-500 hover:bg-cream-600 text-white font-extrabold text-sm transition-colors flex items-center justify-center gap-2"
            >
              🎨 Personalisasi ruanganku dulu →
            </button>
            <button
              onClick={dismiss}
              className="w-full py-2.5 rounded-2xl border-2 border-room-border text-room-muted hover:bg-cream-50 hover:text-cream-700 font-bold text-sm transition-colors"
            >
              Sudah siap, langsung masuk!
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function FeatureItem({
  icon, color, title, desc,
}: {
  icon: React.ReactNode;
  color: "cream" | "peach" | "mint";
  title: string;
  desc: string;
}) {
  const bg = {
    cream: "bg-cream-100 text-cream-600",
    peach: "bg-peach-100 text-peach-500",
    mint: "bg-mint-100 text-mint-500",
  }[color];

  return (
    <li className="flex items-start gap-3">
      <span className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5", bg)}>
        {icon}
      </span>
      <div>
        <p className="text-room-text text-sm font-bold leading-tight">{title}</p>
        <p className="text-room-muted text-xs font-medium">{desc}</p>
      </div>
    </li>
  );
}

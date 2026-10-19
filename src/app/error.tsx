"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen wallpaper-plain flex items-center justify-center p-4">
      <div className="room-card p-8 max-w-sm w-full text-center">
        <p className="text-3xl mb-3">😵</p>
        <h2 className="text-room-text font-extrabold text-base mb-1">Ada yang salah</h2>
        <p className="text-room-muted text-sm font-semibold mb-5">
          Terjadi kesalahan saat memuat halaman ini.
        </p>
        <button
          onClick={reset}
          className="w-full py-3 rounded-2xl bg-cream-500 text-white font-extrabold text-sm hover:bg-cream-600 transition-colors"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}

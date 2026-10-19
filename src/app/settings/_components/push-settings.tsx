"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { registerPush, unregisterPush } from "@/lib/push";

export function PushSettings() {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    const readSubscription = async () => {
      const isSupported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!isSupported) {
        if (!cancelled) setSupported(false);
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!cancelled) {
          setSupported(true);
          setSubscribed(Boolean(subscription));
        }
      } catch {
        if (!cancelled) {
          setSupported(true);
          setMessage("Status notifikasi perangkat tidak dapat diperiksa.");
        }
      }
    };
    void readSubscription();
    return () => { cancelled = true; };
  }, []);

  const toggle = async () => {
    setBusy(true);
    setMessage("");
    try {
      if (subscribed) {
        await unregisterPush();
        setSubscribed(false);
        setMessage("Pengingat deadline dinonaktifkan di perangkat ini.");
      } else {
        await registerPush();
        setSubscribed(true);
        setMessage("Pengingat deadline aktif di perangkat ini.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pengaturan notifikasi gagal diperbarui.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-3 text-xs font-medium text-room-muted">
        Terima pengingat sehari sebelum deadline tugas pada perangkat ini. Notifikasi memerlukan izin browser, kunci VAPID, dan cron pengingat di server.
      </p>
      {supported === false ? (
        <p className="text-xs font-semibold text-room-muted">Browser ini belum mendukung notifikasi push.</p>
      ) : (
        <button
          type="button"
          onClick={toggle}
          disabled={busy || supported === null}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-room-border bg-cream-50 px-4 py-2.5 text-sm font-bold text-room-text transition-colors hover:bg-cream-100 disabled:cursor-wait disabled:opacity-60"
        >
          {subscribed ? <BellOff size={15} /> : <Bell size={15} />}
          {busy ? "Memperbarui..." : subscribed ? "Matikan pengingat di perangkat ini" : "Aktifkan pengingat deadline"}
        </button>
      )}
      {message && <p role="status" className="mt-2 text-xs font-semibold text-room-muted">{message}</p>}
    </div>
  );
}

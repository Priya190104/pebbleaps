"use client";

import { useState, useEffect } from "react";
import { useRoom } from "@/providers/room-provider";
import { Check } from "lucide-react";

export function SettingsIdentity() {
  const { roomName, setRoomName, userName, setUserName } = useRoom();
  const [localRoom, setLocalRoom] = useState(roomName);
  const [localUser, setLocalUser] = useState(userName);
  const [saved, setSaved] = useState(false);

  // Sync controlled inputs when context hydrates from localStorage/DB
  useEffect(() => { setLocalRoom(roomName); }, [roomName]);
  useEffect(() => { setLocalUser(userName); }, [userName]);

  const save = (field: "room" | "user") => {
    if (field === "room") {
      const v = localRoom.trim() || "Ruanganku";
      setLocalRoom(v);
      setRoomName(v);
    } else {
      const v = localUser.trim() || "Teman";
      setLocalUser(v);
      setUserName(v);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputCls =
    "w-full px-3 py-2.5 rounded-xl border-2 border-room-border bg-cream-50 text-room-text text-sm font-bold focus:outline-none focus:border-cream-400 transition-colors placeholder:text-room-subtle";
  const labelCls = "text-xs font-bold text-room-muted uppercase tracking-wide block mb-1.5";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelCls}>Nama Ruangan</label>
        <input
          type="text"
          value={localRoom}
          onChange={(e) => setLocalRoom(e.target.value)}
          onBlur={() => save("room")}
          onKeyDown={(e) => e.key === "Enter" && save("room")}
          className={inputCls}
          placeholder="Nama ruanganmu..."
        />
      </div>
      <div>
        <label className={labelCls}>Nama Kamu</label>
        <input
          type="text"
          value={localUser}
          onChange={(e) => setLocalUser(e.target.value)}
          onBlur={() => save("user")}
          onKeyDown={(e) => e.key === "Enter" && save("user")}
          className={inputCls}
          placeholder="Nama panggilanmu..."
        />
      </div>
      {saved && (
        <p className="flex items-center gap-1.5 text-xs font-bold text-mint-600">
          <Check size={12} /> Tersimpan otomatis
        </p>
      )}
    </div>
  );
}

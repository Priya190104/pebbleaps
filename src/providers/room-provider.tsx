"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Wallpaper, ThemeColor } from "@/lib/types";
import { getRoomSettings, upsertRoomSettings } from "@/lib/actions/settings";

interface RoomContextValue {
  wallpaper: Wallpaper;
  setWallpaper: (w: Wallpaper) => void;
  roomName: string;
  setRoomName: (n: string) => void;
  userName: string;
  setUserName: (n: string) => void;
  themeColor: ThemeColor;
  setThemeColor: (c: ThemeColor) => void;
}

const RoomContext = createContext<RoomContextValue>({
  wallpaper: "plain",
  setWallpaper: () => {},
  roomName: "Ruanganku",
  setRoomName: () => {},
  userName: "Teman",
  setUserName: () => {},
  themeColor: "cream",
  setThemeColor: () => {},
});

export function RoomProvider({ children }: { children: ReactNode }) {
  const [wallpaper, setWallpaperState] = useState<Wallpaper>("plain");
  const [roomName, setRoomNameState] = useState("Ruanganku");
  const [userName, setUserNameState] = useState("Teman");
  const [themeColor, setThemeColorState] = useState<ThemeColor>("cream");

  useEffect(() => {
    // localStorage first (instant), then sync from DB
    const localWp = localStorage.getItem("pebble_wallpaper") as Wallpaper | null;
    const localName = localStorage.getItem("pebble_room_name");
    const localUser = localStorage.getItem("pebble_user_name");
    const localTheme = localStorage.getItem("pebble_theme") as ThemeColor | null;
    if (localWp) setWallpaperState(localWp);
    if (localName) setRoomNameState(localName);
    if (localUser) setUserNameState(localUser);
    if (localTheme) {
      setThemeColorState(localTheme);
      document.documentElement.dataset.theme = localTheme;
    }

    getRoomSettings()
      .then((s) => {
        if (!s) return;
        if (!localWp) setWallpaperState(s.wallpaper as Wallpaper);
        if (!localName) setRoomNameState(s.roomName);
        if (!localUser) setUserNameState(s.userName);
        if (!localTheme && s.themeColor && s.themeColor !== "cream") {
          setThemeColorState(s.themeColor as ThemeColor);
          document.documentElement.dataset.theme = s.themeColor;
        }
      })
      .catch(() => {});
  }, []);

  const setWallpaper = (w: Wallpaper) => {
    setWallpaperState(w);
    localStorage.setItem("pebble_wallpaper", w);
    upsertRoomSettings({ wallpaper: w }).catch(() => {});
  };

  const setRoomName = (n: string) => {
    setRoomNameState(n);
    localStorage.setItem("pebble_room_name", n);
    upsertRoomSettings({ roomName: n }).catch(() => {});
  };

  const setUserName = (n: string) => {
    setUserNameState(n);
    localStorage.setItem("pebble_user_name", n);
    upsertRoomSettings({ userName: n }).catch(() => {});
  };

  const setThemeColor = (c: ThemeColor) => {
    setThemeColorState(c);
    localStorage.setItem("pebble_theme", c);
    document.documentElement.dataset.theme = c === "cream" ? "" : c;
    upsertRoomSettings({ themeColor: c }).catch(() => {});
  };

  return (
    <RoomContext.Provider value={{ wallpaper, setWallpaper, roomName, setRoomName, userName, setUserName, themeColor, setThemeColor }}>
      {children}
    </RoomContext.Provider>
  );
}

export const useRoom = () => useContext(RoomContext);


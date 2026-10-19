import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { RoomProvider } from "@/providers/room-provider";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Pebble — Queue, Keuangan & Goal",
  description: "Kelola tugas, keuangan, dan goal-mu dalam satu ruangan.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Pebble" },
};

export const viewport: Viewport = {
  themeColor: "#9A6428",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={nunito.variable}>
      <head>
      </head>
      <body className="antialiased" style={{ fontFamily: "var(--font-nunito), ui-rounded, system-ui, sans-serif" }}>
        <RoomProvider>{children}</RoomProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');`,
          }}
        />
      </body>
    </html>
  );
}

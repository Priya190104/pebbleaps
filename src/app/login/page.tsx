import { signIn } from "@/lib/auth";
import { PixelCat, PixelFlower, PixelStar } from "@/components/ui/pixel-icons";

export default function LoginPage() {
  return (
    <div className="min-h-screen wallpaper-plain flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-cream-100 border-2 border-cream-200 flex items-center justify-center">
                <PixelCat size={56} />
              </div>
              <div className="absolute -top-2 -right-2 deco-float">
                <PixelStar size={14} />
              </div>
              <div className="absolute -bottom-1 -left-3 deco-float-slow opacity-70">
                <PixelFlower size={12} />
              </div>
            </div>
            <div>
              <h1 className="text-room-text text-2xl font-extrabold tracking-tight">🪨 Pebble</h1>
              <p className="text-room-muted text-sm font-semibold mt-0.5">
                Ruang pribadimu untuk hal-hal penting
              </p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="room-card p-6 text-center">
          <h2 className="text-room-text text-base font-extrabold mb-1">Masuk ke ruanganmu</h2>
          <p className="text-room-muted text-sm font-semibold mb-6">
            Gunakan akun Google untuk mulai
          </p>

          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border-2 border-room-border bg-white hover:bg-cream-50 transition-colors font-bold text-room-text text-sm"
            >
              {/* Google logo */}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Masuk dengan Google
            </button>
          </form>

          <p className="mt-4 text-room-subtle text-xs font-semibold">
            Data kamu tersimpan aman dan hanya kamu yang bisa akses.
          </p>
        </div>

        <p className="text-center text-room-subtle text-xs font-semibold mt-6">
          Pebble · Personal Room for Daily Life
        </p>
      </div>
    </div>
  );
}

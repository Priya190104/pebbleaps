"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ValidationError } from "@/lib/validation";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function getRoomSettings() {
  const userId = await requireUser();
  return prisma.roomSettings.findUnique({ where: { userId } });
}

export async function upsertRoomSettings(data: unknown) {
  const userId = await requireUser();
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("Pengaturan ruangan tidak valid");
  }
  const input = data as Record<string, unknown>;
  const update: { roomName?: string; userName?: string; wallpaper?: string; themeColor?: string } = {};
  if (input.roomName !== undefined) {
    if (typeof input.roomName !== "string" || !input.roomName.trim() || input.roomName.trim().length > 80) {
      throw new ValidationError("Nama ruangan harus berisi 1–80 karakter");
    }
    update.roomName = input.roomName.trim();
  }
  if (input.userName !== undefined) {
    if (typeof input.userName !== "string" || !input.userName.trim() || input.userName.trim().length > 80) {
      throw new ValidationError("Nama pengguna harus berisi 1–80 karakter");
    }
    update.userName = input.userName.trim();
  }
  if (input.wallpaper !== undefined) {
    if (typeof input.wallpaper !== "string" ||
        !["dots", "gingham", "stars", "cloud", "plain"].includes(input.wallpaper)) {
      throw new ValidationError("Wallpaper tidak valid");
    }
    update.wallpaper = input.wallpaper;
  }
  if (input.themeColor !== undefined) {
    if (typeof input.themeColor !== "string" ||
        !["cream", "sky", "peach", "mint", "rose"].includes(input.themeColor)) {
      throw new ValidationError("Warna tema tidak valid");
    }
    update.themeColor = input.themeColor;
  }
  await prisma.roomSettings.upsert({
    where: { userId },
    update,
    create: {
      userId,
      roomName: update.roomName ?? "Ruanganku",
      userName: update.userName ?? "Teman",
      wallpaper: update.wallpaper ?? "plain",
      themeColor: update.themeColor ?? "cream",
    },
  });
  revalidatePath("/");
  revalidatePath("/settings");
}

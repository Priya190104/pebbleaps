"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function getGoals() {
  const userId = await requireUser();
  return prisma.goal.findMany({
    where: { userId },
    include: {
      milestones: true,
      habitLogs: { orderBy: { date: "desc" }, take: 30 },
      progressLogs: { orderBy: { createdAt: "desc" }, take: 180 },
      notes: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createGoal(data: {
  type: "angka" | "habit" | "milestone" | "bebas";
  title: string;
  description?: string;
  targetValue?: number;
  unit?: string;
  deadline?: Date;
  milestones?: { title: string; deadline?: Date }[];
}) {
  const userId = await requireUser();
  if (!data || typeof data !== "object" || typeof data.title !== "string") {
    throw new Error("Data goal tidak valid");
  }
  const title = data.title.trim();
  if (!title) throw new Error("Judul goal wajib diisi");
  if (title.length > 200) throw new Error("Judul goal maksimal 200 karakter");
  if (data.description !== undefined &&
      (typeof data.description !== "string" || data.description.trim().length > 1000)) {
    throw new Error("Deskripsi goal maksimal 1.000 karakter");
  }
  if (data.unit !== undefined &&
      (typeof data.unit !== "string" || data.unit.trim().length > 32)) {
    throw new Error("Satuan goal maksimal 32 karakter");
  }
  if (!["angka", "habit", "milestone", "bebas"].includes(data.type)) {
    throw new Error("Tipe goal tidak valid");
  }
  if (data.deadline && (!(data.deadline instanceof Date) || Number.isNaN(data.deadline.getTime()))) {
    throw new Error("Deadline goal tidak valid");
  }
  if (data.type === "angka" && (!Number.isFinite(data.targetValue) || (data.targetValue ?? 0) <= 0)) {
    throw new Error("Target goal harus lebih dari 0");
  }
  if (data.type === "milestone") {
    if (!Array.isArray(data.milestones) || data.milestones.length === 0) {
      throw new Error("Goal milestone membutuhkan setidaknya satu milestone");
    }
    if (data.milestones.length > 100) throw new Error("Maksimal 100 milestone per goal");
    if (data.milestones.some((milestone) =>
      !milestone || typeof milestone.title !== "string" || !milestone.title.trim() ||
      milestone.title.trim().length > 120 ||
      (milestone.deadline && (!(milestone.deadline instanceof Date) || Number.isNaN(milestone.deadline.getTime()))),
    )) {
      throw new Error("Judul atau deadline milestone tidak valid");
    }
  }

  const milestones = data.milestones;
  await prisma.goal.create({
    data: {
      userId,
      type: data.type,
      title,
      description: data.description?.trim() || undefined,
      targetValue: data.type === "angka" ? data.targetValue : undefined,
      unit: data.type === "angka" ? data.unit?.trim() || undefined : undefined,
      deadline: data.deadline,
      currentValue: data.type === "angka" ? 0 : undefined,
      progressLogs: data.type === "angka" ? { create: { value: 0 } } : undefined,
      milestones: milestones?.length
        ? {
            create: milestones.map((milestone) => ({
              title: milestone.title.trim(),
              deadline: milestone.deadline,
            })),
          }
        : undefined,
    },
  });
  revalidatePath("/");
  revalidatePath("/goals");
}

export async function updateGoalValue(id: string, currentValue: number) {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim() || !Number.isFinite(currentValue) || currentValue < 0) {
    throw new Error("Progress harus berupa angka 0 atau lebih");
  }
  await prisma.$transaction(async (tx) => {
    const goal = await tx.goal.findFirst({
      where: { id, userId, type: "angka" },
      select: { currentValue: true },
    });
    if (!goal) throw new Error("Goal tidak ditemukan");
    if (goal.currentValue === currentValue) return;
    await tx.goal.update({ where: { id }, data: { currentValue } });
    await tx.goalProgressLog.create({ data: { goalId: id, value: currentValue } });
  });
  revalidatePath("/");
  revalidatePath("/goals");
}

export async function logHabit(goalId: string) {
  const userId = await requireUser();
  if (typeof goalId !== "string" || !goalId.trim()) throw new Error("Goal tidak valid");
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId, type: "habit" } });
  if (!goal) throw new Error("Goal tidak ditemukan");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.habitLog.upsert({
    where: { goalId_date: { goalId, date: today } },
    update: { done: true },
    create: { goalId, date: today, done: true },
  });
  revalidatePath("/");
  revalidatePath("/goals");
}

export async function toggleMilestone(milestoneId: string, done: boolean) {
  const userId = await requireUser();
  if (typeof milestoneId !== "string" || !milestoneId.trim() || typeof done !== "boolean") {
    throw new Error("Milestone tidak valid");
  }
  const updated = await prisma.milestone.updateMany({
    where: { id: milestoneId, goal: { userId } },
    data: { done },
  });
  if (!updated.count) throw new Error("Milestone tidak ditemukan");
  revalidatePath("/");
  revalidatePath("/goals");
}

export async function addGoalNote(goalId: string, content: string) {
  const userId = await requireUser();
  if (typeof goalId !== "string" || !goalId.trim()) throw new Error("Goal tidak valid");
  if (typeof content !== "string") throw new Error("Catatan tidak valid");
  const noteContent = content.trim();
  if (!noteContent || noteContent.length > 1000) {
    throw new Error("Catatan harus berisi 1–1000 karakter");
  }
  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
  if (!goal) throw new Error("Goal tidak ditemukan");
  const note = await prisma.goalNote.create({ data: { goalId, content: noteContent } });
  revalidatePath("/");
  revalidatePath("/goals");
  return note;
}

export async function addMilestone(goalId: string, data: { title: string; deadline?: Date }) {
  const userId = await requireUser();
  if (typeof goalId !== "string" || !goalId.trim()) throw new Error("Goal tidak valid");
  if (!data || typeof data !== "object" || typeof data.title !== "string") {
    throw new Error("Data milestone tidak valid");
  }
  const title = data.title.trim();
  if (!title || title.length > 120) throw new Error("Judul milestone harus berisi 1–120 karakter");
  if (data.deadline && (!(data.deadline instanceof Date) || Number.isNaN(data.deadline.getTime()))) {
    throw new Error("Deadline milestone tidak valid");
  }

  const goal = await prisma.goal.findFirst({ where: { id: goalId, userId, type: "milestone" } });
  if (!goal) throw new Error("Goal milestone tidak ditemukan");

  const milestone = await prisma.milestone.create({
    data: { goalId, title, deadline: data.deadline },
  });
  revalidatePath("/");
  revalidatePath("/goals");
  return milestone;
}

export async function deleteGoal(goalId: string) {
  const userId = await requireUser();
  if (typeof goalId !== "string" || !goalId.trim()) throw new Error("Goal tidak valid");
  const deleted = await prisma.goal.deleteMany({ where: { id: goalId, userId } });
  if (!deleted.count) throw new Error("Goal tidak ditemukan");
  revalidatePath("/");
  revalidatePath("/goals");
}

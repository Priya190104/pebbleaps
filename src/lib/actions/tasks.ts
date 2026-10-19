"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ValidationError, validateTaskInput } from "@/lib/validation";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function getTasks() {
  const userId = await requireUser();
  return prisma.task.findMany({
    where: { userId },
    include: { subtasks: { orderBy: { id: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTaskCompletionEvents(days = 180) {
  const userId = await requireUser();
  const validDays = Number.isFinite(days) ? Math.min(365, Math.max(1, Math.floor(days))) : 180;
  const since = new Date();
  since.setDate(since.getDate() - validDays);
  return prisma.taskCompletionEvent.findMany({
    where: { task: { userId }, completedAt: { gte: since } },
    select: { completedAt: true },
    orderBy: { completedAt: "asc" },
  });
}

export async function createTask(data: unknown) {
  const userId = await requireUser();
  const task = validateTaskInput(data);

  await prisma.task.create({
    data: {
      userId,
      title: task.title,
      priority: task.priority,
      deadline: task.deadline,
      subtasks: task.subtasks.length
        ? { create: task.subtasks.map((title) => ({ title })) }
        : undefined,
    },
  });
  revalidatePath("/");
  revalidatePath("/queue");
}

export async function updateTask(id: string, data: unknown) {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim()) throw new ValidationError("Tugas tidak valid");
  const task = validateTaskInput(data);
  const updated = await prisma.task.updateMany({
    where: { id, userId },
    data: {
      title: task.title,
      priority: task.priority,
      deadline: task.deadline ?? null,
    },
  });
  if (!updated.count) throw new Error("Tugas tidak ditemukan");
  revalidatePath("/");
  revalidatePath("/queue");
}

export async function updateTaskStatus(id: string, status: "todo" | "progress" | "done") {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim()) throw new ValidationError("Tugas tidak valid");
  if (!["todo", "progress", "done"].includes(status)) throw new Error("Status tugas tidak valid");
  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({ where: { id, userId }, select: { status: true } });
    if (!task) throw new Error("Tugas tidak ditemukan");
    if (task.status === status) return;
    const changed = await tx.task.updateMany({
      where: { id, userId, status: task.status },
      data: { status, completedAt: status === "done" ? new Date() : null },
    });
    if (!changed.count) return;
    if (status === "done") {
      await tx.taskCompletionEvent.create({ data: { taskId: id } });
    }
  });
  revalidatePath("/");
  revalidatePath("/queue");
}

export async function deleteTask(id: string) {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim()) throw new ValidationError("Tugas tidak valid");
  const deleted = await prisma.task.deleteMany({ where: { id, userId } });
  if (!deleted.count) throw new Error("Tugas tidak ditemukan");
  revalidatePath("/");
  revalidatePath("/queue");
}

export async function toggleSubtask(subtaskId: string, done: boolean) {
  const userId = await requireUser();
  if (typeof subtaskId !== "string" || !subtaskId.trim() || typeof done !== "boolean") {
    throw new ValidationError("Status sub-tugas tidak valid");
  }
  const updated = await prisma.subTask.updateMany({
    where: { id: subtaskId, task: { userId } },
    data: { done },
  });
  if (!updated.count) throw new Error("Subtask tidak ditemukan");
  revalidatePath("/");
  revalidatePath("/queue");
}

export async function createSubtask(taskId: string, title: string) {
  const userId = await requireUser();
  if (typeof taskId !== "string" || !taskId.trim()) throw new ValidationError("Tugas tidak valid");
  if (typeof title !== "string") throw new Error("Nama sub-tugas tidak valid");
  const normalizedTitle = title.trim();
  if (!normalizedTitle || normalizedTitle.length > 120) {
    throw new Error("Sub-tugas harus berisi 1–120 karakter");
  }
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true, _count: { select: { subtasks: true } } },
  });
  if (!task) throw new Error("Tugas tidak ditemukan");
  if (task._count.subtasks >= 100) throw new ValidationError("Maksimal 100 sub-tugas per tugas");
  const subtask = await prisma.subTask.create({
    data: { taskId, title: normalizedTitle },
  });
  revalidatePath("/");
  revalidatePath("/queue");
  return subtask;
}

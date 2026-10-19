import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// POST /api/push/send — kirim reminder untuk task yang deadline besok
export async function POST(req: NextRequest) {
  const session = await auth();
  const cronSecret = process.env.CRON_SECRET;
  const cronAuthorized = Boolean(
    cronSecret && req.headers.get("authorization") === `Bearer ${cronSecret}`,
  );
  if (!session?.user?.id && !cronAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.VAPID_EMAIL || !process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: "VAPID belum dikonfigurasi" }, { status: 500 });
  }

  webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setUTCDate(dayAfter.getUTCDate() + 1);

  const tasks = await prisma.task.findMany({
    where: {
      ...(session?.user?.id && !cronAuthorized ? { userId: session.user.id } : {}),
      status: { not: "done" },
      deadline: { gte: tomorrow, lt: dayAfter },
    },
  });

  if (tasks.length === 0) return NextResponse.json({ sent: 0 });
  const taskUserIds = [...new Set(tasks.map((task) => task.userId))];

  const subs = await prisma.pushSubscription.findMany({
    where: { userId: { in: taskUserIds } },
  });
  const tasksByUser = new Map<string, typeof tasks>();
  for (const task of tasks) {
    const userTasks = tasksByUser.get(task.userId) ?? [];
    userTasks.push(task);
    tasksByUser.set(task.userId, userTasks);
  }

  let sent = 0;
  let failed = 0;
  let removed = 0;
  for (const sub of subs) {
    for (const task of tasksByUser.get(sub.userId) ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify({
            title: "⏰ Deadline besok!",
            body: task.title,
            url: "/queue",
          }),
        );
        sent++;
      } catch (error) {
        const statusCode = typeof error === "object" && error !== null && "statusCode" in error
          ? error.statusCode
          : undefined;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.deleteMany({
            where: { endpoint: sub.endpoint, userId: sub.userId },
          });
          removed++;
        } else {
          failed++;
          console.error("Push reminder gagal dikirim", { statusCode, userId: sub.userId });
        }
      }
    }
  }

  return NextResponse.json({ sent, failed, removed });
}

"use server";

import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { analyticsCalendarDate } from "@/lib/analytics-date";

const DAY_MS = 24 * 60 * 60 * 1000;
const FEATURE_LABELS: Record<string, string> = {
  home: "Beranda",
  queue: "Queue",
  finance: "Keuangan",
  goals: "Goal",
  settings: "Personalisasi",
};

export async function getAdminAnalytics() {
  await requireAdmin();
  const today = analyticsCalendarDate(new Date());
  const since7Days = new Date(today.getTime() - 6 * DAY_MS);
  const since30Days = new Date(today.getTime() - 29 * DAY_MS);
  const since14Days = new Date(today.getTime() - 13 * DAY_MS);
  const [registeredUsers, newUsers30d, activityRows, loginRows] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since30Days } } }),
    prisma.userActivity.findMany({
      where: { date: { gte: since30Days, lte: today } },
      select: { userId: true, feature: true, date: true },
    }),
    prisma.loginEvent.findMany({
      where: { loginDate: { gte: since14Days, lte: today } },
      select: { userId: true, loginDate: true },
    }),
  ]);

  const activityUsersByDay = new Map<string, Set<string>>();
  const activityDatesByUser = new Map<string, Set<string>>();
  const featureUsers = new Map<string, Set<string>>();
  for (const activity of activityRows) {
    const key = activity.date.toISOString().slice(0, 10);
    const dailyUsers = activityUsersByDay.get(key) ?? new Set<string>();
    dailyUsers.add(activity.userId);
    activityUsersByDay.set(key, dailyUsers);

    const activeDates = activityDatesByUser.get(activity.userId) ?? new Set<string>();
    activeDates.add(key);
    activityDatesByUser.set(activity.userId, activeDates);

    const users = featureUsers.get(activity.feature) ?? new Set<string>();
    users.add(activity.userId);
    featureUsers.set(activity.feature, users);
  }

  const loginUsersByDay = new Map<string, Set<string>>();
  for (const login of loginRows) {
    const key = login.loginDate.toISOString().slice(0, 10);
    const users = loginUsersByDay.get(key) ?? new Set<string>();
    users.add(login.userId);
    loginUsersByDay.set(key, users);
  }

  const activeToday = activityUsersByDay.get(today.toISOString().slice(0, 10))?.size ?? 0;
  const active7d = new Set(
    activityRows
      .filter((activity) => activity.date >= since7Days)
      .map((activity) => activity.userId),
  ).size;
  const active30d = new Set(activityRows.map((activity) => activity.userId)).size;
  const returningUsers30d = [...activityDatesByUser.values()].filter((dates) => dates.size >= 2).length;
  const loginsToday = loginUsersByDay.get(today.toISOString().slice(0, 10))?.size ?? 0;

  const dailyTrend = Array.from({ length: 14 }, (_, index) => {
    const date = new Date(today.getTime() - (13 - index) * DAY_MS);
    const key = date.toISOString().slice(0, 10);
    return {
      date: key,
      label: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "UTC" }).format(date),
      activeUsers: activityUsersByDay.get(key)?.size ?? 0,
      loginUsers: loginUsersByDay.get(key)?.size ?? 0,
    };
  });

  const featureUsage = [...featureUsers.entries()]
    .map(([feature, users]) => ({
      feature,
      label: FEATURE_LABELS[feature] ?? feature,
      activeUsers: users.size,
    }))
    .sort((a, b) => b.activeUsers - a.activeUsers);

  return {
    registeredUsers,
    newUsers30d,
    loginsToday,
    activeToday,
    active7d,
    active30d,
    returningUsers30d,
    returnRate30d: active30d ? Math.round((returningUsers30d / active30d) * 100) : 0,
    dailyTrend,
    featureUsage,
  };
}

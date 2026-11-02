"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ActivityFeature } from "@/lib/analytics-types";
import { analyticsCalendarDate } from "@/lib/analytics-date";

const FEATURES: ActivityFeature[] = ["home", "queue", "finance", "goals", "settings"];

export async function recordPageActivity(feature: ActivityFeature) {
  if (!FEATURES.includes(feature)) throw new Error("Area aktivitas tidak valid");
  const session = await auth();
  if (!session?.user?.id) return;

  const date = analyticsCalendarDate(new Date());
  try {
    await prisma.userActivity.upsert({
      where: {
        userId_feature_date: { userId: session.user.id, feature, date },
      },
      create: { userId: session.user.id, feature, date },
      update: {},
    });
  } catch (error) {
    console.error("Failed to record user activity", { feature, userId: session.user.id, error });
  }
}

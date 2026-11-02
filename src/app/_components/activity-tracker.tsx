"use client";

import { useEffect } from "react";
import { recordPageActivity } from "@/lib/actions/activity";
import type { ActivityFeature } from "@/lib/analytics-types";

export function ActivityTracker({ feature }: { feature: ActivityFeature }) {
  useEffect(() => {
    void recordPageActivity(feature).catch((error: unknown) => {
      console.error("Could not send activity event", error);
    });
  }, [feature]);

  return null;
}

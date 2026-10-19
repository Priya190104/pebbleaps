ALTER TABLE "Task" ADD COLUMN "completedAt" TIMESTAMP(3);

CREATE TABLE "TaskCompletionEvent" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskCompletionEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TaskCompletionEvent_taskId_completedAt_idx" ON "TaskCompletionEvent"("taskId", "completedAt");

ALTER TABLE "TaskCompletionEvent" ADD CONSTRAINT "TaskCompletionEvent_taskId_fkey"
    FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "GoalProgressLog" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoalProgressLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GoalProgressLog_goalId_createdAt_idx" ON "GoalProgressLog"("goalId", "createdAt");

ALTER TABLE "GoalProgressLog" ADD CONSTRAINT "GoalProgressLog_goalId_fkey"
    FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

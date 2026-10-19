import { RoomShell } from "@/components/layout/room-shell";
import { getTaskCompletionEvents, getTasks } from "@/lib/actions/tasks";
import { QueueTaskList } from "./_components/queue-task-list";
import { QueueAnalytics } from "./_components/queue-analytics";
import { PageFab } from "@/app/_components/page-fab";

type TaskItem = Awaited<ReturnType<typeof getTasks>>[number];

export default async function QueuePage() {
  const [tasks, completionEvents] = await Promise.all([getTasks(), getTaskCompletionEvents()]);
  const todo = tasks.filter((t: TaskItem) => t.status === "todo");
  const progress = tasks.filter((t: TaskItem) => t.status === "progress");
  const done = tasks.filter((t: TaskItem) => t.status === "done");

  return (
    <RoomShell>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-room-text text-xl font-extrabold">Queue Kegiatan</h1>
          <p className="text-room-muted text-sm font-semibold">
            {tasks.filter((t: TaskItem) => t.status !== "done").length} tugas aktif
          </p>
        </div>
        <PageFab defaultTab="tugas" />
      </div>

      <QueueAnalytics tasks={tasks} events={completionEvents} />
      <QueueTaskList todo={todo} progress={progress} done={done} />
    </RoomShell>
  );
}

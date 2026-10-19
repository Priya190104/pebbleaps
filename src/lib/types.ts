export type Priority = "tinggi" | "sedang" | "rendah";
export type TaskStatus = "todo" | "progress" | "done";
export type GoalType = "angka" | "habit" | "milestone" | "bebas";
export type TransactionType = "masuk" | "keluar";
export type Wallpaper = "dots" | "gingham" | "stars" | "cloud" | "plain";
export type ThemeColor = "cream" | "sky" | "peach" | "mint" | "rose";

export interface SubTask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  deadline?: Date;
  subtasks: SubTask[];
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  note: string;
  categoryId: string;
  date: Date;
}

export interface Budget {
  categoryId: string;
  amount: number;
  month: number; // 1–12
  year: number;
}

export interface Milestone {
  id: string;
  title: string;
  done: boolean;
  deadline?: Date;
}

export interface Goal {
  id: string;
  type: GoalType;
  title: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: Date;
  milestones: Milestone[];
  habitStreak?: number;
  habitToday?: boolean;
  notes: string[];
  createdAt: Date;
}

export interface RoomSettings {
  roomName: string;
  wallpaper: Wallpaper;
  themeColor: ThemeColor;
  userName: string;
}

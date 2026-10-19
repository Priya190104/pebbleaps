import type { Task, Transaction, Category, Budget, Goal, RoomSettings } from "./types";

export const mockRoomSettings: RoomSettings = {
  roomName: "Ruangan Pebble-ku",
  wallpaper: "dots",
  themeColor: "cream",
  userName: "Priya",
};

export const mockTasks: Task[] = [
  {
    id: "t1",
    title: "Selesaikan laporan bulanan",
    priority: "tinggi",
    status: "progress",
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    subtasks: [
      { id: "s1", title: "Kumpulkan data penjualan", done: true },
      { id: "s2", title: "Buat grafik perbandingan", done: false },
      { id: "s3", title: "Tulis ringkasan eksekutif", done: false },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "t2",
    title: "Beli bahan masak minggu ini",
    priority: "sedang",
    status: "todo",
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    subtasks: [
      { id: "s4", title: "Sayuran dan buah", done: false },
      { id: "s5", title: "Protein (ayam, telur)", done: false },
    ],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    id: "t3",
    title: "Jadwalkan olahraga pagi",
    priority: "rendah",
    status: "todo",
    subtasks: [],
    createdAt: new Date(),
  },
  {
    id: "t4",
    title: "Review kontrak freelance",
    priority: "tinggi",
    status: "todo",
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    subtasks: [
      { id: "s6", title: "Baca klausul pembayaran", done: false },
      { id: "s7", title: "Konsultasi pengacara", done: false },
    ],
    createdAt: new Date(),
  },
  {
    id: "t5",
    title: "Balas email klien",
    priority: "sedang",
    status: "done",
    subtasks: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

export const mockCategories: Category[] = [
  { id: "c1", name: "Makanan", color: "#F5C4A8", icon: "🍱" },
  { id: "c2", name: "Transport", color: "#B4D4F0", icon: "🚌" },
  { id: "c3", name: "Belanja", color: "#DDD0FF", icon: "🛍️" },
  { id: "c4", name: "Hiburan", color: "#B8EDD3", icon: "🎮" },
  { id: "c5", name: "Kesehatan", color: "#FFD9C4", icon: "💊" },
  { id: "c6", name: "Pendapatan", color: "#8ADAB5", icon: "💰" },
];

export const mockTransactions: Transaction[] = [
  { id: "tr1", type: "masuk", amount: 5000000, note: "Gaji bulanan", categoryId: "c6", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  { id: "tr2", type: "keluar", amount: 45000, note: "Makan siang", categoryId: "c1", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "tr3", type: "keluar", amount: 25000, note: "Ojek online", categoryId: "c2", date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: "tr4", type: "keluar", amount: 150000, note: "Belanja baju", categoryId: "c3", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: "tr5", type: "keluar", amount: 80000, note: "Dinner with friends", categoryId: "c1", date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  { id: "tr6", type: "masuk", amount: 750000, note: "Freelance project", categoryId: "c6", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: "tr7", type: "keluar", amount: 50000, note: "Nonton bioskop", categoryId: "c4", date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  { id: "tr8", type: "keluar", amount: 120000, note: "Obat vitamim", categoryId: "c5", date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
];

export const mockBudgets: Budget[] = [
  { categoryId: "c1", amount: 800000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { categoryId: "c2", amount: 400000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { categoryId: "c3", amount: 500000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { categoryId: "c4", amount: 300000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
  { categoryId: "c5", amount: 200000, month: new Date().getMonth() + 1, year: new Date().getFullYear() },
];

export const mockGoals: Goal[] = [
  {
    id: "g1",
    type: "angka",
    title: "Tabung Dana Darurat",
    description: "3x pengeluaran bulanan sebagai dana darurat",
    targetValue: 15000000,
    currentValue: 8750000,
    unit: "Rupiah",
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    milestones: [],
    notes: ["Bulan ini tambah Rp 500.000"],
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "g2",
    type: "habit",
    title: "Olahraga 30 Menit Setiap Hari",
    description: "Cardio atau strength training minimal 30 menit",
    habitStreak: 12,
    habitToday: false,
    milestones: [],
    notes: [],
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "g3",
    type: "milestone",
    title: "Luncurkan Produk Baru",
    description: "Dari ide ke MVP yang bisa dipakai",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    milestones: [
      { id: "m1", title: "Riset pasar selesai", done: true },
      { id: "m2", title: "Wireframe disetujui", done: true },
      { id: "m3", title: "Development sprint 1", done: false, deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
      { id: "m4", title: "Beta testing", done: false, deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000) },
    ],
    notes: ["Sprint 1 sudah dimulai hari ini"],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
];

/** Calculate running balance from all transactions */
export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) =>
    t.type === "masuk" ? acc + t.amount : acc - t.amount, 0
  );
}

/** Get total spending for a category this month */
export function getMonthlySpend(transactions: Transaction[], categoryId: string): number {
  const now = new Date();
  return transactions
    .filter(t =>
      t.type === "keluar" &&
      t.categoryId === categoryId &&
      t.date.getMonth() === now.getMonth() &&
      t.date.getFullYear() === now.getFullYear()
    )
    .reduce((acc, t) => acc + t.amount, 0);
}

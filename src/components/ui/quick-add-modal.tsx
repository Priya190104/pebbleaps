"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, CheckSquare, Wallet, Target, ChevronDown, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTask } from "@/lib/actions/tasks";
import { createTransaction } from "@/lib/actions/finance";
import { createGoal } from "@/lib/actions/goals";

type Tab = "tugas" | "keuangan" | "goal";
type GoalType = "angka" | "habit" | "milestone" | "bebas";
export type ModalCategory = { id: string; name: string; icon: string; forIncome?: boolean };
export type ModalWallet   = { id: string; name: string; icon: string };

const tabs: { id: Tab; label: string; icon: typeof CheckSquare }[] = [
  { id: "tugas", label: "Tugas", icon: CheckSquare },
  { id: "keuangan", label: "Keuangan", icon: Wallet },
  { id: "goal", label: "Goal", icon: Target },
];

const tabActive: Record<Tab, string> = {
  tugas: "bg-cream-500 text-white",
  keuangan: "bg-peach-400 text-white",
  goal: "bg-mint-400 text-white",
};

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
  defaultTab?: Tab;
  onlyTab?: Tab;
  categories?: ModalCategory[];
  wallets?: ModalWallet[];
  dataReady: boolean;
  loadError?: string;
}

export function QuickAddModal({ open, onClose, defaultTab = "tugas", onlyTab, categories = [], wallets = [], dataReady, loadError }: QuickAddModalProps) {
  const [tab, setTab] = useState<Tab>(onlyTab ?? defaultTab);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    if (!toastMessage) return;
    const timeout = window.setTimeout(() => setToastMessage(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  // Task fields
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("sedang");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskSubtasks, setTaskSubtasks] = useState<string[]>([]);
  const [taskSubtaskDraft, setTaskSubtaskDraft] = useState("");

  // Finance fields
  const [expType, setExpType] = useState<"masuk" | "keluar">("keluar");
  const [expAmount, setExpAmount] = useState("");
  const [expNote, setExpNote] = useState("");
  const [expCatId, setExpCatId] = useState("");
  const [expWalletId, setExpWalletId] = useState("");

  // Goal fields
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("bebas");
  const [goalDescription, setGoalDescription] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalUnit, setGoalUnit] = useState("");
  const [goalMilestones, setGoalMilestones] = useState<{ title: string; deadline: string }[]>([]);
  const [goalMilestoneDraft, setGoalMilestoneDraft] = useState("");
  const [goalMilestoneDeadline, setGoalMilestoneDeadline] = useState("");

  const reset = () => {
    setTaskTitle(""); setTaskPriority("sedang"); setTaskDeadline(""); setTaskSubtasks([]); setTaskSubtaskDraft("");
    setExpType("keluar"); setExpAmount(""); setExpNote(""); setExpCatId(""); setExpWalletId("");
    setGoalTitle(""); setGoalType("bebas"); setGoalDescription(""); setGoalDeadline(""); setGoalTarget(""); setGoalUnit("");
    setGoalMilestones([]); setGoalMilestoneDraft(""); setGoalMilestoneDeadline("");
    setError(""); setSaved(false); setToastMessage("");
  };

  const handleClose = () => { reset(); onClose(); };

  const addTaskSubtask = () => {
    const title = taskSubtaskDraft.trim();
    if (!title) return;
    if (title.length > 120) { setError("Sub-tugas maksimal 120 karakter"); return; }
    setTaskSubtasks((items) => [...items, title]);
    setTaskSubtaskDraft("");
    setError("");
  };

  const addGoalMilestone = () => {
    const title = goalMilestoneDraft.trim();
    if (!title) return;
    if (title.length > 120) { setError("Judul milestone maksimal 120 karakter"); return; }
    setGoalMilestones((items) => [...items, { title, deadline: goalMilestoneDeadline }]);
    setGoalMilestoneDraft("");
    setGoalMilestoneDeadline("");
    setError("");
  };

  const handleSave = async () => {
    if (saving || saved) return;
    setError("");
    if (tab === "keuangan" && !dataReady) {
      const message = "Kantong sedang dimuat. Tunggu sebentar lalu coba lagi.";
      setError(message);
      setToastMessage(message);
      return;
    }
    if (tab === "keuangan" && loadError) {
      setError(loadError);
      setToastMessage(loadError);
      return;
    }
    if (tab === "keuangan" && wallets.length === 0) {
      const message = "Buat minimal satu kantong di halaman Keuangan sebelum menambahkan transaksi.";
      setError(message);
      setToastMessage(message);
      return;
    }
    if (tab === "keuangan" && !expWalletId) {
      const message = "Pilih kantong sebelum menyimpan transaksi.";
      setError(message);
      setToastMessage(message);
      return;
    }
    setSaving(true);
    try {
      if (tab === "tugas") {
        if (!taskTitle.trim()) { setError("Judul tugas wajib diisi"); return; }
        await createTask({
          title: taskTitle.trim(),
          priority: taskPriority as "tinggi" | "sedang" | "rendah",
          deadline: taskDeadline ? new Date(taskDeadline) : undefined,
          subtasks: taskSubtasks,
        });
      } else if (tab === "keuangan") {
        const amount = Math.round(parseFloat(expAmount));
        if (!amount || amount <= 0) { setError("Jumlah harus lebih dari 0"); return; }
        // Income categories: forIncome === true; expense: forIncome === false; fallback by name
        const incomeCats = categories.filter((c) => c.forIncome);
        const expenseCats = categories.filter((c) => !c.forIncome);
        const fallbackIncome = incomeCats[0]?.id ?? categories.find((c) => c.name === "Pendapatan")?.id ?? categories[0]?.id ?? "";
        const fallbackExpense = expenseCats[0]?.id ?? categories[0]?.id ?? "";
        const catId = expCatId || (expType === "masuk" ? fallbackIncome : fallbackExpense);
        const result = await createTransaction({
          type: expType,
          amount,
          note: expNote || (expType === "masuk" ? "Pemasukan" : "Pengeluaran"),
          categoryId: catId,
          walletId: expWalletId,
        });
        if (!result.success) {
          setError(result.error);
          setToastMessage(result.error);
          return;
        }
      } else {
        if (!goalTitle.trim()) { setError("Judul goal wajib diisi"); return; }
        const targetValue = goalType === "angka" ? Number(goalTarget) : undefined;
        if (goalType === "angka" && (!Number.isFinite(targetValue) || (targetValue ?? 0) <= 0)) {
          setError("Masukkan target angka yang lebih besar dari 0");
          return;
        }
        if (goalType === "milestone" && goalMilestones.length === 0) {
          setError("Tambahkan setidaknya satu milestone");
          return;
        }
        await createGoal({
          type: goalType,
          title: goalTitle.trim(),
          description: goalDescription.trim() || undefined,
          targetValue,
          unit: goalType === "angka" ? goalUnit.trim() || undefined : undefined,
          deadline: goalDeadline ? new Date(goalDeadline) : undefined,
          milestones: goalType === "milestone"
            ? goalMilestones.map((milestone) => ({
                title: milestone.title,
                deadline: milestone.deadline ? new Date(milestone.deadline) : undefined,
              }))
            : undefined,
        });
      }
      setSaved(true);
      setTimeout(() => { reset(); onClose(); }, 800);
    } catch {
      const message = "Gagal menyimpan. Coba lagi.";
      setError(message);
      setToastMessage(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 bg-room-text/25 backdrop-blur-[2px] z-50" />
        {tab === "keuangan" && dataReady && !loadError && wallets.length === 0 && (
          <div
            role="alert"
            aria-live="assertive"
            className="fixed top-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-start gap-2.5 rounded-2xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm font-bold text-room-text shadow-lg"
          >
            <CircleAlert size={18} className="mt-0.5 shrink-0 text-peach-600" />
            <span>Buat minimal satu kantong di halaman Keuangan sebelum menambahkan transaksi.</span>
          </div>
        )}
        {toastMessage && (
          <div
            role="alert"
            aria-live="assertive"
            className="fixed top-4 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 items-start gap-2.5 rounded-2xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm font-bold text-room-text shadow-lg"
          >
            <CircleAlert size={18} className="mt-0.5 shrink-0 text-peach-600" />
            <span>{toastMessage}</span>
          </div>
        )}
        <Dialog.Content
          className="modal-sheet fixed bottom-0 inset-x-0 z-50 max-h-[90dvh] overflow-y-auto rounded-t-3xl bg-white border-t-2 border-room-border pb-safe
            lg:top-1/2 lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:inset-x-auto lg:max-h-[85vh] lg:rounded-2xl lg:max-w-md lg:w-full lg:border-2"
        >
          <div className="flex justify-center pt-3 pb-1 lg:hidden">
            <div className="w-10 h-1 rounded-full bg-room-border" />
          </div>
          <div className="flex items-center justify-between px-5 pt-3 pb-4 border-b border-room-border">
            <Dialog.Title className="text-room-text font-extrabold text-base">Tambah Baru</Dialog.Title>
            <Dialog.Close className="w-8 h-8 rounded-xl bg-cream-50 hover:bg-cream-100 flex items-center justify-center text-room-muted transition-colors">
              <X size={15} strokeWidth={2.5} />
            </Dialog.Close>
          </div>

          {loadError && <p role="alert" className="px-5 pt-3 text-xs font-semibold text-peach-600">{loadError}</p>}

          <div className="flex gap-2 px-5 pt-4">
            {(onlyTab ? tabs.filter((t) => t.id === onlyTab) : tabs).map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setError(""); }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all",
                    active ? tabActive[t.id] : "bg-cream-50 text-room-muted hover:bg-cream-100",
                  )}
                >
                  <Icon size={15} strokeWidth={2.5} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="px-5 pt-4 pb-5">
            {tab === "tugas" && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Judul Tugas</label>
                  <input className={inputCls} placeholder="Apa yang perlu dikerjakan?" autoFocus
                    value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Prioritas</label>
                    <div className="relative">
                      <select className={cn(inputCls, "appearance-none pr-8")} value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)}>
                        <option value="sedang">Sedang</option>
                        <option value="tinggi">Tinggi</option>
                        <option value="rendah">Rendah</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-room-muted pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Deadline</label>
                    <input type="date" className={inputCls} value={taskDeadline} onChange={(e) => setTaskDeadline(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Sub-tugas (opsional)</label>
                  <div className="flex gap-2">
                    <input
                      className={inputCls}
                      placeholder="Tambah langkah kecil"
                      value={taskSubtaskDraft}
                      onChange={(e) => setTaskSubtaskDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTaskSubtask(); } }}
                    />
                    <button type="button" onClick={addTaskSubtask} className="rounded-xl bg-cream-100 px-3 text-sm font-bold text-cream-700 hover:bg-cream-200">
                      Tambah
                    </button>
                  </div>
                  {taskSubtasks.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {taskSubtasks.map((subtask, index) => (
                        <li key={`${subtask}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-cream-50 px-3 py-2 text-xs font-semibold text-room-text">
                          <span>{subtask}</span>
                          <button type="button" onClick={() => setTaskSubtasks((items) => items.filter((_, i) => i !== index))} className="text-room-muted hover:text-peach-500" aria-label={`Hapus sub-tugas ${subtask}`}>×</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {tab === "keuangan" && (
              <div className="space-y-3">
                {!dataReady ? (
                  <p className="rounded-xl bg-cream-50 px-3 py-3 text-sm font-semibold text-room-muted" role="status">
                    Memuat kantong...
                  </p>
                ) : loadError ? (
                  <p className="rounded-xl bg-peach-50 px-3 py-3 text-sm font-semibold text-peach-600" role="alert">
                    {loadError}
                  </p>
                ) : wallets.length === 0 ? (
                  <p className="rounded-xl bg-cream-50 px-3 py-3 text-sm font-semibold text-room-muted">
                    Tutup formulir ini, lalu buat kantong di bagian Kantong Keuangan.
                  </p>
                ) : (
                  <>
                {/* Income / expense toggle */}
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setExpType("keluar"); setExpCatId(""); }}
                    className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                      expType === "keluar" ? "bg-peach-400 text-white border-peach-400" : "bg-cream-50 border-room-border text-room-muted hover:border-peach-300")}>
                    Pengeluaran
                  </button>
                  <button type="button" onClick={() => { setExpType("masuk"); setExpCatId(""); }}
                    className={cn("flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all",
                      expType === "masuk" ? "bg-mint-400 text-white border-mint-400" : "bg-cream-50 border-room-border text-room-muted hover:border-mint-300")}>
                    Pemasukan
                  </button>
                </div>
                <div>
                  <label className={labelCls}>Jumlah (Rp)</label>
                  <input type="number"
                    className={cn(inputCls, expType === "masuk" ? "focus:border-mint-400" : "focus:border-peach-400")}
                    placeholder="0" min={0} autoFocus
                    value={expAmount} onChange={(e) => setExpAmount(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Catatan</label>
                  <input
                    className={cn(inputCls, expType === "masuk" ? "focus:border-mint-400" : "focus:border-peach-400")}
                    placeholder={expType === "masuk" ? "Dari mana?" : "Beli apa?"}
                    value={expNote} onChange={(e) => setExpNote(e.target.value)} />
                </div>
                {/* Category chips — filtered by transaction type */}
                {(() => {
                  const visible = expType === "masuk"
                    ? (categories.filter((c) => c.forIncome).length > 0
                        ? categories.filter((c) => c.forIncome)
                        : categories.filter((c) => c.name === "Pendapatan"))
                    : categories.filter((c) => !c.forIncome);
                  if (!visible.length) return null;
                  const accent = expType === "masuk" ? { active: "border-mint-400 bg-mint-50 text-mint-600", hover: "hover:border-mint-300 hover:bg-mint-50" } : { active: "border-peach-400 bg-peach-50 text-peach-600", hover: "hover:border-peach-300 hover:bg-peach-50" };
                  return (
                    <div>
                      <label className={labelCls}>Kategori</label>
                      <div className="flex flex-wrap gap-2">
                        {visible.map((c) => (
                          <button key={c.id} type="button" onClick={() => setExpCatId(c.id)}
                            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-bold text-room-text transition-all",
                              expCatId === c.id ? accent.active : `border-room-border bg-cream-50 ${accent.hover}`)}>
                            <span>{c.icon}</span> {c.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                {/* Wallet selector */}
                <div>
                  <label className={labelCls}>Kantong (wajib)</label>
                  <div className="flex flex-wrap gap-2">
                    {wallets.map((w) => (
                      <button key={w.id} type="button" onClick={() => setExpWalletId(w.id)}
                        aria-pressed={expWalletId === w.id}
                        className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-xs font-bold text-room-text transition-all",
                          expWalletId === w.id
                            ? "border-cream-400 bg-cream-100 text-cream-700"
                            : "border-room-border bg-cream-50 hover:border-cream-300")}>
                        <span>{w.icon}</span> {w.name}
                      </button>
                    ))}
                  </div>
                </div>
                  </>
                )}
              </div>
            )}

            {tab === "goal" && (
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Judul Goal</label>
                  <input className={cn(inputCls, "focus:border-mint-400")} placeholder="Apa yang ingin dicapai?" autoFocus
                    value={goalTitle} onChange={(e) => setGoalTitle(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Deskripsi (opsional)</label>
                  <input className={cn(inputCls, "focus:border-mint-400")} placeholder="Ceritakan sedikit tentang goal ini"
                    value={goalDescription} onChange={(e) => setGoalDescription(e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Tipe Goal</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: "angka", label: "Target Angka", emoji: "🎯" },
                      { id: "habit", label: "Habit Harian", emoji: "🔥" },
                      { id: "milestone", label: "Milestone", emoji: "⭐" },
                      { id: "bebas", label: "Bebas", emoji: "📝" },
                    ] as { id: GoalType; label: string; emoji: string }[]).map((g) => (
                      <button key={g.id} type="button"
                        onClick={() => setGoalType(g.id)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold text-room-text transition-all",
                          goalType === g.id
                            ? "border-mint-400 bg-mint-50 text-mint-600"
                            : "border-room-border bg-cream-50 hover:border-mint-300 hover:bg-mint-50",
                        )}
                      >
                        <span>{g.emoji}</span> {g.label}
                      </button>
                    ))}
                  </div>
                </div>
                {goalType === "angka" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Target</label>
                      <input type="number" min="0.01" step="any" className={cn(inputCls, "focus:border-mint-400")}
                        placeholder="Contoh: 5000000" value={goalTarget} onChange={(e) => setGoalTarget(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls}>Satuan</label>
                      <input className={cn(inputCls, "focus:border-mint-400")} placeholder="Rupiah, buku, km..."
                        value={goalUnit} onChange={(e) => setGoalUnit(e.target.value)} />
                    </div>
                  </div>
                )}
                {goalType === "milestone" && (
                  <div>
                    <label className={labelCls}>Daftar milestone</label>
                    <div className="space-y-2">
                      <input className={cn(inputCls, "focus:border-mint-400")} placeholder="Nama milestone"
                        value={goalMilestoneDraft} onChange={(e) => setGoalMilestoneDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addGoalMilestone(); } }} />
                      <div className="flex gap-2">
                        <input type="date" className={cn(inputCls, "focus:border-mint-400")}
                          aria-label="Deadline milestone" value={goalMilestoneDeadline}
                          onChange={(e) => setGoalMilestoneDeadline(e.target.value)} />
                        <button type="button" onClick={addGoalMilestone} className="shrink-0 rounded-xl bg-mint-100 px-3 text-sm font-bold text-mint-700 hover:bg-mint-200">
                          Tambah
                        </button>
                      </div>
                      {goalMilestones.length > 0 && (
                        <ul className="space-y-1.5">
                          {goalMilestones.map((milestone, index) => (
                            <li key={`${milestone.title}-${index}`} className="flex items-center justify-between gap-2 rounded-lg bg-mint-50 px-3 py-2 text-xs font-semibold text-room-text">
                              <span>{milestone.title}{milestone.deadline ? ` · ${milestone.deadline}` : ""}</span>
                              <button type="button" onClick={() => setGoalMilestones((items) => items.filter((_, i) => i !== index))} className="text-room-muted hover:text-peach-500" aria-label={`Hapus milestone ${milestone.title}`}>×</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <label className={labelCls}>Deadline (opsional)</label>
                  <input type="date" className={cn(inputCls, "focus:border-mint-400")} value={goalDeadline} onChange={(e) => setGoalDeadline(e.target.value)} />
                </div>
              </div>
            )}

            {error && <p className="mt-2 text-xs font-bold text-peach-500">{error}</p>}

            <button
              onClick={handleSave}
              disabled={saving || saved || (tab === "keuangan" && (!dataReady || !!loadError || wallets.length === 0))}
              className={cn(
                "w-full mt-4 py-3 rounded-2xl font-extrabold text-sm transition-all disabled:opacity-70",
                saved ? "bg-mint-400 text-white"
                  : tab === "tugas" ? "bg-cream-500 hover:bg-cream-600 text-white"
                  : tab === "keuangan" ? (expType === "masuk" ? "bg-mint-400 hover:bg-mint-500 text-white" : "bg-peach-400 hover:bg-peach-500 text-white")
                  : "bg-mint-400 hover:bg-mint-500 text-white",
              )}
            >
              {saved ? "✓ Tersimpan!" : saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border-2 border-room-border bg-cream-50 text-room-text text-sm font-semibold focus:outline-none focus:border-cream-400 transition-colors placeholder:text-room-subtle";
const labelCls = "block text-xs font-bold text-room-muted uppercase tracking-wide mb-1.5";

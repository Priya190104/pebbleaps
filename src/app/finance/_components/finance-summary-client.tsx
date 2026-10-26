"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import type { FinancePeriod } from "./finance-period";

type Tx = { type: string; amount: number; date: Date | string };

const PERIOD_LABELS: Record<FinancePeriod, string> = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

const controlClass =
  "w-full rounded-xl border-2 border-room-border bg-white px-3 py-2 text-sm font-semibold text-room-text focus:border-cream-400 focus:outline-none focus:ring-2 focus:ring-cream-200";

function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function shiftDateKey(value: string, days: number): string {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function weekValue(date: Date): string {
  const value = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(value.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((value.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${value.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function weekRange(value: string): { start: string; end: string } {
  const [weekYear, week] = value.split("-W").map(Number);
  const jan4 = new Date(Date.UTC(weekYear, 0, 4));
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7) + (week - 1) * 7);
  const start = monday.toISOString().slice(0, 10);
  return { start, end: shiftDateKey(start, 6) };
}

function dateOffset(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).getTimezoneOffset();
}

function periodTitle(
  period: FinancePeriod,
  month: number,
  year: number,
  start: string,
  end: string,
): string {
  const formatDate = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  if (period === "daily") return start === end ? formatDate(start) : `${formatDate(start)} – ${formatDate(end)}`;
  if (period === "weekly") return `Minggu ${formatDate(start)} – ${formatDate(end)}`;
  if (period === "yearly") return `Tahun ${year}`;
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export function FinanceSummaryClient({
  transactions,
  period: initialPeriod,
  month: initialMonth,
  year: initialYear,
  fromKey: initialStart,
  throughKey: initialEnd,
  week: initialWeek,
  dateMode: initialDateMode,
}: {
  transactions: Tx[];
  period: FinancePeriod;
  month: number;
  year: number;
  fromKey: string;
  throughKey: string;
  week: string;
  dateMode: "date" | "range";
}) {
  const router = useRouter();
  const [period, setPeriod] = useState(initialPeriod);
  const [monthValue, setMonthValue] = useState(`${initialYear}-${String(initialMonth).padStart(2, "0")}`);
  const [yearValue, setYearValue] = useState(String(initialYear));
  const [week, setWeek] = useState(initialWeek || weekValue(new Date()));
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [dateMode, setDateMode] = useState(initialDateMode);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const nextStartOffset = String(dateOffset(initialStart));
    const nextEndOffset = String(dateOffset(shiftDateKey(initialEnd, 1)));
    if (
      url.searchParams.get("startOffset") !== nextStartOffset ||
      url.searchParams.get("endOffset") !== nextEndOffset
    ) {
      url.searchParams.set("startOffset", nextStartOffset);
      url.searchParams.set("endOffset", nextEndOffset);
      router.replace(`${url.pathname}?${url.searchParams.toString()}`, { scroll: false });
    }
  }, [router, initialPeriod, initialMonth, initialYear, initialStart, initialEnd, initialWeek, initialDateMode]);

  const totals = useMemo(() => {
    const totalIn = transactions
      .filter((transaction) => transaction.type === "masuk")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalOut = transactions
      .filter((transaction) => transaction.type === "keluar")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    return { totalIn, totalOut, balance: totalIn - totalOut };
  }, [transactions]);

  const applyFilter = (
    event?: FormEvent<HTMLFormElement>,
    nextPeriod = period,
    draft?: Partial<{
      start: string;
      end: string;
      dateMode: "date" | "range";
      week: string;
      monthValue: string;
      yearValue: string;
    }>,
  ) => {
    event?.preventDefault();
    setError("");

    let from = draft?.start ?? start;
    let through = draft?.end ?? end;
    const selectedDateMode = draft?.dateMode ?? dateMode;
    const selectedWeekValue = draft?.week ?? week;
    let selectedMonth = initialMonth;
    let selectedYear = initialYear;
    let selectedWeek = selectedWeekValue;

    if (nextPeriod === "daily") {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || (selectedDateMode === "range" && !/^\d{4}-\d{2}-\d{2}$/.test(through))) {
        setError("Pilih tanggal yang valid terlebih dahulu.");
        return;
      }
      through = selectedDateMode === "range" ? through : from;
      if (through < from) {
        setError("Tanggal akhir harus sama atau setelah tanggal awal.");
        return;
      }
      selectedYear = Number(from.slice(0, 4));
      selectedMonth = Number(from.slice(5, 7));
    } else if (nextPeriod === "weekly") {
      if (!/^\d{4}-W\d{2}$/.test(selectedWeekValue)) {
        setError("Pilih minggu yang valid terlebih dahulu.");
        return;
      }
      selectedWeek = selectedWeekValue;
      ({ start: from, end: through } = weekRange(selectedWeekValue));
      selectedYear = Number(from.slice(0, 4));
      selectedMonth = Number(from.slice(5, 7));
    } else if (nextPeriod === "monthly") {
      const match = (draft?.monthValue ?? monthValue).match(/^(\d{4})-(\d{2})$/);
      if (!match) {
        setError("Pilih bulan yang valid terlebih dahulu.");
        return;
      }
      selectedYear = Number(match[1]);
      selectedMonth = Number(match[2]);
      if (selectedMonth < 1 || selectedMonth > 12 || selectedYear < 2000 || selectedYear > 9999) {
        setError("Bulan yang dipilih tidak valid.");
        return;
      }
      from = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
      const lastDay = new Date(Date.UTC(selectedYear, selectedMonth, 0)).getUTCDate();
      through = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    } else {
      selectedYear = Number(draft?.yearValue ?? yearValue);
      if (!Number.isInteger(selectedYear) || selectedYear < 2000 || selectedYear > 9999) {
        setError("Tahun harus berada di antara 2000 dan 9999.");
        return;
      }
      from = `${selectedYear}-01-01`;
      through = `${selectedYear}-12-31`;
    }

    const url = new URL(window.location.href);
    const query = url.searchParams;
    query.set("period", nextPeriod);
    query.set("month", String(selectedMonth));
    query.set("year", String(selectedYear));
    query.set("startOffset", String(dateOffset(from)));
    query.set("endOffset", String(dateOffset(shiftDateKey(through, 1))));
    query.set("start", from);
    query.set("end", through);
    if (nextPeriod === "weekly") query.set("week", selectedWeek);
    else query.delete("week");
    if (nextPeriod === "daily") query.set("dateMode", selectedDateMode);
    else query.delete("dateMode");
    router.replace(`${url.pathname}?${query.toString()}`, { scroll: false });
  };

  const selectPeriod = (nextPeriod: FinancePeriod) => {
    setPeriod(nextPeriod);
    if (nextPeriod === "daily") {
      const today = localDateKey(new Date());
      setStart(today);
      setEnd(today);
      setDateMode("date");
      applyFilter(undefined, nextPeriod, { start: today, end: today, dateMode: "date" });
      return;
    }
    if (nextPeriod === "weekly") {
      const currentWeek = weekValue(new Date());
      setWeek(currentWeek);
      applyFilter(undefined, nextPeriod, { week: currentWeek });
      return;
    }
    if (nextPeriod === "monthly") {
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      setMonthValue(currentMonth);
      applyFilter(undefined, nextPeriod, { monthValue: currentMonth });
      return;
    }
    const currentYear = String(new Date().getFullYear());
    setYearValue(currentYear);
    applyFilter(undefined, nextPeriod, { yearValue: currentYear });
  };

  const title = periodTitle(period, initialMonth, initialYear, initialStart, initialEnd);

  return (
    <section className="room-card mb-4 p-5">
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl bg-cream-100 p-1 sm:grid-cols-4">
        {(Object.keys(PERIOD_LABELS) as FinancePeriod[]).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={period === option}
            onClick={() => selectPeriod(option)}
            className={cn(
              "min-h-10 rounded-lg px-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400",
              period === option
                ? "bg-cream-500 text-white shadow-sm"
                : "text-room-muted hover:text-room-text",
            )}
          >
            {PERIOD_LABELS[option]}
          </button>
        ))}
      </div>

      <form onSubmit={(event) => applyFilter(event)} className="mb-5">
        <div className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
          {period === "daily" && (
            <>
              <label className="text-xs font-bold text-room-muted">
                Pilih tanggal
                <select
                  value={dateMode}
                  onChange={(event) => setDateMode(event.target.value as "date" | "range")}
                  className={`${controlClass} mt-1`}
                >
                  <option value="date">Satu tanggal</option>
                  <option value="range">Rentang tanggal</option>
                </select>
              </label>
              <div className="grid grid-cols-1 gap-2 sm:col-span-2 sm:grid-cols-2">
                <label className="text-xs font-bold text-room-muted">
                  {dateMode === "range" ? "Dari tanggal" : "Tanggal"}
                  <input
                    type="date"
                    value={start}
                    onChange={(event) => setStart(event.target.value)}
                    className={`${controlClass} mt-1`}
                  />
                </label>
                {dateMode === "range" && (
                  <label className="text-xs font-bold text-room-muted">
                    Sampai tanggal
                    <input
                      type="date"
                      value={end}
                      min={start}
                      onChange={(event) => setEnd(event.target.value)}
                      className={`${controlClass} mt-1`}
                    />
                  </label>
                )}
              </div>
            </>
          )}
          {period === "weekly" && (
            <label className="text-xs font-bold text-room-muted">
              Pilih minggu (Senin–Minggu)
              <input
                type="week"
                value={week}
                onChange={(event) => setWeek(event.target.value)}
                className={`${controlClass} mt-1`}
              />
            </label>
          )}
          {period === "monthly" && (
            <label className="text-xs font-bold text-room-muted">
              Pilih bulan
              <input
                type="month"
                min="2000-01"
                max="9999-12"
                value={monthValue}
                onChange={(event) => setMonthValue(event.target.value)}
                className={`${controlClass} mt-1`}
              />
            </label>
          )}
          {period === "yearly" && (
            <label className="text-xs font-bold text-room-muted">
              Pilih tahun
              <input
                type="number"
                min={2000}
                max={9999}
                value={yearValue}
                onChange={(event) => setYearValue(event.target.value)}
                className={`${controlClass} mt-1`}
              />
            </label>
          )}
          <button
            type="submit"
            className="min-h-10 rounded-xl bg-cream-500 px-4 py-2 text-xs font-extrabold text-white transition-colors hover:bg-cream-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream-400"
          >
            Terapkan filter
          </button>
        </div>
        {error && <p role="alert" className="mt-2 text-xs font-semibold text-peach-600">{error}</p>}
      </form>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-peach-100">
          <Wallet size={18} className="text-peach-500" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-room-muted">{title}</p>
          <p className={cn("wrap-break-word text-2xl font-extrabold leading-tight", totals.balance < 0 && "text-peach-500")}>
            {formatRupiah(totals.balance)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0 rounded-xl border border-mint-200 bg-mint-50 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <TrendingUp size={13} className="text-mint-500" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-mint-600">Masuk</span>
          </div>
          <p className="wrap-break-word text-sm font-extrabold text-room-text sm:text-base">{formatRupiah(totals.totalIn)}</p>
        </div>
        <div className="min-w-0 rounded-xl border border-peach-200 bg-peach-50 p-3">
          <div className="mb-1 flex items-center gap-1.5">
            <TrendingDown size={13} className="text-peach-500" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-peach-600">Keluar</span>
          </div>
          <p className="wrap-break-word text-sm font-extrabold text-room-text sm:text-base">{formatRupiah(totals.totalOut)}</p>
        </div>
      </div>
    </section>
  );
}

export type FinancePeriod = "daily" | "weekly" | "monthly" | "yearly";

type SearchParams = Record<string, string | string[] | undefined>;

export interface FinanceFilter {
  period: FinancePeriod;
  month: number;
  year: number;
  budgetMonth: number;
  budgetYear: number;
  fromKey: string;
  throughKey: string;
  startOffset: number;
  endOffset: number;
  start: Date;
  end: Date;
  week: string;
  dateMode: "date" | "range";
}

function param(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isDateKey(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function boundedInteger(value: string | undefined, min: number, max: number): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= min && parsed <= max ? parsed : undefined;
}

function validOffset(value: string | undefined): number | undefined {
  if (!value || !/^-?\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= -840 && parsed <= 840 ? parsed : undefined;
}

function shiftDateKey(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function isoWeekRange(value: string | undefined): { week: string; fromKey: string; throughKey: string } | undefined {
  const match = value?.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const weekNumber = Number(match[2]);
  if (year < 2000 || year > 9999 || weekNumber < 1 || weekNumber > 53) return undefined;

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - ((jan4.getUTCDay() + 6) % 7) + (weekNumber - 1) * 7);
  const fromKey = monday.toISOString().slice(0, 10);
  const thursday = new Date(monday);
  thursday.setUTCDate(thursday.getUTCDate() + 3);
  if (thursday.getUTCFullYear() !== year) return undefined;

  return {
    week: value!,
    fromKey,
    throughKey: shiftDateKey(fromKey, 6),
  };
}

function timezoneOffset(value: string, provided: string | undefined): number {
  return validOffset(provided) ?? new Date(`${value}T00:00:00`).getTimezoneOffset();
}

function localRange(fromKey: string, throughKey: string, startOffset: number, endOffset: number) {
  const start = new Date(`${fromKey}T00:00:00.000Z`);
  start.setUTCMinutes(start.getUTCMinutes() + startOffset);
  const end = new Date(`${shiftDateKey(throughKey, 1)}T00:00:00.000Z`);
  end.setUTCMinutes(end.getUTCMinutes() + endOffset);
  return { start, end };
}

export function resolveFinanceFilter(params: SearchParams, now = new Date()): FinanceFilter {
  const requestedPeriod = param(params, "period");
  const period: FinancePeriod =
    requestedPeriod === "daily" || requestedPeriod === "weekly" ||
    requestedPeriod === "yearly" || requestedPeriod === "monthly"
      ? requestedPeriod
      : "monthly";
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const month = boundedInteger(param(params, "month"), 1, 12) ?? currentMonth;
  const year = boundedInteger(param(params, "year"), 2000, 9999) ?? currentYear;
  let fromKey: string;
  let throughKey: string;
  let week = "";
  let dateMode: "date" | "range" = param(params, "dateMode") === "range" ? "range" : "date";

  if (period === "daily") {
    const from = param(params, "start");
    const through = param(params, "end");
    fromKey = isDateKey(from) ? from : dateKey(currentYear, currentMonth, now.getDate());
    throughKey = dateMode === "range" && isDateKey(through) && through >= fromKey ? through : fromKey;
    if (throughKey === fromKey) dateMode = "date";
  } else if (period === "weekly") {
    const selectedWeek = isoWeekRange(param(params, "week"));
    const today = dateKey(currentYear, currentMonth, now.getDate());
    const fallbackWeek = isoWeekRange(weekForDate(today))!;
    const selected = selectedWeek ?? fallbackWeek;
    ({ fromKey, throughKey, week } = selected);
  } else if (period === "monthly") {
    fromKey = dateKey(year, month, 1);
    throughKey = dateKey(year, month, new Date(Date.UTC(year, month, 0)).getUTCDate());
  } else {
    fromKey = dateKey(year, 1, 1);
    throughKey = dateKey(year, 12, 31);
  }

  const budgetMonth = period === "yearly" ? month : Number(fromKey.slice(5, 7));
  const budgetYear = period === "yearly" ? year : Number(fromKey.slice(0, 4));
  const nextKey = shiftDateKey(throughKey, 1);
  const startOffset = timezoneOffset(fromKey, param(params, "startOffset"));
  const endOffset = timezoneOffset(nextKey, param(params, "endOffset"));
  const { start, end } = localRange(fromKey, throughKey, startOffset, endOffset);

  return {
    period,
    month,
    year,
    budgetMonth,
    budgetYear,
    fromKey,
    throughKey,
    startOffset,
    endOffset,
    start,
    end,
    week,
    dateMode,
  };
}

function weekForDate(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function financeFilterQuery(params: SearchParams, filter: FinanceFilter): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string" && key !== "tab" && key !== "budgetMonth" && key !== "budgetYear") query.set(key, value);
  }
  query.set("period", filter.period);
  query.set("month", String(filter.month));
  query.set("year", String(filter.year));
  query.set("start", filter.fromKey);
  query.set("end", filter.throughKey);
  query.set("startOffset", String(filter.startOffset));
  query.set("endOffset", String(filter.endOffset));
  if (filter.period === "weekly") query.set("week", filter.week);
  else query.delete("week");
  if (filter.period === "daily") query.set("dateMode", filter.dateMode);
  else query.delete("dateMode");
  return query.toString();
}

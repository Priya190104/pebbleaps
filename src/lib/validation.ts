export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

const MAX_DATABASE_INTEGER = 2_147_483_647;
const TASK_PRIORITY = ["tinggi", "sedang", "rendah"] as const;

function requireObject(value: unknown, message: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError(message);
  }
  return value as Record<string, unknown>;
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeChoice(value: unknown, allowed: readonly string[]) {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;
  const lowered = normalized.toLowerCase();
  return allowed.includes(lowered) ? lowered : undefined;
}

function validateOptionalDate(value: unknown, label: string): Date | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "string") {
    const normalized = value.trim();
    if (!normalized) return undefined;
    value = normalized;
  }
  if (!(value instanceof Date) && typeof value !== "string") {
    throw new ValidationError(`${label} tidak valid`);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new ValidationError(`${label} tidak valid`);
  return date;
}

export function validateTaskInput(value: unknown) {
  const data = requireObject(value, "Data tugas tidak valid");
  if (typeof data.title !== "string") throw new ValidationError("Judul tugas wajib diisi");
  const title = data.title.trim();
  if (!title) throw new ValidationError("Judul tugas wajib diisi");
  if (title.length > 200) throw new ValidationError("Judul tugas maksimal 200 karakter");

  const priority = normalizeChoice(data.priority, TASK_PRIORITY);
  if (!priority) throw new ValidationError("Prioritas tidak valid");

  if (data.subtasks !== undefined && (
    !Array.isArray(data.subtasks) || data.subtasks.some((subtask) => typeof subtask !== "string")
  )) {
    throw new ValidationError("Daftar sub-tugas tidak valid");
  }

  const subtasks = (data.subtasks as string[] | undefined)?.map((item) => item.trim()).filter(Boolean) ?? [];
  if (subtasks.length > 100) throw new ValidationError("Maksimal 100 sub-tugas per tugas");
  if (subtasks.some((item) => item.length > 120)) {
    throw new ValidationError("Sub-tugas maksimal 120 karakter");
  }

  return {
    title,
    priority: priority as "tinggi" | "sedang" | "rendah",
    deadline: validateOptionalDate(data.deadline, "Deadline tugas"),
    subtasks,
  };
}

export function validateTransactionInput(value: unknown) {
  const data = requireObject(value, "Data transaksi tidak valid");
  const type = normalizeChoice(data.type, ["masuk", "keluar"]);
  if (!type) {
    throw new ValidationError("Jenis transaksi tidak valid");
  }
  if (!Number.isSafeInteger(data.amount) || (data.amount as number) <= 0 ||
      (data.amount as number) > MAX_DATABASE_INTEGER) {
    throw new ValidationError("Jumlah transaksi harus berupa angka bulat yang valid");
  }
  if (typeof data.note !== "string") throw new ValidationError("Catatan transaksi tidak valid");
  const note = data.note.trim();
  if (!note || note.length > 200) {
    throw new ValidationError("Catatan transaksi harus berisi 1–200 karakter");
  }
  if (typeof data.categoryId !== "string" || !data.categoryId.trim()) {
    throw new ValidationError("Pilih kategori transaksi");
  }
  if (typeof data.walletId !== "string" || !data.walletId.trim()) {
    throw new ValidationError("Pilih kantong sebelum menyimpan transaksi");
  }

  return {
    type: type as "masuk" | "keluar",
    amount: data.amount as number,
    note,
    categoryId: data.categoryId.trim(),
    walletId: data.walletId.trim(),
    date: validateOptionalDate(data.date, "Tanggal transaksi") ?? new Date(),
  };
}

export function validateWalletBalance(value: unknown) {
  if (!Number.isSafeInteger(value) || (value as number) < 0 ||
      (value as number) > MAX_DATABASE_INTEGER) {
    throw new ValidationError("Saldo harus berupa angka bulat 0 atau lebih");
  }
  return value as number;
}

function isTimezoneOffset(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= -840 && value <= 840;
}

export function getLocalCalendarDayRange(
  value: unknown,
  timezoneOffsetMinutes: unknown,
  nextDayTimezoneOffsetMinutes: unknown,
) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new ValidationError("Tanggal laporan tidak valid");
  }
  const year = Number(value.slice(0, 4));
  const statementDate = new Date(`${value}T00:00:00.000Z`);
  if (year < 1 || year > 9999 ||
      Number.isNaN(statementDate.getTime()) ||
      statementDate.toISOString().slice(0, 10) !== value) {
    throw new ValidationError("Tanggal laporan tidak valid");
  }
  if (!isTimezoneOffset(timezoneOffsetMinutes) || !isTimezoneOffset(nextDayTimezoneOffsetMinutes)) {
    throw new ValidationError("Zona waktu laporan tidak valid");
  }

  const start = new Date(statementDate.getTime() + timezoneOffsetMinutes * 60_000);
  const nextUtcMidnight = new Date(statementDate);
  nextUtcMidnight.setUTCDate(nextUtcMidnight.getUTCDate() + 1);
  const end = new Date(nextUtcMidnight.getTime() + nextDayTimezoneOffsetMinutes * 60_000);
  return { statementDate, start, end };
}

export function getLocalCalendarMonthRange(
  month: unknown,
  year: unknown,
  monthStartTimezoneOffsetMinutes: unknown,
  nextMonthStartTimezoneOffsetMinutes: unknown,
) {
  if (typeof month !== "number" || !Number.isSafeInteger(month) || month < 1 || month > 12 ||
      typeof year !== "number" || !Number.isSafeInteger(year) || year < 2000 || year > 9999) {
    throw new ValidationError("Periode anggaran tidak valid");
  }
  if (!isTimezoneOffset(monthStartTimezoneOffsetMinutes) ||
      !isTimezoneOffset(nextMonthStartTimezoneOffsetMinutes)) {
    throw new ValidationError("Zona waktu periode tidak valid");
  }

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const nextMonthStart = new Date(Date.UTC(year, month, 1));
  return {
    start: new Date(monthStart.getTime() + monthStartTimezoneOffsetMinutes * 60_000),
    end: new Date(nextMonthStart.getTime() + nextMonthStartTimezoneOffsetMinutes * 60_000),
  };
}

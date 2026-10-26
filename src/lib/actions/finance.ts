"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getLocalCalendarDayRange,
  ValidationError,
  validateTransactionInput,
  validateWalletBalance,
} from "@/lib/validation";

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

function computeBalance(transactions: { type: string; amount: number }[]) {
  return transactions.reduce((s, t) => s + (t.type === "masuk" ? t.amount : -t.amount), 0);
}

function validateBudgetPeriod(month: unknown, year: unknown) {
  if (!Number.isSafeInteger(month) || (month as number) < 1 || (month as number) > 12 ||
      !Number.isSafeInteger(year) || (year as number) < 2000 || (year as number) > 9999) {
    throw new ValidationError("Periode anggaran tidak valid");
  }
  return { month: month as number, year: year as number };
}

async function requireOwnedCategory(
  userId: string,
  categoryId: string,
  type: "masuk" | "keluar",
  allowArchivedId?: string,
) {
  if (typeof categoryId !== "string" || !categoryId.trim()) {
    throw new ValidationError("Pilih kategori transaksi");
  }
  const category = await prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      forIncome: type === "masuk",
      ...(allowArchivedId === categoryId ? {} : { isActive: true }),
    },
    select: { id: true },
  });
  if (!category) throw new ValidationError("Kategori tidak ditemukan atau tidak sesuai jenis transaksi");
}

async function requireOwnedWallet(userId: string, walletId: string) {
  if (typeof walletId !== "string" || !walletId.trim()) {
    throw new ValidationError("Pilih kantong sebelum menyimpan transaksi");
  }
  const wallet = await prisma.wallet.findFirst({
    where: { id: walletId, userId },
    select: { id: true },
  });
  if (!wallet) throw new ValidationError("Kantong tidak ditemukan. Pilih kantong yang tersedia");
}

export async function getFinanceData() {
  const userId = await requireUser();
  const [transactions, categories, budgets, rawWallets] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: "desc" },
    }),
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    }),
    prisma.wallet.findMany({
      where: { userId },
      include: {
        transactions: { select: { type: true, amount: true } },
        reconciliations: {
          select: { id: true },
          take: 1,
          orderBy: { statementDate: "desc" },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);
  const wallets = rawWallets.map(({ transactions: txs, reconciliations, ...w }) => ({
    ...w,
    balance: computeBalance(txs),
    hasReconciliation: reconciliations.length > 0,
  }));
  return { transactions, categories, budgets, wallets };
}

export async function getCategories() {
  const userId = await requireUser();
  return prisma.category.findMany({ where: { userId, isActive: true }, orderBy: { name: "asc" } });
}

export async function createTransaction(data: unknown): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await requireUser();
  try {
    const transaction = validateTransactionInput(data);
    await Promise.all([
      requireOwnedCategory(userId, transaction.categoryId, transaction.type),
      requireOwnedWallet(userId, transaction.walletId),
    ]);
    await prisma.transaction.create({ data: { userId, ...transaction } });
  } catch (error) {
    if (error instanceof ValidationError) return { success: false, error: error.message };
    throw error;
  }
  revalidatePath("/");
  revalidatePath("/finance");
  return { success: true };
}

export async function updateTransaction(id: string, data: unknown) {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim()) throw new ValidationError("Transaksi tidak valid");
  if (!data || typeof data !== "object" || Array.isArray(data) ||
      !("date" in data) || data.date === undefined || data.date === null || data.date === "") {
    throw new ValidationError("Tanggal transaksi wajib diisi");
  }
  const transaction = validateTransactionInput(data);
  const existing = await prisma.transaction.findFirst({
    where: { id, userId },
    select: { categoryId: true, reconciliationId: true },
  });
  if (!existing) throw new Error("Transaksi tidak ditemukan");
  if (existing.reconciliationId) {
    throw new ValidationError("Transaksi yang sudah direkonsiliasi tidak dapat diubah");
  }
  await Promise.all([
    requireOwnedCategory(userId, transaction.categoryId, transaction.type, existing.categoryId),
    requireOwnedWallet(userId, transaction.walletId),
  ]);
  const updated = await prisma.transaction.updateMany({
    where: { id, userId, reconciliationId: null },
    data: transaction,
  });
  if (!updated.count) {
    const current = await prisma.transaction.findFirst({
      where: { id, userId },
      select: { reconciliationId: true },
    });
    if (current?.reconciliationId) {
      throw new ValidationError("Transaksi yang sudah direkonsiliasi tidak dapat diubah");
    }
    throw new Error("Transaksi tidak ditemukan");
  }
  revalidatePath("/");
  revalidatePath("/finance");
}

export async function deleteTransaction(id: string) {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim()) throw new ValidationError("Transaksi tidak valid");
  const deleted = await prisma.transaction.deleteMany({
    where: { id, userId, reconciliationId: null },
  });
  if (!deleted.count) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
      select: { reconciliationId: true },
    });
    if (existing?.reconciliationId) {
      throw new ValidationError("Transaksi yang sudah direkonsiliasi tidak dapat dihapus");
    }
    throw new Error("Transaksi tidak ditemukan");
  }
  revalidatePath("/");
  revalidatePath("/finance");
}

export async function upsertBudget(data: {
  categoryId: string;
  amount: number;
  month: number;
  year: number;
}) {
  const userId = await requireUser();
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ValidationError("Data anggaran tidak valid");
  }
  if (!Number.isSafeInteger(data.amount) || data.amount <= 0 || data.amount > 2_147_483_647) {
    throw new ValidationError("Anggaran harus berupa angka bulat yang lebih besar dari 0");
  }
  const period = validateBudgetPeriod(data.month, data.year);
  await requireOwnedCategory(userId, data.categoryId, "keluar");
  await prisma.budget.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId: data.categoryId,
        month: period.month,
        year: period.year,
      },
    },
    update: { amount: data.amount },
    create: {
      userId,
      categoryId: data.categoryId,
      amount: data.amount,
      month: period.month,
      year: period.year,
    },
  });
  revalidatePath("/");
  revalidatePath("/finance");
}

export async function deleteBudget(categoryId: string, month: number, year: number) {
  const userId = await requireUser();
  if (typeof categoryId !== "string" || !categoryId.trim()) throw new ValidationError("Kategori anggaran tidak valid");
  const period = validateBudgetPeriod(month, year);
  await requireOwnedCategory(userId, categoryId, "keluar");
  await prisma.budget.deleteMany({
    where: { userId, categoryId, month: period.month, year: period.year },
  });
  revalidatePath("/");
  revalidatePath("/finance");
}

export async function copyPreviousMonthBudgets(month: number, year: number) {
  const userId = await requireUser();
  const target = validateBudgetPeriod(month, year);
  const sourceDate = new Date(Date.UTC(target.year, target.month - 2, 1));
  const sourceMonth = sourceDate.getUTCMonth() + 1;
  const sourceYear = sourceDate.getUTCFullYear();

  const count = await prisma.$transaction(async (tx) => {
    const sourceBudgets = await tx.budget.findMany({
      where: {
        userId,
        month: sourceMonth,
        year: sourceYear,
        amount: { gt: 0 },
        category: { userId, forIncome: false, isActive: true },
      },
      select: { categoryId: true, amount: true },
    });
    if (sourceBudgets.length === 0) return 0;
    const created = await tx.budget.createMany({
      data: sourceBudgets.map((budget) => ({
        userId,
        categoryId: budget.categoryId,
        amount: budget.amount,
        month: target.month,
        year: target.year,
      })),
      skipDuplicates: true,
    });
    return created.count;
  });

  revalidatePath("/finance");
  return count;
}

// ── Wallet ──────────────────────────────────────────────────────────────────

export async function getWallets() {
  const userId = await requireUser();
  const wallets = await prisma.wallet.findMany({
    where: { userId },
    include: { transactions: { select: { type: true, amount: true } } },
    orderBy: { name: "asc" },
  });
  return wallets.map(({ transactions, ...w }) => ({ ...w, balance: computeBalance(transactions) }));
}

export async function createWallet(data: {
  name: string;
  type: string;
  icon: string;
  color?: string;
  initialBalance?: number;
}) {
  const userId = await requireUser();
  const normalized = validateWalletInput(data, true);
  const initialBalance = validateWalletBalance(data.initialBalance ?? 0);
  const w = await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.create({ data: { userId, ...normalized } });
    if (initialBalance > 0) {
      const category = await tx.category.findFirst({
        where: { userId, forIncome: true },
        orderBy: { name: "asc" },
        select: { id: true },
      });
      if (!category) throw new ValidationError("Tambahkan kategori pemasukan sebelum mengisi saldo awal");
      await tx.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          categoryId: category.id,
          type: "masuk",
          amount: initialBalance,
          note: "(saldo awal)",
        },
      });
    }
    return wallet;
  });
  revalidatePath("/finance");
  return { ...w, balance: initialBalance, hasReconciliation: false };
}

export async function updateWallet(id: string, data: { name?: string; icon?: string; color?: string }) {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim()) throw new ValidationError("Kantong tidak valid");
  const normalized = validateWalletInput(data, false);
  const updated = await prisma.wallet.updateMany({ where: { id, userId }, data: normalized });
  if (!updated.count) throw new Error("Kantong tidak ditemukan");
  revalidatePath("/finance");
}

export async function deleteWallet(id: string) {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim()) throw new ValidationError("Kantong tidak valid");
  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findFirst({ where: { id, userId }, select: { id: true } });
    if (!wallet) throw new Error("Kantong tidak ditemukan");
    await tx.transaction.updateMany({ where: { walletId: id, userId }, data: { walletId: null } });
    await tx.wallet.delete({ where: { id } });
  });
  revalidatePath("/finance");
}

// Keep pre-reconciliation balance changes visible as ordinary transactions.
export async function setWalletBalance(walletId: string, targetBalance: number) {
  const userId = await requireUser();
  const target = validateWalletBalance(targetBalance);
  if (typeof walletId !== "string" || !walletId.trim()) throw new ValidationError("Kantong tidak valid");
  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findFirst({
      where: { id: walletId, userId },
      include: {
        transactions: { select: { type: true, amount: true } },
        reconciliations: {
          select: { id: true },
          take: 1,
          orderBy: { statementDate: "desc" },
        },
      },
    });
    if (!wallet) throw new Error("Kantong tidak ditemukan");
    if (wallet.reconciliations.length > 0) {
      throw new ValidationError("Saldo kantong yang sudah direkonsiliasi tidak dapat diubah langsung. Catat koreksi sebagai transaksi.");
    }

    const diff = target - computeBalance(wallet.transactions);
    if (diff === 0) return;
    if (Math.abs(diff) > 2_147_483_647) {
      throw new ValidationError("Selisih saldo melebihi batas yang dapat disimpan");
    }

    const type = diff > 0 ? "masuk" : "keluar";
    const category = await tx.category.findFirst({
      where: { userId, forIncome: type === "masuk" },
      orderBy: { name: "asc" },
      select: { id: true },
    });
    if (!category) throw new Error("Tambahkan kategori yang sesuai sebelum menyesuaikan saldo");
    await tx.transaction.create({
      data: {
        userId,
        walletId,
        categoryId: category.id,
        type,
        amount: Math.abs(diff),
        note: "(penyesuaian saldo)",
      },
    });
  }, { isolationLevel: "Serializable" });
  revalidatePath("/finance");
}

export async function createWalletReconciliation(
  walletId: string,
  input: {
    statementDate: string;
    statementBalance: number;
    transactionIds: string[];
    timezoneOffsetMinutes: number;
    nextDayTimezoneOffsetMinutes: number;
  },
) {
  const userId = await requireUser();
  if (typeof walletId !== "string" || !walletId.trim()) {
    throw new ValidationError("Kantong tidak valid");
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError("Data rekonsiliasi tidak valid");
  }
  if (typeof input.statementDate !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.statementDate)) {
    throw new ValidationError("Tanggal laporan tidak valid");
  }
  const { statementDate, start, end } = getLocalCalendarDayRange(
    input.statementDate,
    input.timezoneOffsetMinutes,
    input.nextDayTimezoneOffsetMinutes,
  );
  if (!Number.isSafeInteger(input.statementBalance) ||
      input.statementBalance < -2_147_483_648 ||
      input.statementBalance > 2_147_483_647) {
    throw new ValidationError("Saldo laporan tidak valid");
  }
  if (!Array.isArray(input.transactionIds) ||
      input.transactionIds.length > 10_000 ||
      input.transactionIds.some((id) => typeof id !== "string" || !id.trim())) {
    throw new ValidationError("Daftar transaksi rekonsiliasi tidak valid");
  }
  const transactionIds = input.transactionIds.map((id) => id.trim());
  if (new Set(transactionIds).size !== transactionIds.length) {
    throw new ValidationError("Daftar transaksi rekonsiliasi tidak boleh berisi duplikat");
  }
  await prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findFirst({
      where: { id: walletId, userId },
      select: { id: true, name: true },
    });
    if (!wallet) throw new ValidationError("Kantong tidak ditemukan");
    const lastReconciliation = await tx.walletReconciliation.findFirst({
      where: { userId, walletId },
      orderBy: { statementDate: "desc" },
      select: { statementDate: true },
    });
    if (lastReconciliation && statementDate <= lastReconciliation.statementDate) {
      throw new ValidationError("Tanggal laporan harus setelah rekonsiliasi terakhir");
    }

    const selectedTransactions = transactionIds.length
      ? await tx.transaction.findMany({
        where: {
          id: { in: transactionIds },
          userId,
          walletId,
          reconciliationId: null,
          date: { gte: start, lt: end },
        },
        select: { id: true },
      })
      : [];
    if (selectedTransactions.length !== transactionIds.length) {
      throw new ValidationError(
        "Pilih transaksi yang belum direkonsiliasi di kantong ini dan sampai tanggal laporan",
      );
    }

    const balanceTransactions = await tx.transaction.findMany({
      where: {
        userId,
        walletId,
        date: { lt: end },
        OR: [
          { reconciliationId: { not: null } },
          { id: { in: transactionIds } },
        ],
      },
      select: { type: true, amount: true },
    });
    let calculatedBalance = 0;
    for (const transaction of balanceTransactions) {
      calculatedBalance += transaction.type === "masuk" ? transaction.amount : -transaction.amount;
      if (!Number.isSafeInteger(calculatedBalance)) {
        throw new ValidationError("Jumlah transaksi melebihi batas perhitungan saldo");
      }
    }
    if (calculatedBalance !== input.statementBalance) {
      const discrepancy = input.statementBalance - calculatedBalance;
      if (!Number.isSafeInteger(discrepancy)) {
        throw new ValidationError("Selisih saldo laporan melebihi batas perhitungan");
      }
      throw new ValidationError(`Saldo laporan tidak cocok. Selisih: ${discrepancy}`);
    }

    const reconciliation = await tx.walletReconciliation.create({
      data: {
        userId,
        walletId,
        walletName: wallet.name,
        statementDate,
        statementBalance: input.statementBalance,
      },
      select: { id: true },
    });
    if (transactionIds.length) {
      const updated = await tx.transaction.updateMany({
        where: {
          id: { in: transactionIds },
          userId,
          walletId,
          reconciliationId: null,
          date: { gte: start, lt: end },
        },
        data: { reconciliationId: reconciliation.id },
      });
      if (updated.count !== transactionIds.length) {
        throw new ValidationError("Sebagian transaksi telah direkonsiliasi. Muat ulang lalu coba lagi");
      }
    }
  }, { isolationLevel: "Serializable" });

  revalidatePath("/finance");
}

// ── Category ─────────────────────────────────────────────────────────────────

export async function updateCategory(id: string, data: { name?: string; icon?: string; forIncome?: boolean }) {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim()) throw new ValidationError("Kategori tidak valid");
  const normalized = validateCategoryInput(data, false);
  const existing = await prisma.category.findFirst({
    where: { id, userId, isActive: true },
    select: { forIncome: true },
  });
  if (!existing) throw new Error("Kategori tidak ditemukan");
  if (normalized.forIncome !== undefined && existing.forIncome !== normalized.forIncome) {
    const transactionCount = await prisma.transaction.count({ where: { categoryId: id, userId } });
    if (transactionCount) throw new ValidationError("Jenis kategori tidak dapat diubah karena sudah dipakai transaksi");
  }
  const updated = await prisma.category.updateMany({ where: { id, userId, isActive: true }, data: normalized });
  if (!updated.count) throw new Error("Kategori tidak ditemukan");
  revalidatePath("/finance");
}

export async function createCategory(data: { name: string; icon: string; color?: string; forIncome: boolean }) {
  const userId = await requireUser();
  const normalized = validateCategoryInput(data, true);
  const cat = await prisma.category.create({
    data: { userId, color: "#E8BE78", isDefault: false, ...normalized },
  });
  revalidatePath("/finance");
  return cat;
}

export async function deleteCategory(id: string) {
  const userId = await requireUser();
  if (typeof id !== "string" || !id.trim()) throw new ValidationError("Kategori tidak valid");
  const category = await prisma.category.findFirst({
    where: { id, userId, isActive: true },
    select: { id: true },
  });
  if (!category) throw new Error("Kategori tidak ditemukan");
  const archived = await prisma.category.updateMany({
    where: { id, userId, isActive: true },
    data: { isActive: false },
  });
  if (!archived.count) throw new Error("Kategori tidak ditemukan");
  revalidatePath("/");
  revalidatePath("/finance");
}

function validateWalletInput(
  value: unknown,
  required: true,
): { name: string; type: string; icon: string; color?: string };
function validateWalletInput(
  value: unknown,
  required: false,
): { name?: string; icon?: string; color?: string };
function validateWalletInput(value: unknown, required: boolean) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError("Data kantong tidak valid");
  }
  const data = value as Record<string, unknown>;
  const result: { name?: string; type?: string; icon?: string; color?: string } = {};
  if (required || data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim() || data.name.trim().length > 80) {
      throw new ValidationError("Nama kantong harus berisi 1–80 karakter");
    }
    result.name = data.name.trim();
  }
  if (required || data.type !== undefined) {
    if (!["cash", "bank", "card", "ewallet", "other"].includes(String(data.type))) {
      throw new ValidationError("Jenis kantong tidak valid");
    }
    result.type = data.type as string;
  }
  if (required || data.icon !== undefined) {
    if (typeof data.icon !== "string" || !data.icon.trim() || data.icon.length > 32) {
      throw new ValidationError("Ikon kantong harus berisi 1–32 karakter");
    }
    result.icon = data.icon.trim();
  }
  if (data.color !== undefined) {
    if (typeof data.color !== "string" || !/^#[0-9a-f]{6}$/i.test(data.color)) {
      throw new ValidationError("Warna kantong tidak valid");
    }
    result.color = data.color;
  }
  return result;
}

function validateCategoryInput(value: unknown, required: true): {
  name: string;
  icon: string;
  forIncome: boolean;
  color?: string;
};
function validateCategoryInput(value: unknown, required: false): {
  name?: string;
  icon?: string;
  forIncome?: boolean;
  color?: string;
};
function validateCategoryInput(value: unknown, required: boolean) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new ValidationError("Data kategori tidak valid");
  }
  const data = value as Record<string, unknown>;
  const result: { name?: string; icon?: string; forIncome?: boolean; color?: string } = {};
  if (required || data.name !== undefined) {
    if (typeof data.name !== "string" || !data.name.trim() || data.name.trim().length > 80) {
      throw new ValidationError("Nama kategori harus berisi 1–80 karakter");
    }
    result.name = data.name.trim();
  }
  if (required || data.icon !== undefined) {
    if (typeof data.icon !== "string" || !data.icon.trim() || data.icon.length > 32) {
      throw new ValidationError("Ikon kategori harus berisi 1–32 karakter");
    }
    result.icon = data.icon.trim();
  }
  if (required || data.forIncome !== undefined) {
    if (typeof data.forIncome !== "boolean") throw new ValidationError("Jenis kategori tidak valid");
    result.forIncome = data.forIncome;
  }
  if (data.color !== undefined) {
    if (typeof data.color !== "string" || !/^#[0-9a-f]{6}$/i.test(data.color)) {
      throw new ValidationError("Warna kategori tidak valid");
    }
    result.color = data.color;
  }
  return result;
}

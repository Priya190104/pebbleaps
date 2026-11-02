import assert from "node:assert/strict";
import test from "node:test";
import {
  validateTaskInput,
  validateTransactionInput,
  validateWalletBalance,
  validateWalletTransferInput,
} from "./validation";
import { analyticsCalendarDate } from "./analytics-date";
import { calculateWalletBalance } from "./finance-calculations";

test("task validation trims text and preserves supported values", () => {
  const result = validateTaskInput({
    title: "  Belanja  ",
    priority: "  TINGGI  ",
    deadline: new Date("2026-10-20T00:00:00.000Z"),
    subtasks: ["  Susu ", "", " Roti"],
  });

  assert.equal(result.title, "Belanja");
  assert.equal(result.priority, "tinggi");
  assert.deepEqual(result.subtasks, ["Susu", "Roti"]);
});

test("task validation rejects unsupported priority and oversized subtasks", () => {
  assert.throws(() => validateTaskInput({ title: "Tugas", priority: "urgent" }), /Prioritas/);
  assert.throws(
    () => validateTaskInput({ title: "Tugas", priority: "sedang", subtasks: ["x".repeat(121)] }),
    /Sub-tugas/,
  );
  assert.throws(
    () => validateTaskInput({ title: "Tugas", priority: "sedang", deadline: "bukan-tanggal" }),
    /Deadline tugas/,
  );
  assert.equal(
    validateTaskInput({ title: "Tugas", priority: "  sedang  ", deadline: "   " }).deadline,
    undefined,
  );
});

test("transaction validation rejects invalid amount, note, category, and wallet", () => {
  const valid = {
    type: "keluar",
    amount: 15000,
    note: "Makan siang",
    categoryId: "category-1",
    walletId: "wallet-1",
  };

  assert.equal(validateTransactionInput(valid).amount, 15000);
  assert.equal(validateTransactionInput({ ...valid, type: "  KELUAR  ", date: "   " }).type, "keluar");
  assert.throws(() => validateTransactionInput({ ...valid, amount: 0 }), /Jumlah transaksi/);
  assert.throws(() => validateTransactionInput({ ...valid, amount: 1.5 }), /Jumlah transaksi/);
  assert.throws(() => validateTransactionInput({ ...valid, amount: 2_147_483_648 }), /Jumlah transaksi/);
  assert.throws(() => validateTransactionInput({ ...valid, type: "transfer" }), /Jenis transaksi/);
  assert.throws(() => validateTransactionInput({ ...valid, note: " " }), /Catatan transaksi/);
  assert.throws(() => validateTransactionInput({ ...valid, walletId: "" }), /Pilih kantong/);
  assert.throws(() => validateTransactionInput({ ...valid, date: "bukan-tanggal" }), /Tanggal transaksi/);
});

test("wallet balances must be non-negative database integers", () => {
  assert.equal(validateWalletBalance(0), 0);
  assert.throws(() => validateWalletBalance(-1), /Saldo/);
  assert.throws(() => validateWalletBalance(1.25), /Saldo/);
  assert.throws(() => validateWalletBalance(2_147_483_648), /Saldo/);
});

test("analytics dates use the Indonesian calendar day boundary", () => {
  assert.equal(
    analyticsCalendarDate(new Date("2026-11-02T16:59:59.000Z")).toISOString(),
    "2026-11-02T00:00:00.000Z",
  );
  assert.equal(
    analyticsCalendarDate(new Date("2026-11-02T17:00:00.000Z")).toISOString(),
    "2026-11-03T00:00:00.000Z",
  );
});

test("wallet transfer validation requires distinct wallets and a positive integer amount", () => {
  const valid = {
    fromWalletId: " wallet-1 ",
    toWalletId: "wallet-2",
    amount: 25_000,
    note: "  Pindah dana  ",
    date: "2026-10-19",
  };
  const transfer = validateWalletTransferInput(valid);

  assert.equal(transfer.fromWalletId, "wallet-1");
  assert.equal(transfer.toWalletId, "wallet-2");
  assert.equal(transfer.note, "Pindah dana");
  assert.equal(transfer.amount, 25_000);
  assert.throws(() => validateWalletTransferInput({ ...valid, toWalletId: "wallet-1" }), /harus berbeda/);
  assert.throws(() => validateWalletTransferInput({ ...valid, amount: 0 }), /Jumlah transfer/);
  assert.throws(() => validateWalletTransferInput({ ...valid, amount: 1.5 }), /Jumlah transfer/);
  assert.throws(() => validateWalletTransferInput({ ...valid, amount: 2_147_483_648 }), /Jumlah transfer/);
});

test("wallet transfers conserve the combined balance", () => {
  const sourceBefore = calculateWalletBalance([{ type: "masuk", amount: 100_000 }], [], []);
  const targetBefore = calculateWalletBalance([{ type: "masuk", amount: 20_000 }], [], []);
  const amount = 40_000;
  const sourceAfter = calculateWalletBalance([{ type: "masuk", amount: 100_000 }], [], [{ amount }]);
  const targetAfter = calculateWalletBalance([{ type: "masuk", amount: 20_000 }], [{ amount }], []);

  assert.equal(sourceAfter, sourceBefore - amount);
  assert.equal(targetAfter, targetBefore + amount);
  assert.equal(sourceAfter + targetAfter, sourceBefore + targetBefore);
  assert.equal(sourceBefore >= amount, true);
  assert.equal(targetBefore >= amount, false);
});

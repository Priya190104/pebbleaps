import assert from "node:assert/strict";
import test from "node:test";
import {
  getLocalCalendarDayRange,
  getLocalCalendarMonthRange,
  validateTaskInput,
  validateTransactionInput,
  validateWalletBalance,
} from "./validation";

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

test("local calendar day range respects UTC+07 transaction dates", () => {
  const range = getLocalCalendarDayRange("2026-10-19", -420, -420);

  assert.equal(range.start.toISOString(), "2026-10-18T17:00:00.000Z");
  assert.equal(range.end.toISOString(), "2026-10-19T17:00:00.000Z");
  assert.equal(new Date("2026-10-19T16:59:59.999Z") < range.end, true);
  assert.equal(new Date("2026-10-19T20:00:00.000Z") < range.end, false);
});

test("local calendar day range supports daylight-saving transitions", () => {
  const range = getLocalCalendarDayRange("2026-11-01", 240, 300);

  assert.equal(range.end.getTime() - range.start.getTime(), 25 * 60 * 60 * 1000);
});

test("local calendar day range rejects invalid dates and timezone offsets", () => {
  assert.throws(() => getLocalCalendarDayRange("2026-02-30", 0, 0), /Tanggal laporan/);
  assert.throws(() => getLocalCalendarDayRange("2026-10-19", 841, 841), /Zona waktu/);
  assert.throws(() => getLocalCalendarDayRange("2026-10-19", 420, "420"), /Zona waktu/);
});

test("local calendar month range respects timezone and daylight-saving boundaries", () => {
  const indonesiaOctober = getLocalCalendarMonthRange(10, 2026, -420, -420);
  assert.equal(indonesiaOctober.start.toISOString(), "2026-09-30T17:00:00.000Z");
  assert.equal(indonesiaOctober.end.toISOString(), "2026-10-31T17:00:00.000Z");

  const newYorkNovember = getLocalCalendarMonthRange(11, 2026, 240, 300);
  assert.equal(newYorkNovember.end.getTime() - newYorkNovember.start.getTime(), (30 * 24 + 1) * 60 * 60 * 1000);
});

test("local calendar month range rejects invalid periods and offsets", () => {
  assert.throws(() => getLocalCalendarMonthRange(13, 2026, 0, 0), /Periode anggaran/);
  assert.throws(() => getLocalCalendarMonthRange(10, 2026, 0, -841), /Zona waktu/);
});

import assert from "node:assert/strict";
import test from "node:test";
import { financeFilterQuery, resolveFinanceFilter } from "./finance-period";

test("weekly finance filter includes the selected Monday through Sunday", () => {
  const filter = resolveFinanceFilter({
    period: "weekly",
    week: "2026-W44",
    startOffset: "-420",
    endOffset: "-420",
  });

  assert.equal(filter.fromKey, "2026-10-26");
  assert.equal(filter.throughKey, "2026-11-01");
  assert.equal(filter.start.toISOString(), "2026-10-25T17:00:00.000Z");
  assert.equal(filter.end.toISOString(), "2026-11-01T17:00:00.000Z");
});

test("daily finance filter supports an unrestricted date range", () => {
  const filter = resolveFinanceFilter({
    period: "daily",
    dateMode: "range",
    start: "2020-01-01",
    end: "2026-10-26",
    startOffset: "-420",
    endOffset: "-420",
  });

  assert.equal(filter.fromKey, "2020-01-01");
  assert.equal(filter.throughKey, "2026-10-26");
  assert.equal(filter.start.toISOString(), "2019-12-31T17:00:00.000Z");
  assert.equal(filter.end.toISOString(), "2026-10-26T17:00:00.000Z");
});

test("monthly finance filter respects leap years and selected month", () => {
  const filter = resolveFinanceFilter({
    period: "monthly",
    month: "2",
    year: "2024",
    startOffset: "-420",
    endOffset: "-420",
  });

  assert.equal(filter.fromKey, "2024-02-01");
  assert.equal(filter.throughKey, "2024-02-29");
  assert.equal(filter.end.toISOString(), "2024-02-29T17:00:00.000Z");
});

test("yearly filter keeps the selected month as the monthly budget context", () => {
  const filter = resolveFinanceFilter({
    period: "yearly",
    month: "8",
    year: "2025",
    startOffset: "-420",
    endOffset: "-420",
  });

  assert.equal(filter.fromKey, "2025-01-01");
  assert.equal(filter.throughKey, "2025-12-31");
  assert.equal(filter.budgetMonth, 8);
  assert.equal(filter.budgetYear, 2025);
});

test("finance tab query follows the selected week for monthly budget context", () => {
  const filter = resolveFinanceFilter({
    tab: "summary",
    period: "weekly",
    week: "2026-W44",
    startOffset: "-420",
    endOffset: "-420",
  });
  const query = new URLSearchParams(financeFilterQuery({ tab: "summary" }, filter));

  assert.equal(query.get("tab"), null);
  assert.equal(query.get("period"), "weekly");
  assert.equal(query.get("week"), "2026-W44");
  assert.equal(filter.budgetMonth, 10);
  assert.equal(filter.budgetYear, 2026);
  assert.equal(query.get("budgetMonth"), null);
  assert.equal(query.get("budgetYear"), null);
});

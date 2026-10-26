UPDATE "Category"
SET "isDefault" = false,
    "isSavings" = false
WHERE "isSavings" = true
   OR ("forIncome" = false AND LOWER(BTRIM("name")) = 'tabungan');

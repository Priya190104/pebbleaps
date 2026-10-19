ALTER TABLE "Category"
ADD COLUMN "isSavings" BOOLEAN NOT NULL DEFAULT false;

WITH ranked_savings AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (PARTITION BY "userId" ORDER BY "id") AS position
    FROM "Category"
    WHERE "forIncome" = false
      AND LOWER(BTRIM("name")) = 'tabungan'
)
UPDATE "Category" AS category
SET "isSavings" = true
FROM ranked_savings
WHERE category."id" = ranked_savings."id"
  AND ranked_savings.position = 1;

INSERT INTO "Category" (
    "id",
    "userId",
    "name",
    "color",
    "icon",
    "isDefault",
    "isSavings",
    "forIncome",
    "isActive"
)
SELECT
    'savings_' || MD5("User"."id"),
    "User"."id",
    'Tabungan',
    '#D4F5E5',
    '🏦',
    true,
    true,
    false,
    true
FROM "User"
WHERE NOT EXISTS (
    SELECT 1
    FROM "Category"
    WHERE "Category"."userId" = "User"."id"
      AND "Category"."isSavings" = true
);

ALTER TABLE "Transaction"
DROP CONSTRAINT IF EXISTS "Transaction_reconciliationId_fkey",
DROP COLUMN IF EXISTS "reconciliationId";

DROP TABLE IF EXISTS "WalletReconciliation";

CREATE TABLE "WalletTransfer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromWalletId" TEXT NOT NULL,
    "toWalletId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransfer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "WalletTransfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WalletTransfer_fromWalletId_fkey" FOREIGN KEY ("fromWalletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WalletTransfer_toWalletId_fkey" FOREIGN KEY ("toWalletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "WalletTransfer_userId_date_idx" ON "WalletTransfer"("userId", "date");
CREATE INDEX "WalletTransfer_fromWalletId_date_idx" ON "WalletTransfer"("fromWalletId", "date");
CREATE INDEX "WalletTransfer_toWalletId_date_idx" ON "WalletTransfer"("toWalletId", "date");

CREATE TABLE "LoginEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "LoginEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "LoginEvent_loginDate_userId_idx" ON "LoginEvent"("loginDate", "userId");

CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserActivity_userId_feature_date_key" ON "UserActivity"("userId", "feature", "date");
CREATE INDEX "UserActivity_date_userId_idx" ON "UserActivity"("date", "userId");
CREATE INDEX "UserActivity_feature_date_idx" ON "UserActivity"("feature", "date");

-- Add positive budget rollover support. Existing budgets start with no rollover.
ALTER TABLE "Budget"
ADD COLUMN "rolloverAmount" INTEGER NOT NULL DEFAULT 0;

-- Store wallet statement snapshots and their transaction matches.
CREATE TABLE "WalletReconciliation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "statementDate" DATE NOT NULL,
    "statementBalance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletReconciliation_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Transaction"
ADD COLUMN "reconciliationId" TEXT;

CREATE INDEX "Transaction_reconciliationId_idx"
ON "Transaction"("reconciliationId");

ALTER TABLE "WalletReconciliation"
ADD CONSTRAINT "WalletReconciliation_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WalletReconciliation"
ADD CONSTRAINT "WalletReconciliation_walletId_fkey"
FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Transaction"
ADD CONSTRAINT "Transaction_reconciliationId_fkey"
FOREIGN KEY ("reconciliationId") REFERENCES "WalletReconciliation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

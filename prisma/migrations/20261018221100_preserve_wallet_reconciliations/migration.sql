ALTER TABLE "WalletReconciliation"
ADD COLUMN "walletName" TEXT;

UPDATE "WalletReconciliation" AS reconciliation
SET "walletName" = wallet."name"
FROM "Wallet" AS wallet
WHERE wallet."id" = reconciliation."walletId";

ALTER TABLE "WalletReconciliation"
ALTER COLUMN "walletName" SET NOT NULL,
ALTER COLUMN "walletId" DROP NOT NULL;

ALTER TABLE "WalletReconciliation"
DROP CONSTRAINT "WalletReconciliation_walletId_fkey";

ALTER TABLE "WalletReconciliation"
ADD CONSTRAINT "WalletReconciliation_walletId_fkey"
FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

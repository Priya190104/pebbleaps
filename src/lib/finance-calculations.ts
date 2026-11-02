type WalletTransaction = { type: string; amount: number };
type WalletTransferAmount = { amount: number };

export function calculateWalletBalance(
  transactions: WalletTransaction[],
  incomingTransfers: WalletTransferAmount[],
  outgoingTransfers: WalletTransferAmount[],
) {
  const transactionBalance = transactions.reduce(
    (balance, transaction) => balance + (transaction.type === "masuk" ? transaction.amount : -transaction.amount),
    0,
  );
  const incoming = incomingTransfers.reduce((total, transfer) => total + transfer.amount, 0);
  const outgoing = outgoingTransfers.reduce((total, transfer) => total + transfer.amount, 0);
  return transactionBalance + incoming - outgoing;
}

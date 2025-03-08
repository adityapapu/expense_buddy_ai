import { listTransactions } from "../../server/services/transactionService";
import TransactionList from "../../components/TransactionList";

export default async function Page() {
  try {
    // Fetch initial transactions
    const transactionsResult = await listTransactions({ 
      pageSize: 10,
      sortBy: 'date',
      sortOrder: 'desc'
    });
    
    const transactions = transactionsResult.success ? transactionsResult.transactions ?? [] : [];

    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Transactions</h1>
        <TransactionList initialTransactions={transactions} />
      </div>
    );
  } catch (error) {
    console.error("Failed to fetch transaction data:", error);
    return <div>Error: Failed to load transaction data. Please try again later.</div>;
  }
}
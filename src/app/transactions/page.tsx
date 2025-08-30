import { auth } from "@/auth";
import { getTransactions } from "@/lib/actions/transactions";
import { getCategories, getPaymentMethods } from "@/lib/actions/filters";
import { TransactionsPageContent } from "./transactions-page-content";
import { redirect } from "next/navigation";
import { getTransactionSummary } from "@/server/services/transactionService";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const transactions = await getTransactions();
  const categories = await getCategories();
  const paymentMethods = await getPaymentMethods();
  const summary = await getTransactionSummary("monthly");

  return (
    <TransactionsPageContent
      transactions={transactions}
      categories={categories}
      paymentMethods={paymentMethods}
      summary={summary}
    />
  );
}

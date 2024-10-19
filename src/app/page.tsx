import { listPaymentMethods } from "../server/services/paymentMethodService";
import PageContent from "../components/PageContent";

export default async function Page() {
  try {
    const result = await listPaymentMethods({ pageSize: 10 });

    const paymentMethods = result.success ? result.paymentMethods ?? [] : [];

    return <PageContent initialPaymentMethods={paymentMethods} />;
  } catch (error) {
    console.error("Failed to fetch payment methods:", error);
    return <div>Error: Failed to load payment methods. Please try again later.</div>;
  }
}

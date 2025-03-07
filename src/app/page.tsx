import { listPaymentMethods } from "../server/services/paymentMethodService";
import { listCategories } from "../server/services/categoryService";
import PageContent from "../components/PageContent";

export default async function Page() {
  try {
    // Fetch payment methods
    const paymentMethodsResult = await listPaymentMethods({ pageSize: 10 });
    const paymentMethods = paymentMethodsResult.success ? paymentMethodsResult.paymentMethods ?? [] : [];

    // Fetch categories
    const categoriesResult = await listCategories({ pageSize: 10 });
    const categories = categoriesResult.success ? categoriesResult.categories ?? [] : [];

    return <PageContent 
      initialPaymentMethods={paymentMethods} 
      initialCategories={categories}
    />;
  } catch (error) {
    console.error("Failed to fetch initial data:", error);
    return <div>Error: Failed to load data. Please try again later.</div>;
  }
}

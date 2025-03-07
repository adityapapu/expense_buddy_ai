"use client";

import { useState } from "react";
import PaymentMethodList from "./PaymentMethodList";
import CategoryList from "./CategoryList";
import TagSelector from "./TagSelector";
import { Tabs, Tab } from "@nextui-org/react";
import { type PaymentMethod, type Category } from "@prisma/client";

interface PageContentProps {
  initialPaymentMethods?: PaymentMethod[];
  initialCategories?: Category[];
}

export default function PageContent({ 
  initialPaymentMethods = [], 
  initialCategories = [] 
}: PageContentProps) {
  const [selectedTab, setSelectedTab] = useState("payment-methods");
 
  return (
    <div>
      <Tabs 
        aria-label="Management Tabs" 
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        className="mb-6"
      >
        <Tab key="payment-methods" title="Payment Methods">
          <div className="h-auto w-full">
            <PaymentMethodList initialPaymentMethods={initialPaymentMethods} />
          </div>
        </Tab>
        <Tab key="categories" title="Categories">
          <div className="h-auto w-full">
            <CategoryList initialCategories={initialCategories} />
          </div>
        </Tab>
        <Tab key="tags" title="Tags">
          <TagSelector />
        </Tab>
      </Tabs>
    </div>
  );
}

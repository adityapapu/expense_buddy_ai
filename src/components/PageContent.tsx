"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';

const PaymentMethodList = dynamic(() => import('./PaymentMethodList'), { ssr: false });
import CategoryList from "./CategoryList";
import TagList from "./TagList";
import { Tabs, Tab } from "@heroui/react";
import { type PaymentMethod, type Category, type Tag } from "@prisma/client";

interface PageContentProps {
  initialPaymentMethods?: PaymentMethod[];
  initialCategories?: Category[];
  initialTags?: Tag[];
}

export default function PageContent({ 
  initialPaymentMethods = [], 
  initialCategories = [],
  initialTags = []
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
          <div className="h-auto w-full">
            <TagList initialTags={initialTags} />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}

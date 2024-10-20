"use client";

import PaymentMethodList from "./PaymentMethodList";
import TagSelector from "./TagSelector";

export default function PageContent() {
 
  return (
    <div>
     
      <div className="h-auto w-full">
        <PaymentMethodList 
        />
      </div>
      <TagSelector />
    </div>
  );
}

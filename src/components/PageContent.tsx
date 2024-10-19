"use client";

import { useState } from "react";
import { Button } from "@nextui-org/button";
import { FaMoneyBill } from "react-icons/fa";
import EmojiPicker from "./EmojiPicker";
import PaymentMethodModal from "./modals/PaymentMethod";
import PaymentMethodList from "./PaymentMethodList";
import { type PaymentMethod as PaymentMethodType } from "@prisma/client";

interface PageContentProps {
  initialPaymentMethods: PaymentMethodType[];
}

export default function PageContent({ initialPaymentMethods }: PageContentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodType[]>(initialPaymentMethods);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType | null>(null);

  const handleEmojiChange = (emoji: string) => {
    console.log(emoji);
  };

  const handleOpenModal = (paymentMethod: PaymentMethodType | null = null) => {
    setSelectedPaymentMethod(paymentMethod);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedPaymentMethod(null);
    setIsOpen(false);
  };

  const handleSavePaymentMethod = (updatedMethod: PaymentMethodType) => {
    setPaymentMethods((prevMethods) => {
      const index = prevMethods.findIndex((method) => method.id === updatedMethod.id);
      if (index !== -1) {
        // Update existing payment method
        const newMethods = [...prevMethods];
        newMethods[index] = updatedMethod;
        return newMethods;
      } else {
        // Add new payment method
        return [...prevMethods, updatedMethod];
      }
    });
    handleCloseModal();
  };

  const handleDeletePaymentMethod = (deletedMethodId: string) => {
    setPaymentMethods((prevMethods) => 
      prevMethods.filter((method) => method.id !== deletedMethodId)
    );
  };

  return (
    <div>
      <Button color="success" endContent={<FaMoneyBill />}>
        Add a new record
      </Button>
      <Button onPress={() => handleOpenModal()}>Create a new payment method</Button>
      <EmojiPicker 
        defaultIcon="🚫" 
        onChange={handleEmojiChange}
      />
      <PaymentMethodModal 
        isOpen={isOpen}
        onClose={handleCloseModal}
        onSave={handleSavePaymentMethod}
        paymentMethod={selectedPaymentMethod}
      />
      <div className="h-auto w-[300px]">
        {paymentMethods.length > 0 ? (
          <PaymentMethodList 
            paymentMethods={paymentMethods} 
            onUpdate={handleSavePaymentMethod}
            onDeleteSuccess={handleDeletePaymentMethod}
          />
        ) : (
          <p>No payment methods found. Create one to get started!</p>
        )}
      </div>
    </div>
  );
}

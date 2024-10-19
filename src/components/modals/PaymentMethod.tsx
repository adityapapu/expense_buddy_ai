import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import EmojiPicker from "../EmojiPicker";
import { createPaymentMethod, updatePaymentMethod } from "../../server/services/paymentMethodService";
import { useToast } from "../../hooks/use-toast";
import { type PaymentMethod } from "@prisma/client";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentMethod: PaymentMethod) => void;
  paymentMethod: PaymentMethod | null;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSave,
  paymentMethod,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🚫");
  const [paymentMethodName, setPaymentMethodName] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const { toast } = useToast();
  const [paymentMethodNameErrorMessage, setPaymentMethodNameErrorMessage] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (paymentMethod) {
        setPaymentMethodName(paymentMethod.name);
        setSelectedEmoji(paymentMethod.icon ?? "🚫");
      } else {
        setPaymentMethodName("");
        setSelectedEmoji("🚫");
      }
      setIsValid(true);
      setPaymentMethodNameErrorMessage("");
    }
  }, [isOpen, paymentMethod]);

  const handleSubmit = async () => {
    if (paymentMethodName && selectedEmoji) {
      try {
        setPending(true);
        const response = paymentMethod
          ? await updatePaymentMethod({
              id: paymentMethod.id,
              name: paymentMethodName,
              icon: selectedEmoji,
            })
          : await createPaymentMethod({
              name: paymentMethodName,
              icon: selectedEmoji,
            });

        if (response.success && response.paymentMethod) {
          toast({
            title: paymentMethod ? "Payment method updated" : "Payment method created",
            description: "You can now use this payment method",
          });
          onSave(response.paymentMethod);
          onClose();
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: paymentMethod ? "Failed to update payment method" : "Failed to create payment method",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
        });
        setPaymentMethodNameErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
        setIsValid(false);
      } finally {
        setPending(false);
      }
    } else {
      setIsValid(false);
      setPaymentMethodNameErrorMessage("Please enter a valid name and select an emoji");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" scrollBehavior="outside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {paymentMethod ? "Edit payment method" : "Create a payment method"}
        </ModalHeader>
        <ModalBody>
          <Input
            type="text"
            label="Name"
            placeholder="Enter the Payment Method Name"
            onChange={(e) => {
              setPaymentMethodName(e.target.value);
              setIsValid(e.target.value.length > 0);
            }}
            value={paymentMethodName}
            isInvalid={!isValid}
            errorMessage={paymentMethodNameErrorMessage}
          />
          Select the emoji{" "}
          <EmojiPicker
            defaultIcon={selectedEmoji}
            onChange={setSelectedEmoji}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!isValid || !paymentMethodName}
            isLoading={pending}
          >
            {paymentMethod ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentMethodModal;

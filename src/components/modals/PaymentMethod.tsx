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
import EmojiPicker from "@/components/EmojiPicker";
import { createPaymentMethod } from "@/server/services/paymentMethodService";
import { useToast } from "@/hooks/use-toast";

const PaymentMethod = ({
  paymentMethodId,
  isOpen,
  onOpen,
  onOpenChange,
}: {
  paymentMethodId?: string;
  isOpen: boolean;
  onOpen: () => void;
  onOpenChange: (state: boolean) => void;
}) => {
  const [selectedEmoji, setSelectedEmoji] = React.useState<string>("🚫");
  const [paymentMethodName, setPaymentMethodName] = React.useState<string>("");
  const [mode, setMode] = React.useState<string>(
    paymentMethodId ? "update" : "create",
  );
  const [isValid, setIsValid] = useState<boolean>(true);
  const { toast } = useToast();
  const [paymentMethodNameErrorMessage, setPaymentMethodNameErrorMessage] =
    React.useState<string>("");
  const [pending, setPending] = useState<boolean>(false);

  const handeSubmit = async () => {
    if (paymentMethodName && selectedEmoji) {
      console.log("Payment method created");

      if (mode === "create") {
        try {
          setPending(true);

          const response = await createPaymentMethod({
            name: paymentMethodName,
            icon: selectedEmoji,
          });
          if (response.success) {
            toast({
              title: "Payment method created",
              description:
                "You can now use this payment method to make payments",
            });
            onOpenChange(false);
            setPaymentMethodName("");
            setSelectedEmoji("🚫");
            setMode("create");
            setIsValid(true);
          } else {
            toast({
              variant: "destructive",
              title: "Failed to create payment method",
              description: response.message,
            });
            setPaymentMethodNameErrorMessage(response.message);
            setIsValid(false);
          }
          console.log("Payment method created", response);
        } catch (error) {
          console.error(error);
        } finally {
          setPending(false);
        }
      } else {
        console.log("Payment method updated");
      }
    } else {
      console.log("Payment method not created");
      setIsValid(false);
      setPaymentMethodNameErrorMessage("Please enter a valid name");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        scrollBehavior="outside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Create a payment method
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
                  onPress={() => {
                    console.log("aditya");
                    handeSubmit();
                  }}
                  onClick={() => {
                    console.log("Submit button clicked");
                  }}
                  isDisabled={!isValid || !paymentMethodName}
                  isLoading={pending}
                >
                  {mode === "create" ? "Create" : "Update"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};
export default PaymentMethod;

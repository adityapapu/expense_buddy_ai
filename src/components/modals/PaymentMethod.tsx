import React, { useEffect } from 'react'
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import EmojiPicker from "@/components/EmojiPicker";



const PaymentMethod = ({ paymentMethodId, isOpen, onOpen, onOpenChange }: { paymentMethodId?: string, isOpen: boolean, onOpen: () => void, onOpenChange: () => void }) => {

    const [selectedEmoji, setSelectedEmoji] = React.useState<string>("🚫");
    const [paymentMethodName, setPaymentMethodName] = React.useState<string>("");
    const [mode, setMode] = React.useState<string>(paymentMethodId ? "update" : "create");
    const [isValid, setIsValid] = React.useState<boolean>(true);

    const handeSubmit=()=>{
        if(paymentMethodName && selectedEmoji){
            console.log("Payment method created");
            if(mode === "create"){
                console.log("Payment method created");
            }else{
                console.log("Payment method updated");
            }
        }else{
            console.log("Payment method not created");
            setIsValid(false);
        }
    }

    return (
        <>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" scrollBehavior="outside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Create a payment method</ModalHeader>
                            <ModalBody>
                                <Input type="text" label="Name" placeholder="Enter the Payment Method Name"
                                    onChange={(e) => {
                                        setPaymentMethodName(e.target.value);
                                        setIsValid(e.target.value.length > 0);
                                    }}
                                    value={paymentMethodName}
                                    isInvalid={!isValid}
                                />
                                Select the emoji <EmojiPicker defaultIcon={selectedEmoji} onChange={setSelectedEmoji} />

                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={onClose} isDisabled={!isValid}>
                                    {mode === "create" ? "Create" : "Update"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );

}
export default PaymentMethod

import React, {useEffect} from 'react'
import {Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from "@nextui-org/react";
import {Input} from "@nextui-org/input";
import EmojiPicker from "@/components/EmojiPicker";



const PaymentMethod = ({paymentMethodId, isOpen, onOpen, onOpenChange}:{paymentMethodId?:string,isOpen:boolean, onOpen:()=>void, onOpenChange:()=>void}) => {

    const [selectedEmoji, setSelectedEmoji] = React.useState<string >("");
    const [paymentMethodName, setPaymentMethodName] = React.useState<string>("");

    return (
        <>
            <Button onPress={onOpen}>Open Modal</Button>
            <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" scrollBehavior="outside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Create a payment method</ModalHeader>
                            <ModalBody>
                                <Input type="text" label="Name" placeholder="Enter the Payment Method Name"
                                       onChange={(e)=>setPaymentMethodName(e.target.value)}
                                       value={paymentMethodName}

                                />
                                Select the emoji <EmojiPicker defaultIcon={selectedEmoji} onChange={setSelectedEmoji}/>

                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Close
                                </Button>
                                <Button color="primary" onPress={onClose}>
                                    Action
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

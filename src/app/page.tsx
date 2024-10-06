"use client"
import { Button } from "@nextui-org/button";
import { FaMoneyBill } from "react-icons/fa";
import EmojiPicker from "@/components/EmojiPicker";
import PaymentMethod from "@/components/modals/PaymentMethod";
import {useDisclosure} from "@nextui-org/react";

export default function Page() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();

    const handleEmojiChange = (newEmoji: string) => {
    console.log("New emoji selected:", newEmoji);
    // Do something with the new emoji
  };

  return (
    <div>
      <Button color="success" endContent={<FaMoneyBill />}>
        Add a new record
      </Button>
      <EmojiPicker defaultIcon="🚫" onChange={handleEmojiChange} />
        <PaymentMethod isOpen={isOpen} onOpen={onOpen} onOpenChange={onOpenChange}/>
    </div>
  );
}

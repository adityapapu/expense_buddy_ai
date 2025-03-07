import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  SelectItem
} from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import EmojiPicker from "../EmojiPicker";
import { createCategory, updateCategory } from "../../server/services/categoryService";
import { useToast } from "../../hooks/use-toast";
import { type Category, TransactionType } from "@prisma/client";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  category: Category | null;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string>("🏷️");
  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryType, setCategoryType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [isValid, setIsValid] = useState<boolean>(true);
  const { toast } = useToast();
  const [categoryNameErrorMessage, setCategoryNameErrorMessage] = useState<string>("");
  const [pending, setPending] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setCategoryName(category.name);
        setSelectedEmoji(category.icon);
        setCategoryType(category.type);
      } else {
        setCategoryName("");
        setSelectedEmoji("🏷️");
        setCategoryType(TransactionType.EXPENSE);
      }
      setIsValid(true);
      setCategoryNameErrorMessage("");
    }
  }, [isOpen, category]);

  const handleSubmit = async () => {
    if (categoryName && selectedEmoji) {
      try {
        setPending(true);
        const response = category
          ? await updateCategory({
              id: category.id,
              name: categoryName,
              icon: selectedEmoji,
              type: categoryType,
            })
          : await createCategory({
              name: categoryName,
              icon: selectedEmoji,
              type: categoryType,
            });

        if (response.success && response.category) {
          toast({
            title: category ? "Category updated" : "Category created",
            description: "You can now use this category",
          });
          onSave(response.category);
          onClose();
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: category ? "Failed to update category" : "Failed to create category",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
        });
        setCategoryNameErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
        setIsValid(false);
      } finally {
        setPending(false);
      }
    } else {
      setIsValid(false);
      setCategoryNameErrorMessage("Please enter a valid name and select an icon");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" scrollBehavior="outside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {category ? "Edit category" : "Create a category"}
        </ModalHeader>
        <ModalBody>
          <Input
            type="text"
            label="Name"
            placeholder="Enter the Category Name"
            onChange={(e) => {
              setCategoryName(e.target.value);
              setIsValid(e.target.value.length > 0);
            }}
            value={categoryName}
            isInvalid={!isValid}
            errorMessage={categoryNameErrorMessage}
            className="mb-4"
          />
          
          <div className="mb-4">
            <Select 
              label="Type" 
              placeholder="Select category type"
              selectedKeys={[categoryType]}
              onChange={(e) => setCategoryType(e.target.value as TransactionType)}
              className="w-full"
            >
              <SelectItem key={TransactionType.EXPENSE} value={TransactionType.EXPENSE}>
                Expense
              </SelectItem>
              <SelectItem key={TransactionType.INCOME} value={TransactionType.INCOME}>
                Income
              </SelectItem>
            </Select>
          </div>

          <div className="mb-2">
            <p className="text-sm mb-2">Select an icon</p>
            <EmojiPicker
              defaultIcon={selectedEmoji}
              onChange={setSelectedEmoji}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isDisabled={!isValid || !categoryName}
            isLoading={pending}
          >
            {category ? "Update" : "Create"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CategoryModal;
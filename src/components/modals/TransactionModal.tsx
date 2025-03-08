"use client";

import React, { useCallback, useState, useEffect } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Input,
  Textarea,
  useDisclosure,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardHeader,
  type Selection
} from "@heroui/react";
import { useToast } from "@/hooks/use-toast";
import { TransactionType } from "@prisma/client";
import { createTransaction, updateTransaction } from "@/server/services/transactionService";
import { listCategories } from "@/server/services/categoryService";
import { listPaymentMethods } from "@/server/services/paymentMethodService";
import TagSelector from "@/components/TagSelector";
import { format } from "date-fns";
import { getCurrentUser } from "@/server/services/userService";
import SplitDetails from "@/components/SplitDetails";
import { listFriendsAndRequests } from "@/server/services/friendService";

interface TransactionModalProps {
  transaction?: any;
  isOpen?: boolean;
  onClose?: () => void;
  onTransactionCreated?: () => void;
  onTransactionUpdated?: () => void;
  mode?: "view" | "edit" | null;
}

export default function TransactionModal({
  transaction,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  onTransactionCreated,
  onTransactionUpdated,
  mode = null
}: TransactionModalProps) {
  const { toast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure({
    isOpen: externalIsOpen,
    onClose: externalOnClose
  });

  // Form state
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [transactionDate, setTransactionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Current user state for participants
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Participant state
  const [participantType, setParticipantType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [participantAmount, setParticipantAmount] = useState("");
  const [participantDescription, setParticipantDescription] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState("");
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  
  // Data for dropdowns
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [splits, setSplits] = useState<any[]>([]);

  useEffect(() => {
    // Fetch current user
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      }
    };
    
    // Fetch categories and payment methods
    const fetchData = async () => {
      try {
        const friendsResponse = await listFriendsAndRequests();
        if (friendsResponse.success) {
          setFriends(friendsResponse.friends || []);
        }

        const categoriesResponse = await listCategories({ pageSize: 100 });
        if (categoriesResponse.success && categoriesResponse.categories) {
          setCategories(categoriesResponse.categories);
          
          // Filter categories based on transaction type
          const filteredCategories = categoriesResponse.categories.filter(
            cat => cat.type === participantType
          );
          
          // Auto select first category if none selected and filtered categories exist
          if (!selectedCategoryId && filteredCategories.length > 0) {
            setSelectedCategoryId(filteredCategories[0]?.id || "");
          }
        }

        const paymentMethodsResponse = await listPaymentMethods({ pageSize: 100 });
        if (paymentMethodsResponse.success && paymentMethodsResponse.paymentMethods) {
          setPaymentMethods(paymentMethodsResponse.paymentMethods);
          // Auto select first payment method if none selected and payment methods exist
          if (!selectedPaymentMethodId && paymentMethodsResponse.paymentMethods.length > 0) {
            setSelectedPaymentMethodId(paymentMethodsResponse.paymentMethods[0]?.id || "");
          }
        }
      } catch (error) {
        console.error("Failed to fetch form data:", error);
      }
    };

    fetchUser();
    fetchData();
  }, [participantType]);

  useEffect(() => {
    // Set read-only mode based on the mode prop
    setIsReadOnly(mode === "view");
    
    // Initialize form with transaction data if editing or viewing
    if (transaction) {
      setDescription(transaction.description);
      setTotalAmount(transaction.totalAmount.toString());
      setTransactionDate(format(new Date(transaction.date), "yyyy-MM-dd"));
      setReferenceNumber(transaction.referenceNumber || "");
      setNotes(transaction.notes || "");
      
      // If there are participants, set the first one's data
      if (transaction.participants && transaction.participants.length > 0) {
        const participant = transaction.participants[0];
        setParticipantType(participant.type);
        setParticipantAmount(participant.amount.toString());
        setParticipantDescription(participant.description || "");
        setSelectedCategoryId(participant.categoryId);
        setSelectedPaymentMethodId(participant.paymentMethodId);
        setSelectedTags(participant.tags || []);
      }
    } else {
      // Default values for new transaction
      resetForm();
    }
  }, [transaction, mode, isOpen]);

  const resetForm = useCallback(() => {
    setDescription("");
    setTotalAmount("");
    setTransactionDate(format(new Date(), "yyyy-MM-dd"));
    setReferenceNumber("");
    setNotes("");
    setParticipantType(TransactionType.EXPENSE);
    setParticipantAmount("");
    setParticipantDescription("");
    setSelectedTags([]);
    setErrors({});
  }, []);

  const handleClose = useCallback(() => {
    if (externalOnClose) {
      externalOnClose();
    } else {
      onClose();
    }
    
    if (!transaction) {
      resetForm();
    }
  }, [externalOnClose, onClose, resetForm, transaction]);

  const validateForm = () => {
    const formErrors: Record<string, string> = {};
    
    if (!description.trim()) {
      formErrors.description = "Description is required";
    }
    
    if (!totalAmount.trim() || isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
      formErrors.totalAmount = "Valid amount is required";
    }
    
    if (!transactionDate) {
      formErrors.date = "Date is required";
    }
    
    if (!selectedCategoryId) {
      formErrors.category = "Category is required";
    }
    
    if (!selectedPaymentMethodId) {
      formErrors.paymentMethod = "Payment method is required";
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;
    if (!validateForm()) return;
    if (!currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "User information not available. Please try again."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare all participants data including splits
      const participants = [
        {
          userId: currentUser.id,
          amount: totalAmount, // Use totalAmount instead of participantAmount
          type: participantType,
          categoryId: selectedCategoryId,
          paymentMethodId: selectedPaymentMethodId,
          description: participantDescription,
          tagIds: selectedTags.map(tag => tag.id)
        },
        ...splits.map(split => ({
          userId: split.userId,
          amount: split.splitAmount,
          splitAmount: split.splitAmount,
          splitType: split.splitType,
          splitValue: split.splitValue,
          type: participantType === TransactionType.EXPENSE ? TransactionType.EXPENSE : TransactionType.INCOME,
          categoryId: selectedCategoryId,
          paymentMethodId: selectedPaymentMethodId,
          description: `Split: ${description}`
        }))
      ];
      
      let response;
      
      if (transaction) {
        // Update existing transaction
        const updateData = {
          id: transaction.id,
          description,
          totalAmount,
          date: transactionDate,
          referenceNumber,
          notes,
          participants
        };
        
        response = await updateTransaction(updateData);
      } else {
        // Create new transaction
        const createData = {
          description,
          totalAmount,
          date: transactionDate,
          referenceNumber,
          notes,
          participants
        };
        
        response = await createTransaction(createData);
      }
      
      if (response.success) {
        toast({
          title: "Success",
          description: transaction
            ? "Transaction updated successfully."
            : "Transaction created successfully."
        });
        
        if (transaction) {
          onTransactionUpdated?.();
        } else {
          resetForm();
          if (!externalIsOpen) handleClose();
          onTransactionCreated?.();
        }
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "An error occurred."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-sync the total and participant amounts for new transactions
  useEffect(() => {
    if (!transaction) { // Only for new transactions
      if (totalAmount && !participantAmount) {
        setParticipantAmount(totalAmount);
      } else if (participantAmount && !totalAmount) {
        setTotalAmount(participantAmount);
      }
    }
  }, [totalAmount, participantAmount, transaction]);
  
  const renderModalTrigger = () => {
    if (externalIsOpen !== undefined) return null;
    
    return (
      <Button color="primary" onPress={onOpen}>
        New Transaction
      </Button>
    );
  };

  const handleTransactionTypeChange = (type: TransactionType) => {
    setParticipantType(type);
    
    // Clear the category when type changes since categories are type-specific
    setSelectedCategoryId("");
  };
  
  const handleTagChange = (newTags: any[]) => {
    setSelectedTags(newTags);
  };

  const handleSplitUpdate = (newSplits: any[]) => {
    setSplits(newSplits);
  };

  const handleCategorySelect = (keys: Selection) => {
    const selectedKey = Array.from(keys).join(",");
    if (selectedKey) {
      setSelectedCategoryId(selectedKey);
      setErrors(prev => ({ ...prev, category: "" }));
    }
  };

  const handlePaymentMethodSelect = (keys: Selection) => {
    const selectedKey = Array.from(keys).join(",");
    if (selectedKey) {
      setSelectedPaymentMethodId(selectedKey);
      setErrors(prev => ({ ...prev, paymentMethod: "" }));
    }
  };

  const filteredCategories = categories.filter(
    category => category.type === participantType
  );

  return (
    <>
      {renderModalTrigger()}
      
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose}
        placement="center"
        backdrop="blur"
        size="3xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {transaction 
                  ? isReadOnly 
                    ? "View Transaction" 
                    : "Edit Transaction"
                  : "Create New Transaction"
                }
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6">
                  {/* Transaction Basic Details */}
                  <Card>
                    <CardHeader className="pb-0">
                      <h3 className="text-lg font-medium">Transaction Details</h3>
                    </CardHeader>
                    <CardBody className="gap-4">
                      <Input
                        label="Description"
                        placeholder="Enter transaction description"
                        value={description}
                        onValueChange={setDescription}
                        isInvalid={!!errors.description}
                        errorMessage={errors.description}
                        isRequired
                        isReadOnly={isReadOnly}
                      />
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <Input
                          type="number"
                          label="Total Amount"
                          placeholder="Enter total amount"
                          value={totalAmount}
                          onValueChange={setTotalAmount}
                          isInvalid={!!errors.totalAmount}
                          errorMessage={errors.totalAmount}
                          isRequired
                          startContent={
                            <div className="pointer-events-none flex items-center">
                              <span className="text-default-400 text-small">$</span>
                            </div>
                          }
                          isReadOnly={isReadOnly}
                          className="md:w-1/2"
                        />
                        
                        <Input
                          type="date"
                          label="Date"
                          placeholder="Select date"
                          value={transactionDate}
                          onValueChange={setTransactionDate}
                          isInvalid={!!errors.date}
                          errorMessage={errors.date}
                          isRequired
                          isReadOnly={isReadOnly}
                          className="md:w-1/2"
                        />
                      </div>

                      <div className="flex flex-col md:flex-row gap-4">
                        <Input
                          label="Reference Number"
                          placeholder="Enter reference number (optional)"
                          value={referenceNumber}
                          onValueChange={setReferenceNumber}
                          isReadOnly={isReadOnly}
                          className="md:w-1/2"
                        />
                      </div>
                      
                      <Textarea
                        label="Notes"
                        placeholder="Enter additional notes (optional)"
                        value={notes}
                        onValueChange={setNotes}
                        isReadOnly={isReadOnly}
                      />
                    </CardBody>
                  </Card>
                  
                  {/* Entry Details */}
                  <Card>
                    <CardHeader className="pb-0">
                      <h3 className="text-lg font-medium">Entry Details</h3>
                    </CardHeader>
                    <CardBody className="gap-4">
                      <div className="flex gap-2 mb-2">
                        <Button
                          color={participantType === TransactionType.EXPENSE ? "danger" : "default"}
                          onPress={() => handleTransactionTypeChange(TransactionType.EXPENSE)}
                          fullWidth
                          disabled={isReadOnly}
                          variant={participantType === TransactionType.EXPENSE ? "solid" : "flat"}
                        >
                          Expense
                        </Button>
                        <Button
                          color={participantType === TransactionType.INCOME ? "success" : "default"}
                          onPress={() => handleTransactionTypeChange(TransactionType.INCOME)}
                          fullWidth
                          disabled={isReadOnly}
                          variant={participantType === TransactionType.INCOME ? "solid" : "flat"}
                        >
                          Income
                        </Button>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <Input
                          label="Description (Optional)"
                          placeholder="Additional details about this entry"
                          value={participantDescription}
                          onValueChange={setParticipantDescription}
                          isReadOnly={isReadOnly}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4">
                        <Select
                          label="Category"
                          placeholder="Select a category"
                          selectedKeys={selectedCategoryId ? [selectedCategoryId] : []}
                          onSelectionChange={handleCategorySelect}
                          isInvalid={!!errors.category}
                          errorMessage={errors.category}
                          isRequired
                          isDisabled={isReadOnly || filteredCategories.length === 0}
                          className="md:w-1/2"
                          aria-label="Select a category"
                          selectionMode="single"
                        >
                          {filteredCategories.length > 0 ? (
                            filteredCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem key="no-categories" isDisabled>
                              No categories available for this type
                            </SelectItem>
                          )}
                        </Select>
                        
                        <Select
                          label="Payment Method"
                          placeholder="Select a payment method"
                          selectedKeys={selectedPaymentMethodId ? [selectedPaymentMethodId] : []}
                          onSelectionChange={handlePaymentMethodSelect}
                          isInvalid={!!errors.paymentMethod}
                          errorMessage={errors.paymentMethod}
                          isRequired
                          isDisabled={isReadOnly || paymentMethods.length === 0}
                          className="md:w-1/2"
                          aria-label="Select a payment method"
                          selectionMode="single"
                        >
                          {paymentMethods.map((paymentMethod) => (
                            <SelectItem key={paymentMethod.id} value={paymentMethod.id}>
                              {paymentMethod.name}
                            </SelectItem>
                          ))}
                        </Select>
                      </div>
                      
                      <div>
                        <p className="text-small mb-1">Tags</p>
                        <TagSelector 
                          selectedTags={selectedTags} 
                          onTagsChange={handleTagChange}
                          maxTags={5}
                          placeholder="Add tags..."
                          className={isReadOnly ? "opacity-70 pointer-events-none" : ""}
                        />
                      </div>
                    </CardBody>
                  </Card>

                  {/* Split Details */}
                  {participantType === TransactionType.EXPENSE && (
                    <Card>
                      <CardHeader className="pb-0">
                        <h3 className="text-lg font-medium">Split Details</h3>
                      </CardHeader>
                      <CardBody>
                        <SplitDetails
                          friends={friends}
                          totalAmount={parseFloat(totalAmount) || 0}
                          onSplitUpdate={handleSplitUpdate}
                          isReadOnly={isReadOnly}
                          initialSplits={transaction?.participants.filter((p: any) => p.userId !== currentUser?.id) || []}
                          currentUser={currentUser}
                        />
                      </CardBody>
                    </Card>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={handleClose}>
                  {isReadOnly ? "Close" : "Cancel"}
                </Button>
                {!isReadOnly && (
                  <Button 
                    color="primary"
                    onPress={handleSubmit}
                    isLoading={isSubmitting}
                  >
                    {transaction ? "Save" : "Create"}
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
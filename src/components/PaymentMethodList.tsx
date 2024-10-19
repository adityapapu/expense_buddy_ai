"use client";

import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  useDisclosure,
} from "@nextui-org/react";
import { EditIcon, DeleteIcon } from "./icons";
import PaymentMethodModal from "./modals/PaymentMethod";
import ConfirmationModal from "./modals/ConfirmationModal";
import { useToast } from "../hooks/use-toast";
import { PaymentMethod } from "@prisma/client";
import { deletePaymentMethod } from "../server/services/paymentMethodService";

interface Column {
  uid: string;
  name: string;
}

const columns: Column[] = [
  { uid: "name", name: "Name" },
  { uid: "icon", name: "Icon" },
  { uid: "actions", name: "Actions" },
];

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  onUpdate: (updatedMethod: PaymentMethod) => void;
  onDeleteSuccess: (deletedMethodId: string) => void;
}

const PaymentMethodList: React.FC<PaymentMethodListProps> = ({ paymentMethods, onUpdate, onDeleteSuccess }) => {
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const { toast } = useToast();

  const handleEdit = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onEditOpen();
  };

  const handleDeleteConfirmation = (method: PaymentMethod) => {
    setSelectedMethod(method);
    onDeleteOpen();
  };

  const handleDelete = async () => {
    if (selectedMethod) {
      try {
        const result = await deletePaymentMethod(selectedMethod.id);
        if (result.success) {
          onDeleteSuccess(selectedMethod.id);
          toast({
            title: "Payment method deleted",
            description: "The payment method has been successfully deleted",
          });
        } else {
          throw new Error(result.message);
        }
        onDeleteClose();
      } catch (error) {
        console.error(error);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: error instanceof Error ? error.message : "Failed to delete the payment method. Please try again later.",
        });
      }
    }
  };

  const handleSave = (updatedMethod: PaymentMethod) => {
    onUpdate(updatedMethod);
    onEditClose();
  };

  const renderCell = React.useCallback(
    (method: PaymentMethod, columnKey: React.Key) => {
      const key = String(columnKey);
      const cellValue = method[key as keyof PaymentMethod];
      switch (key) {
        case "icon":
          return cellValue ?? "🚫";
        case "actions":
          return (
            <div className="flex items-center justify-center gap-5">
              <Tooltip content="Edit Payment Method">
                <span className="cursor-pointer" onClick={() => handleEdit(method)}>
                  <EditIcon />
                </span>
              </Tooltip>
              <Tooltip color="danger" content="Delete Payment Method">
                <span className="cursor-pointer" onClick={() => handleDeleteConfirmation(method)}>
                  <DeleteIcon />
                </span>
              </Tooltip>
            </div>
          );
        default:
          return <>{cellValue}</>;
      }
    },
    [handleEdit, handleDeleteConfirmation],
  );

  return (
    <>
      <Table aria-label="Payment Methods Table">
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={paymentMethods}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaymentMethodModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        onSave={handleSave}
        paymentMethod={selectedMethod}
      />
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title="Delete Payment Method"
        message="Are you sure you want to delete this payment method? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default PaymentMethodList;

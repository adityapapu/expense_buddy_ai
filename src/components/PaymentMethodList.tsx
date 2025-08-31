"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Tooltip,
  useDisclosure,
  Spinner,
  getKeyValue,
  Input,
  Button
} from "@heroui/react";
import { EditIcon, DeleteIcon } from "./icons";
import PaymentMethodModal from "./modals/PaymentMethod";
import ConfirmationModal from "./modals/ConfirmationModal";
import { useToast } from "../hooks/use-toast";
import { type PaymentMethod } from "@prisma/client";
import { deletePaymentMethod, listPaymentMethods } from "../server/services/paymentMethodService";
import { useAsyncList } from "@react-stately/data";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import useDebounce from "@/hooks/useDebounce";

interface Column {
  uid: string;
  name: string;
}

const columns: Column[] = [
  { uid: "name", name: "Name" },
  { uid: "icon", name: "Icon" },
  { uid: "actions", name: "Actions" },
];

const ITEMS_PER_PAGE = 10;

interface PaymentMethodListProps {
  initialPaymentMethods?: PaymentMethod[];
}

const PaymentMethodList: React.FC<PaymentMethodListProps> = ({ initialPaymentMethods = [] }) => {
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<React.Key>>(new Set());
  const { toast } = useToast();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [filterValue, setFilterValue] = useState("");
  const debouncedFilterValue = useDebounce(filterValue, 300);
  const initialLoadRef = useRef(true);

  const load = useCallback(async ({ cursor }: { cursor?: string }) => {
    try {
      // For initial load, use the provided data if available and no filter is applied
      if (!cursor && initialPaymentMethods.length > 0 && !debouncedFilterValue) {
        setHasMore(initialPaymentMethods.length >= ITEMS_PER_PAGE);
        return {
          items: initialPaymentMethods,
          cursor: initialPaymentMethods.length >= ITEMS_PER_PAGE 
            ? initialPaymentMethods[initialPaymentMethods.length - 1]?.id 
            : undefined,
        };
      }

      const response = await listPaymentMethods({
        cursor,
        pageSize: ITEMS_PER_PAGE,
        filters: { name: debouncedFilterValue.trim() }
      });

      if (!response.success) throw new Error(response.message);

      setHasMore(!!response.nextCursor);
      return {
        items: response.paymentMethods ?? [],
        cursor: response.nextCursor ?? undefined,
      };
    } catch (error) {
      console.error("Failed to fetch payment methods:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load payment methods. Please try again later.",
      });
      return { items: [] };
    }
  }, [debouncedFilterValue, toast, initialPaymentMethods]);

  const list = useAsyncList<PaymentMethod>({ load });

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    list.reload();
  }, [debouncedFilterValue]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: () => list.loadMore(),
  });

  const handleEdit = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
    onEditOpen();
  }, [onEditOpen]);

  const handleDeleteConfirmation = useCallback((method: PaymentMethod) => {
    setSelectedMethod(method);
    onDeleteOpen();
  }, [onDeleteOpen]);

  const handleDelete = async () => {
    if (!selectedMethod) return;
    try {
      const result = await deletePaymentMethod(selectedMethod.id);
      if (result.success) {
        list.remove(selectedMethod.id);
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
  };

  const handleBulkDelete = useCallback(async () => {
    if (selectedKeys.size === 0) return;
    try {
      const selectedIds = Array.from(selectedKeys);
      await Promise.all(selectedIds.map(async (id) => {
        const result = await deletePaymentMethod(id as string);
        if (result.success) {
          list.remove(id as string);
        } else {
          throw new Error(result.message);
        }
      }));
      toast({
        title: "Payment methods deleted",
        description: "The selected payment methods have been successfully deleted",
      });
      setSelectedKeys(new Set());
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Failed to delete the payment methods. Please try again later.",
      });
    }
  }, [list, selectedKeys, toast]);

  const handleSave = (updatedMethod: PaymentMethod) => {
    list.update(updatedMethod.id, updatedMethod);
    onEditClose();
  };

  const handleAdd = (newMethod: PaymentMethod) => {
    list.insert(0, newMethod);
    onAddClose();
  };

  const renderActionsCell = useCallback(
    (method: PaymentMethod) => (
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
    ),
    [handleEdit, handleDeleteConfirmation],
  );

  const renderCell = useCallback(
    (method: PaymentMethod, columnKey: React.Key) => {
      if (columnKey === "actions") return renderActionsCell(method);
      return getKeyValue(method, columnKey as keyof PaymentMethod) as React.ReactNode;
    },
    [renderActionsCell],
  );

  const onSearchChange = useCallback((value = "") => {
    setFilterValue(value);
  }, []);

  const topContent = useMemo(() => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search by name..."
          value={filterValue}
          onClear={() => onSearchChange("")}
          onValueChange={onSearchChange}
        />
        {selectedKeys.size > 0 && (
          <Button color="danger" onPress={handleBulkDelete}>
            Delete Selected
          </Button>
        )}
        <Button color="primary" onPress={onAddOpen}>
          Add New Payment Method
        </Button>
      </div>
    </div>
  ), [filterValue, onSearchChange, onAddOpen, handleBulkDelete, selectedKeys]);

  const onSelectionChange = useCallback((keys: "all" | Set<React.Key>) => {
    if (keys === "all") {
      setSelectedKeys(new Set(list.items.map((item) => item.id)));
    } else {
      setSelectedKeys(keys);
    }
  }, [list.items]);

  return (
    <>
      <Table
        aria-label="Payment Methods Table"
        baseRef={scrollerRef}
        topContent={topContent}
        selectionMode="multiple"
        selectedKeys={selectedKeys as any}
        onSelectionChange={onSelectionChange}
        classNames={{
          base: "max-h-[520px] overflow-scroll",
          table: "min-h-[200px]", // Reduced minimum height
          tbody: "overflow-auto",
          th: "py-2 text-sm", // Reduced header padding
          td: "py-1.5", // Reduced cell padding
          tr: "h-12", // Set fixed row height
        }}
        layout="auto" // Let the table adjust based on content
        bottomContent={hasMore && !list.isLoading ? (
          <div className="flex w-full justify-center">
            <Spinner ref={loaderRef} color="white" size="sm" />
          </div>
        ) : null}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "center" : "start"}
              className="text-xs md:text-sm" // Responsive text size
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={list.items}
          isLoading={list.isLoading && !initialLoadRef.current}
          loadingContent={<Spinner color="primary" size="sm" />}
          emptyContent="No payment methods found"
        >
          {(item) => (
            <TableRow key={item.id} className="hover:bg-default-100 transition-colors">
              {(columnKey) => (
                <TableCell className="text-xs md:text-sm">
                  {renderCell(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
      <PaymentMethodModal
        isOpen={isEditOpen || isAddOpen}
        onClose={isEditOpen ? onEditClose : onAddClose}
        onSave={isEditOpen ? handleSave : handleAdd}
        paymentMethod={isEditOpen ? selectedMethod : null}
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

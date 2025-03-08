"use client";

import React, { useCallback, useState, useMemo, useRef, useEffect } from "react";
import { useAsyncList } from "@react-stately/data";
import {
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell, 
  Input,
  Button,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Chip,
  Tooltip,
  Card,
  CardBody
} from "@heroui/react";
import useDebounce from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";
import { TransactionType } from "@prisma/client";
import { listTransactions, deleteTransaction } from "@/server/services/transactionService";
import { EditIcon, DeleteIcon, EyeIcon } from "./icons";
import { useInfiniteScroll } from "@heroui/use-infinite-scroll";
import { format } from "date-fns";
import TransactionModal from "./modals/TransactionModal";
import ConfirmationModal from "./modals/ConfirmationModal";

const ITEMS_PER_PAGE = 10;

type TransactionSummary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

interface TransactionListProps {
  initialTransactions?: any[];
}

export default function TransactionList({ initialTransactions = [] }: TransactionListProps) {
  const { toast } = useToast();
  const [filterValue, setFilterValue] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState<"view" | "edit" | null>(null);
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const [dateRange, setDateRange] = useState<{ startDate?: Date; endDate?: Date }>({});
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });

  const initialLoadRef = useRef(true);
  const debouncedFilterValue = useDebounce(filterValue, 300);

  const { 
    isOpen: isTransactionModalOpen, 
    onOpen: onTransactionModalOpen, 
    onClose: onTransactionModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();

  const onSearchChange = useCallback((value: string) => {
    setFilterValue(value);
  }, []);

  // Build filters object for API call
  const getFilters = useCallback(() => {
    const filters: any = {};
    
    if (debouncedFilterValue) {
      filters.searchTerm = debouncedFilterValue;
    }
    
    if (typeFilter !== "ALL") {
      filters.type = typeFilter;
    }
    
    if (dateRange.startDate) {
      filters.startDate = dateRange.startDate;
    }
    
    if (dateRange.endDate) {
      filters.endDate = dateRange.endDate;
    }
    
    return filters;
  }, [debouncedFilterValue, typeFilter, dateRange]);

  const load = useCallback(async ({ cursor }: { cursor?: string }) => {
    try {
      // For initial load, use the provided data if available and no filters are applied
      if (!cursor && initialTransactions.length > 0 && !debouncedFilterValue && 
          typeFilter === "ALL" && !dateRange.startDate && !dateRange.endDate) {
        setHasMore(initialTransactions.length >= ITEMS_PER_PAGE);
        return {
          items: initialTransactions,
          cursor: initialTransactions.length >= ITEMS_PER_PAGE 
            ? initialTransactions[initialTransactions.length - 1].id 
            : undefined,
        };
      }

      const filters = getFilters();
      const response = await listTransactions({
        cursor,
        pageSize: ITEMS_PER_PAGE,
        filters,
        sortBy: 'date',
        sortOrder: 'desc'
      });

      if (response.success && response.transactions) {
        const hasNextPage = response.nextCursor !== null;
        setHasMore(hasNextPage);
        
        // Update summary data
        if (response.summary) {
          setSummary(response.summary);
        }
        
        return {
          items: response.transactions,
          cursor: response.nextCursor || undefined,
        };
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load transactions. Please try again later.",
      });
      return { items: [] };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load transactions. Please try again later.",
      });
      return { items: [] };
    }
  }, [debouncedFilterValue, toast, initialTransactions, typeFilter, dateRange, getFilters]);

  const list = useAsyncList<any>({ load });

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    list.reload();
  }, [debouncedFilterValue, typeFilter, dateRange]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: () => list.loadMore(),
  });

  const handleView = useCallback((transaction: any) => {
    setSelectedTransaction(transaction);
    setViewMode("view");
    onTransactionModalOpen();
  }, [onTransactionModalOpen]);

  const handleEdit = useCallback((transaction: any) => {
    setSelectedTransaction(transaction);
    setViewMode("edit");
    onTransactionModalOpen();
  }, [onTransactionModalOpen]);

  const handleDeleteConfirmation = useCallback((transaction: any) => {
    setSelectedTransaction(transaction);
    onDeleteOpen();
  }, [onDeleteOpen]);

  const handleDelete = async () => {
    if (!selectedTransaction) return;
    try {
      const response = await deleteTransaction(selectedTransaction.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Transaction deleted successfully.",
        });
        list.reload();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to delete transaction.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      onDeleteClose();
    }
  };

  const handleTransactionUpdated = useCallback(() => {
    list.reload();
    onTransactionModalClose();
  }, [list, onTransactionModalClose]);
  
  const handleTransactionCreated = useCallback(() => {
    list.reload();
  }, [list]);

  const onTypeFilterChange = useCallback((value: TransactionType | "ALL") => {
    setTypeFilter(value);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const summarySection = useMemo(() => (
    <Card className="mb-4">
      <CardBody>
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-small text-default-500">Income</p>
            <p className="text-xl font-semibold text-success">{formatCurrency(summary.totalIncome)}</p>
          </div>
          <div>
            <p className="text-small text-default-500">Expenses</p>
            <p className="text-xl font-semibold text-danger">{formatCurrency(summary.totalExpense)}</p>
          </div>
          <div>
            <p className="text-small text-default-500">Balance</p>
            <p className={`text-xl font-semibold ${summary.balance >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  ), [summary]);

  const topContent = useMemo(() => (
    <>
      {summarySection}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-3 items-start sm:items-end">
          <div className="w-full sm:w-auto sm:flex-1 min-w-[200px]">
            <Input
              isClearable
              className="w-full"
              placeholder="Search by description..."
              value={filterValue}
              onClear={() => onSearchChange("")}
              onValueChange={onSearchChange}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              color={typeFilter === "ALL" ? "primary" : "default"} 
              size="sm"
              onPress={() => onTypeFilterChange("ALL")}
            >
              All
            </Button>
            <Button 
              color={typeFilter === TransactionType.EXPENSE ? "primary" : "default"} 
              size="sm"
              onPress={() => onTypeFilterChange(TransactionType.EXPENSE)}
            >
              Expenses
            </Button>
            <Button 
              color={typeFilter === TransactionType.INCOME ? "primary" : "default"} 
              size="sm"
              onPress={() => onTypeFilterChange(TransactionType.INCOME)}
            >
              Income
            </Button>
          </div>
          <div>
            <TransactionModal onTransactionCreated={handleTransactionCreated} />
          </div>
        </div>
        {/* We can add a date range picker and additional filters here later */}
      </div>
    </>
  ), [filterValue, onSearchChange, handleTransactionCreated, typeFilter, onTypeFilterChange, summarySection]);

  const renderCell = useCallback((transaction: any, columnKey: string) => {
    switch (columnKey) {
      case "date":
        return <div>{format(new Date(transaction.date), 'MMM d, yyyy')}</div>;
      
      case "description":
        return <div className="font-medium">{transaction.description}</div>;
      
      case "amount": {
        const totalAmount = parseFloat(transaction.totalAmount.toString());
        const isExpense = transaction.participants.some((p: any) => p.type === TransactionType.EXPENSE);
        return (
          <div className={isExpense ? 'text-danger' : 'text-success'}>
            {isExpense ? '- ' : '+ '}
            {formatCurrency(totalAmount)}
          </div>
        );
      }
      
      case "categories": {
        const categories = [...new Set(transaction.participants.map((p: any) => p.category.name))];
        return (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, 2).map((cat, i) => (
              <Chip key={i} size="sm" variant="flat">{cat}</Chip>
            ))}
            {categories.length > 2 && (
              <Tooltip content={categories.slice(2).join(', ')}>
                <Chip size="sm" variant="flat">+{categories.length - 2}</Chip>
              </Tooltip>
            )}
          </div>
        );
      }
      
      case "actions":
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button isIconOnly size="sm" variant="light" onPress={() => handleView(transaction)}>
              <EyeIcon />
            </Button>
            <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(transaction)}>
              <EditIcon />
            </Button>
            <Button isIconOnly size="sm" variant="light" onPress={() => handleDeleteConfirmation(transaction)}>
              <DeleteIcon />
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  }, [handleView, handleEdit, handleDeleteConfirmation]);

  return (
    <div className="w-full">
      <Table
        aria-label="Transactions table"
        bottomContent={
          hasMore ? (
            <div className="flex w-full justify-center">
              <Button ref={loaderRef} isLoading variant="flat">
                Load More
              </Button>
            </div>
          ) : null
        }
        classNames={{
          base: "max-h-[600px] overflow-scroll",
          table: "min-h-[400px]",
        }}
        topContent={topContent}
        topContentPlacement="outside"
        scrollRef={scrollerRef}
        isHeaderSticky
      >
        <TableHeader>
          <TableColumn key="date">DATE</TableColumn>
          <TableColumn key="description">DESCRIPTION</TableColumn>
          <TableColumn key="amount">AMOUNT</TableColumn>
          <TableColumn key="categories">CATEGORIES</TableColumn>
          <TableColumn key="actions" align="end">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={list.items}
          isLoading={list.isLoading}
          loadingContent={<div>Loading...</div>}
          emptyContent={<div className="py-8 text-center">No transactions found</div>}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey.toString())}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedTransaction && (
        <>
          {/* Transaction View/Edit Modal */}
          <TransactionModal 
            transaction={selectedTransaction} 
            isOpen={isTransactionModalOpen} 
            onClose={onTransactionModalClose}
            onTransactionUpdated={handleTransactionUpdated}
            mode={viewMode}
          />

          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={isDeleteOpen}
            onClose={onDeleteClose}
            onConfirm={handleDelete}
            title="Delete Transaction"
            body={`Are you sure you want to delete the transaction "${selectedTransaction.description}"?`}
            confirmText="Delete"
            confirmColorScheme="danger"
          />
        </>
      )}
    </div>
  );
}
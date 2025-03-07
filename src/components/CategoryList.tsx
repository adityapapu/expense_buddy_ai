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
  Button,
  Chip
} from "@nextui-org/react";
import { EditIcon, DeleteIcon } from "./icons";
import CategoryModal from "./modals/CategoryModal";
import ConfirmationModal from "./modals/ConfirmationModal";
import { useToast } from "../hooks/use-toast";
import { type Category, TransactionType } from "@prisma/client";
import { deleteCategory, listCategories } from "../server/services/categoryService";
import { useAsyncList } from "@react-stately/data";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import useDebounce from "@/hooks/useDebounce";

interface Column {
  uid: string;
  name: string;
}

const columns: Column[] = [
  { uid: "name", name: "Name" },
  { uid: "icon", name: "Icon" },
  { uid: "type", name: "Type" },
  { uid: "actions", name: "Actions" },
];

const ITEMS_PER_PAGE = 10;

interface CategoryListProps {
  initialCategories?: Category[];
}

const CategoryList: React.FC<CategoryListProps> = ({ initialCategories = [] }) => {
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<React.Key>>(new Set());
  const { toast } = useToast();
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [filterValue, setFilterValue] = useState("");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "ALL">("ALL");
  const debouncedFilterValue = useDebounce(filterValue, 300);
  const initialLoadRef = useRef(true);

  const load = useCallback(async ({ cursor }: { cursor?: string }) => {
    try {
      // For initial load, use the provided data if available and no filters are applied
      if (!cursor && initialCategories.length > 0 && !debouncedFilterValue && typeFilter === "ALL") {
        setHasMore(initialCategories.length >= ITEMS_PER_PAGE);
        return {
          items: initialCategories,
          cursor: initialCategories.length >= ITEMS_PER_PAGE 
            ? initialCategories[initialCategories.length - 1].id 
            : undefined,
        };
      }

      const filters: { name?: string; type?: TransactionType } = {
        name: debouncedFilterValue.trim()
      };
      
      if (typeFilter !== "ALL") {
        filters.type = typeFilter;
      }

      const response = await listCategories({
        cursor,
        pageSize: ITEMS_PER_PAGE,
        filters
      });

      if (!response.success) throw new Error(response.message);

      setHasMore(!!response.nextCursor);
      return {
        items: response.categories ?? [],
        cursor: response.nextCursor ?? undefined,
      };
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load categories. Please try again later.",
      });
      return { items: [] };
    }
  }, [debouncedFilterValue, typeFilter, toast, initialCategories]);

  const list = useAsyncList<Category>({ load });

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    list.reload();
  }, [debouncedFilterValue, typeFilter]);

  const [loaderRef, scrollerRef] = useInfiniteScroll({
    hasMore,
    onLoadMore: () => list.loadMore(),
  });

  const handleEdit = useCallback((category: Category) => {
    setSelectedCategory(category);
    onEditOpen();
  }, [onEditOpen]);

  const handleDeleteConfirmation = useCallback((category: Category) => {
    setSelectedCategory(category);
    onDeleteOpen();
  }, [onDeleteOpen]);

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      const result = await deleteCategory(selectedCategory.id);
      if (result.success) {
        list.remove(selectedCategory.id);
        toast({
          title: "Category deleted",
          description: "The category has been successfully deleted",
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
        description: error instanceof Error ? error.message : "Failed to delete the category. Please try again later.",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedKeys.size === 0) return;
    try {
      const selectedIds = Array.from(selectedKeys);
      await Promise.all(selectedIds.map(async (id) => {
        const result = await deleteCategory(id as string);
        if (result.success) {
          list.remove(id as string);
        } else {
          throw new Error(result.message);
        }
      }));
      toast({
        title: "Categories deleted",
        description: "The selected categories have been successfully deleted",
      });
      setSelectedKeys(new Set());
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: error instanceof Error ? error.message : "Failed to delete the categories. Please try again later.",
      });
    }
  };

  const handleSave = (updatedCategory: Category) => {
    list.update(updatedCategory.id, updatedCategory);
    onEditClose();
  };

  const handleAdd = (newCategory: Category) => {
    list.insert(0, newCategory);
    onAddClose();
  };

  const renderActionsCell = useCallback(
    (category: Category) => (
      <div className="flex items-center justify-center gap-5">
        <Tooltip content="Edit Category">
          <span className="cursor-pointer" onClick={() => handleEdit(category)}>
            <EditIcon />
          </span>
        </Tooltip>
        <Tooltip color="danger" content="Delete Category">
          <span className="cursor-pointer" onClick={() => handleDeleteConfirmation(category)}>
            <DeleteIcon />
          </span>
        </Tooltip>
      </div>
    ),
    [handleEdit, handleDeleteConfirmation],
  );

  const renderCell = useCallback(
    (category: Category, columnKey: React.Key) => {
      switch (columnKey) {
        case "actions":
          return renderActionsCell(category);
        case "type":
          return (
            <Chip 
              color={category.type === TransactionType.EXPENSE ? "danger" : "success"}
              size="sm"
            >
              {category.type}
            </Chip>
          );
        default:
          return getKeyValue(category, columnKey as keyof Category) as React.ReactNode;
      }
    },
    [renderActionsCell],
  );

  const onSearchChange = useCallback((value = "") => {
    setFilterValue(value);
  }, []);

  const onTypeFilterChange = useCallback((value: TransactionType | "ALL") => {
    setTypeFilter(value);
  }, []);

  const topContent = useMemo(() => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-3 items-start sm:items-end">
        <div className="w-full sm:w-auto sm:flex-1 min-w-[200px]">
          <Input
            isClearable
            className="w-full"
            placeholder="Search by name..."
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
            Expense
          </Button>
          <Button 
            color={typeFilter === TransactionType.INCOME ? "primary" : "default"} 
            size="sm"
            onPress={() => onTypeFilterChange(TransactionType.INCOME)}
          >
            Income
          </Button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {selectedKeys.size > 0 && (
            <Button color="danger" onPress={handleBulkDelete} size="sm">
              Delete Selected ({selectedKeys.size})
            </Button>
          )}
          <Button color="primary" onPress={onAddOpen} className={selectedKeys.size > 0 ? "ml-auto sm:ml-2" : "ml-auto sm:ml-0"}>
            Add New
          </Button>
        </div>
      </div>
    </div>
  ), [filterValue, onSearchChange, onTypeFilterChange, typeFilter, onAddOpen, handleBulkDelete, selectedKeys]);

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
        aria-label="Categories Table"
        baseRef={scrollerRef}
        topContent={topContent}
        selectionMode="multiple"
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
        classNames={{
          base: "max-h-[520px] overflow-scroll",
          table: "min-h-[200px]",
          tbody: "overflow-auto",
          th: "py-2 text-xs sm:text-sm", // Smaller text for mobile
          td: "py-1.5 text-xs sm:text-sm", // Smaller text for mobile
          tr: "h-12",
          wrapper: "overflow-x-auto", // Allow horizontal scrolling on small screens
        }}
        layout={{
          // Adjust column widths for better mobile display
          xs: "fixed",
          sm: "auto",
        }}
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
              className="text-xs md:text-sm"
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          items={list.items}
          isLoading={list.isLoading && !initialLoadRef.current}
          loadingContent={<Spinner color="primary" size="sm" />}
          emptyContent="No categories found"
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
      <CategoryModal
        isOpen={isEditOpen || isAddOpen}
        onClose={isEditOpen ? onEditClose : onAddClose}
        onSave={isEditOpen ? handleSave : handleAdd}
        category={isEditOpen ? selectedCategory : null}
      />
      <ConfirmationModal
        isOpen={isDeleteOpen}
        onClose={onDeleteClose}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default CategoryList;
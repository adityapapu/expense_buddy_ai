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
  Chip
} from "@nextui-org/react";
import useDebounce from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";
import { type Tag } from "@prisma/client";
import { listTags, deleteTag } from "@/server/services/tagService";
import { EditIcon, DeleteIcon } from "./icons";
import { useInfiniteScroll } from "@nextui-org/use-infinite-scroll";
import TagModal from "./modals/TagModal";
import ConfirmationModal from "./modals/ConfirmationModal";

const ITEMS_PER_PAGE = 10;

interface TagListProps {
  initialTags?: Tag[];
}

export default function TagList({ initialTags = [] }: TagListProps) {
  const { toast } = useToast();
  const [filterValue, setFilterValue] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const initialLoadRef = useRef(true);
  const debouncedFilterValue = useDebounce(filterValue, 300);

  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  
  const { 
    isOpen: isDeleteOpen, 
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure();

  const onSearchChange = useCallback((value: string) => {
    setFilterValue(value);
  }, []);

  const load = useCallback(async ({ cursor }: { cursor?: string }) => {
    try {
      // For initial load, use the provided data if available and no filters are applied
      if (!cursor && initialTags.length > 0 && !debouncedFilterValue) {
        setHasMore(initialTags.length >= ITEMS_PER_PAGE);
        return {
          items: initialTags,
          cursor: initialTags.length >= ITEMS_PER_PAGE 
            ? initialTags[initialTags.length - 1].id 
            : undefined,
        };
      }

      const filters = debouncedFilterValue.trim() 
        ? { name: debouncedFilterValue.trim() } 
        : {};

      const response = await listTags({
        cursor,
        pageSize: ITEMS_PER_PAGE,
        filters
      });

      if (response.success && response.tags) {
        const hasNextPage = response.nextCursor !== null;
        setHasMore(hasNextPage);
        return {
          items: response.tags,
          cursor: response.nextCursor || undefined,
        };
      }

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tags. Please try again later.",
      });
      return { items: [] };
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tags. Please try again later.",
      });
      return { items: [] };
    }
  }, [debouncedFilterValue, toast, initialTags]);

  const list = useAsyncList<Tag>({ load });

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

  const handleEdit = useCallback((tag: Tag) => {
    setSelectedTag(tag);
    onEditOpen();
  }, [onEditOpen]);

  const handleDeleteConfirmation = useCallback((tag: Tag) => {
    setSelectedTag(tag);
    onDeleteOpen();
  }, [onDeleteOpen]);

  const handleDelete = async () => {
    if (!selectedTag) return;
    try {
      const response = await deleteTag(selectedTag.id);
      
      if (response.success) {
        toast({
          title: "Success",
          description: "Tag deleted successfully.",
        });
        list.reload();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to delete tag.",
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

  const handleTagUpdated = useCallback(() => {
    list.reload();
    onEditClose();
  }, [list, onEditClose]);
  
  const handleTagCreated = useCallback(() => {
    list.reload();
  }, [list]);

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
        <div>
          <TagModal onTagCreated={handleTagCreated} />
        </div>
      </div>
    </div>
  ), [filterValue, onSearchChange, handleTagCreated]);

  const renderCell = useCallback((tag: Tag, columnKey: string) => {
    switch (columnKey) {
      case "name":
        return <div className="font-medium">{tag.name}</div>;
      case "color":
        return tag.color ? (
          <Chip 
            style={{backgroundColor: tag.color}} 
            className="h-6 px-2"
          >
            {tag.color}
          </Chip>
        ) : <span className="text-default-400">None</span>;
      case "actions":
        return (
          <div className="flex items-center gap-2 justify-end">
            <Button isIconOnly size="sm" variant="light" onPress={() => handleEdit(tag)}>
              <EditIcon />
            </Button>
            <Button isIconOnly size="sm" variant="light" onPress={() => handleDeleteConfirmation(tag)}>
              <DeleteIcon />
            </Button>
          </div>
        );
      default:
        return null;
    }
  }, [handleEdit, handleDeleteConfirmation]);

  return (
    <div className="w-full">
      <Table
        aria-label="Tags table"
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
          base: "max-h-[520px] overflow-scroll",
          table: "min-h-[400px]",
          tr: "h-10",
          td: "py-2",
          th: "py-2"
        }}
        topContent={topContent}
        topContentPlacement="outside"
        scrollRef={scrollerRef}
        isHeaderSticky
      >
        <TableHeader>
          <TableColumn key="name">NAME</TableColumn>
          <TableColumn key="color">COLOR</TableColumn>
          <TableColumn key="actions" align="end">ACTIONS</TableColumn>
        </TableHeader>
        <TableBody
          items={list.items}
          isLoading={list.isLoading}
          loadingContent={<div>Loading...</div>}
          emptyContent={<div className="py-8 text-center">No tags found</div>}
        >
          {(item) => (
            <TableRow key={item.id} className="h-10">
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey.toString())}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedTag && (
        <>
          <TagModal 
            tag={selectedTag} 
            isOpen={isEditOpen} 
            onClose={onEditClose}
            onTagUpdated={handleTagUpdated}
          />

          <ConfirmationModal
            isOpen={isDeleteOpen}
            onClose={onDeleteClose}
            onConfirm={handleDelete}
            title="Delete Tag"
            body={`Are you sure you want to delete the tag "${selectedTag.name}"?`}
            confirmText="Delete"
            confirmColorScheme="danger"
          />
        </>
      )}
    </div>
  );
}
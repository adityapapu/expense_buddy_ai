"use client";

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { Tag as TagType } from '@prisma/client';
import { TagInput } from 'emblor';
import { useToast } from "@/hooks/use-toast";
import useDebounce from "@/hooks/useDebounce";
import { createTag, listTags } from "@/server/services/tagService";

const ITEMS_PER_PAGE = 20;

interface TagSelectorProps {
  selectedTags?: TagType[];
  onTagsChange?: (tags: TagType[]) => void;
  maxTags?: number;
  placeholder?: string;
  className?: string;
}

// Convert Prisma Tag to Emblor Tag format
const mapPrismaTagToEmblorTag = (prismaTag: TagType) => ({
  id: prismaTag.id,
  text: prismaTag.name,
  ...(prismaTag.color ? { color: prismaTag.color } : {}),
});

const TagSelector = ({
  selectedTags = [],
  onTagsChange,
  maxTags = 6,
  placeholder = "Add a tag",
  className,
}: TagSelectorProps) => {
  const { toast } = useToast();
  const [emblorTags, setEmblorTags] = useState<Array<{ id: string; text: string; color?: string }>>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<TagType[]>([]);
  const initialLoadRef = useRef(true);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Load tags from DB for autocomplete
  const loadTags = useCallback(async () => {
    if (!debouncedSearchTerm) {
      setSuggestedTags([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await listTags({
        pageSize: ITEMS_PER_PAGE,
        filters: {
          name: debouncedSearchTerm
        }
      });

      if (response.success && response.tags) {
        setSuggestedTags(response.tags);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message || "Failed to load tags",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load tags",
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, toast]);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // Initialize with selected tags
  useEffect(() => {
    if (selectedTags.length > 0) {
      setEmblorTags(selectedTags.map(mapPrismaTagToEmblorTag));
    }
  }, []);

  // Handle tag creation
  const handleCreateTag = async (tagText: string) => {
    try {
      const response = await createTag({ name: tagText });
      if (response.success && response.tag) {
        return { id: response.tag.id, text: response.tag.name };
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: response.message || "Failed to create tag",
      });
      return null;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create tag",
      });
      return null;
    }
  };

  // Prepare tag suggestions for autocomplete
  const autocompleteOptions = useMemo(() => 
    suggestedTags.map(mapPrismaTagToEmblorTag),
  [suggestedTags]);

  // Handle tags change
  const handleTagsChange = async (newTags: Array<{ id: string; text: string; color?: string }>) => {
    setEmblorTags(newTags);
    
    // Convert back to Prisma Tag format for parent component
    if (onTagsChange) {
      const updatedTags: TagType[] = newTags.map(tag => ({
        id: tag.id,
        name: tag.text,
        userId: '', // This will be filled by the server
        color: tag.color || null,
        icon: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      onTagsChange(updatedTags);
    }
  };

  // Handle search term change
  const handleInputChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <TagInput
      tags={emblorTags}
      setTags={handleTagsChange}
      maxTags={maxTags}
      placeholder={placeholder}
      onInputChange={handleInputChange}
      className={className}
      styleClasses={{
        input: 'w-full',
        tag: {
          body: "pl-2"
        }
      }}
      activeTagIndex={activeTagIndex}
      setActiveTagIndex={setActiveTagIndex}
      enableAutocomplete={true}
      autocompleteOptions={autocompleteOptions}
      onCreateTag={handleCreateTag}
      isLoading={isLoading}
    />
  );
};

export default TagSelector;

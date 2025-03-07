"use server";
import { getErrorMessage } from '../../utils/error';
import { db } from "../db";
import { getCurrentUser } from "./userService";
import { type Tag, type Prisma } from '@prisma/client';

interface CreateTagData {
  name: string;
  color?: string;
  icon?: string;
}

interface UpdateTagData {
  id: string;
  name: string;
  color?: string;
  icon?: string;
}

type TagResult = {
  success: boolean;
  message: string;
  tag?: Tag;
};

interface CursorPaginationOptions {
  cursor?: string;
  pageSize: number;
  filters?: {
    name?: string;
  };
}

type ListTagsResult = {
  success: boolean;
  message: string;
  tags?: Tag[];
  nextCursor?: string | null;
  totalCount?: number;
};

export const createTag = async (data: CreateTagData): Promise<TagResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error("Tag name is required");
    }

    const existingTag = await db.tag.findFirst({
      where: {
        userId: user.id,
        name: trimmedName
      }
    });

    if (existingTag) {
      throw new Error("A tag with this name already exists");
    }

    const newTag = await db.tag.create({
      data: {
        name: trimmedName,
        color: data.color,
        icon: data.icon,
        userId: user.id
      }
    });

    return { 
      success: true, 
      message: "Tag created successfully",
      tag: newTag 
    };

  } catch (error) {
    console.error('Error creating tag:', getErrorMessage(error));
    return { 
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const updateTag = async (data: UpdateTagData): Promise<TagResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      throw new Error("Tag name is required");
    }

    const existingTag = await db.tag.findFirst({
      where: {
        id: data.id,
        userId: user.id
      }
    });

    if (!existingTag) {
      throw new Error("Tag not found");
    }

    // Check for duplicate name
    const duplicateTag = await db.tag.findFirst({
      where: {
        userId: user.id,
        name: trimmedName,
        id: { not: data.id }
      }
    });

    if (duplicateTag) {
      throw new Error("A tag with this name already exists");
    }

    const updatedTag = await db.tag.update({
      where: { id: data.id },
      data: {
        name: trimmedName,
        color: data.color,
        icon: data.icon
      }
    });

    return { 
      success: true, 
      message: "Tag updated successfully",
      tag: updatedTag 
    };

  } catch (error) {
    console.error('Error updating tag:', getErrorMessage(error));
    return { 
      success: false,
      message: getErrorMessage(error)
    };
  }
};

export const listTags = async (options: CursorPaginationOptions): Promise<ListTagsResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const { cursor, pageSize, filters = {} } = options;

    const whereClause: Prisma.TagWhereInput = {
      userId: user.id,
    };

    if (cursor) {
      whereClause.id = { gt: cursor };
    }

    if (filters.name) {
      whereClause.name = {
        contains: filters.name,
        mode: 'insensitive'
      };
    }

    const totalCount = await db.tag.count({
      where: whereClause
    });

    const tags = await db.tag.findMany({
      where: whereClause,
      take: pageSize + 1,
      orderBy: { updatedAt: 'desc' } 
    });

    const hasNextPage = tags.length > pageSize;
    const returnTags = hasNextPage ? tags.slice(0, -1) : tags;
    const lastTag = returnTags[returnTags.length - 1];
    
    return {
      success: true,
      message: "Tags fetched successfully",
      tags: returnTags,
      nextCursor: hasNextPage && lastTag ? lastTag.id : null,
      totalCount: totalCount
    };

  } catch (error) {
    console.error('Error listing tags:', getErrorMessage(error));
    return { 
      success: false, 
      message: getErrorMessage(error)
    };
  }
};

export const deleteTag = async (id: string): Promise<TagResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const existingTag = await db.tag.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!existingTag) {
      throw new Error("Tag not found");
    }

    // Check if tag is in use by any transaction
    const transactionCount = await db.transactionParticipant.count({
      where: {
        tags: {
          some: {
            id: id
          }
        }
      }
    });

    if (transactionCount > 0) {
      throw new Error("Cannot delete a tag that is used in transactions. Try updating it instead.");
    }

    await db.tag.delete({
      where: { id: id }
    });

    return { 
      success: true, 
      message: "Tag deleted successfully"
    };

  } catch (error) {
    console.error('Error deleting tag:', getErrorMessage(error));
    return { 
      success: false,
      message: getErrorMessage(error)
    };
  }
};
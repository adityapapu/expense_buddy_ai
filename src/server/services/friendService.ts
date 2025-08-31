"use server";

import { getErrorMessage } from '../../utils/error';
import { db } from "../db";
import { getCurrentUser } from "./userService";
import { type User, type Friend, type FriendRequest, FriendRequestStatus } from "@prisma/client";

interface FriendResult {
  success: boolean;
  message: string;
  friend?: FriendRequest & {
    sender: Pick<User, 'id' | 'name' | 'email' | 'image'>;
    receiver: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  };
}

interface ListFriendsResult {
  success: boolean;
  message: string;
  friends?: Pick<User, 'id' | 'name' | 'email' | 'image'>[];
  pendingReceivedRequests?: Array<FriendRequest & {
    sender: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  }>;
  pendingSentRequests?: Array<FriendRequest & {
    receiver: Pick<User, 'id' | 'name' | 'email' | 'image'>;
  }>;
}

// Send a friend request
export const sendFriendRequest = async (receiverEmail: string): Promise<FriendResult> => {
  try {
    const sender = await getCurrentUser();
    if (!sender?.id) {
      throw new Error("User not authenticated");
    }

    if (!receiverEmail || !receiverEmail.trim()) {
      throw new Error("Email address is required");
    }

    const receiver = await db.user.findFirst({
      where: {
        email: receiverEmail.trim().toLowerCase()
      }
    });

    if (!receiver) {
      throw new Error("User not found with this email address");
    }

    if (receiver.id === sender.id) {
      throw new Error("You cannot send a friend request to yourself");
    }

    const result = await db.$transaction(async (prisma) => {
      const existingFriendship = await prisma.friend.findFirst({
        where: {
          OR: [
            { userId: sender.id, friendId: receiver.id },
            { userId: receiver.id, friendId: sender.id }
          ]
        }
      });

      if (existingFriendship) {
        throw new Error("You are already friends with this user");
      }

      const existingRequest = await prisma.friendRequest.findFirst({
        where: {
          OR: [
            { senderId: sender.id, receiverId: receiver.id },
            { senderId: receiver.id, receiverId: sender.id }
          ]
        }
      });

      if (existingRequest) {
        throw new Error("A friend request already exists between you and this user");
      }

      return await prisma.friendRequest.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          status: 'PENDING'
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true, image: true }
          },
          receiver: {
            select: { id: true, name: true, email: true, image: true }
          }
        }
      });
    });

    return {
      success: true,
      message: "Friend request sent successfully",
      friend: result
    };
  } catch (error) {
    console.error('Error sending friend request:', error);
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

// Respond to a friend request
export const respondToFriendRequest = async (
  requestId: string,
  accept: boolean
): Promise<FriendResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const friendRequest = await db.friendRequest.findFirst({
      where: {
        id: requestId,
        receiverId: user.id,
        status: 'PENDING'
      }
    });

    if (!friendRequest) {
      throw new Error("Friend request not found");
    }

    if (accept) {
      await db.$transaction([
        db.friend.create({
          data: {
            userId: friendRequest.senderId,
            friendId: friendRequest.receiverId
          }
        }),
        db.friend.create({
          data: {
            userId: friendRequest.receiverId,
            friendId: friendRequest.senderId
          }
        }),
        db.friendRequest.update({
          where: { id: requestId },
          data: { status: 'ACCEPTED' }
        })
      ]);

      return {
        success: true,
        message: "Friend request accepted"
      };
    } else {
      await db.friendRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' }
      });

      return {
        success: true,
        message: "Friend request rejected"
      };
    }
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

// Remove a friend
export const removeFriend = async (friendId: string): Promise<FriendResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    await db.$transaction([
      db.friend.deleteMany({
        where: {
          OR: [
            { userId: user.id, friendId: friendId },
            { userId: friendId, friendId: user.id }
          ]
        }
      })
    ]);

    return {
      success: true,
      message: "Friend removed successfully"
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

// List friends and pending requests
export const listFriendsAndRequests = async (): Promise<ListFriendsResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const friends = await db.friend.findMany({
      where: { userId: user.id },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    const pendingReceivedRequests = await db.friendRequest.findMany({
      where: {
        receiverId: user.id,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    const pendingSentRequests = await db.friendRequest.findMany({
      where: {
        senderId: user.id,
        status: 'PENDING'
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    return {
      success: true,
      message: "Friends and requests fetched successfully",
      friends: friends.map((f: any) => f.friend),
      pendingReceivedRequests,
      pendingSentRequests
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};

// Search users to add as friends
export const searchUsers = async (query: string): Promise<ListFriendsResult> => {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    const currentFriends = await db.friend.findMany({
      where: { userId: user.id },
      select: { friendId: true }
    });

    const pendingRequests = await db.friendRequest.findMany({
      where: {
        OR: [
          { senderId: user.id },
          { receiverId: user.id }
        ],
        status: FriendRequestStatus.PENDING
      },
      select: {
        senderId: true,
        receiverId: true
      }
    });

    const excludeIds = new Set([
      user.id,
      ...currentFriends.map(f => f.friendId),
      ...pendingRequests.map(r => r.senderId),
      ...pendingRequests.map(r => r.receiverId)
    ]);

    const users = await db.user.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } }
            ]
          },
          { id: { notIn: Array.from(excludeIds) } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true
      },
      take: 10
    });

    return {
      success: true,
      message: "Users found",
      friends: users
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error)
    };
  }
};
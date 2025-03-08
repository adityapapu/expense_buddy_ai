/*
  Warnings:

  - Added the required column `splitAmount` to the `TransactionParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SplitType" AS ENUM ('EQUAL', 'AMOUNT', 'PERCENTAGE', 'SHARES');

-- First, create friend-related tables
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Friend" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- Add split-related columns to TransactionParticipant with default values
ALTER TABLE "TransactionParticipant" ADD COLUMN "splitAmount" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "TransactionParticipant" ADD COLUMN "splitType" "SplitType" NOT NULL DEFAULT 'EQUAL';
ALTER TABLE "TransactionParticipant" ADD COLUMN "splitValue" DECIMAL(10,2);

-- Update existing records to set splitAmount equal to amount
UPDATE "TransactionParticipant" SET "splitAmount" = "amount";

-- Create indexes
CREATE UNIQUE INDEX "FriendRequest_senderId_receiverId_key" ON "FriendRequest"("senderId", "receiverId");
CREATE INDEX "FriendRequest_senderId_idx" ON "FriendRequest"("senderId");
CREATE INDEX "FriendRequest_receiverId_idx" ON "FriendRequest"("receiverId");

CREATE UNIQUE INDEX "Friend_userId_friendId_key" ON "Friend"("userId", "friendId");
CREATE INDEX "Friend_userId_idx" ON "Friend"("userId");
CREATE INDEX "Friend_friendId_idx" ON "Friend"("friendId");

-- Add foreign key constraints
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

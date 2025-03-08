"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Select,
  SelectItem,
  Input,
  Avatar,
  Checkbox,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell
} from "@nextui-org/react";

// Define SplitType enum since it's not available in @prisma/client
enum SplitType {
  EQUAL = "EQUAL",
  AMOUNT = "AMOUNT",
  PERCENTAGE = "PERCENTAGE",
  SHARES = "SHARES"
}

interface SplitDetailsProps {
  friends: any[];
  totalAmount: number;
  onSplitUpdate: (splits: any[]) => void;
  isReadOnly?: boolean;
  initialSplits?: any[];
  currentUser: any;  // Add currentUser prop
}

export default function SplitDetails({
  friends,
  totalAmount,
  onSplitUpdate,
  isReadOnly = false,
  initialSplits = [],
  currentUser
}: SplitDetailsProps) {
  const [splitType, setSplitType] = useState<SplitType>(SplitType.EQUAL);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [splits, setSplits] = useState<Map<string, number>>(new Map());
  const [percentages, setPercentages] = useState<Map<string, number>>(new Map());
  const [shares, setShares] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (initialSplits.length > 0) {
      const initialFriendIds = new Set(initialSplits.map(split => split.userId));
      setSelectedFriends(initialFriendIds);
      
      const splitMap = new Map();
      const percentageMap = new Map();
      const sharesMap = new Map();
      
      initialSplits.forEach(split => {
        splitMap.set(split.userId, parseFloat(split.splitAmount));
        if (split.splitValue) {
          if (split.splitType === SplitType.PERCENTAGE) {
            percentageMap.set(split.userId, parseFloat(split.splitValue));
          } else if (split.splitType === SplitType.SHARES) {
            sharesMap.set(split.userId, parseFloat(split.splitValue));
          }
        }
      });

      setSplits(splitMap);
      setPercentages(percentageMap);
      setShares(sharesMap);
      setSplitType(initialSplits[0]?.splitType || SplitType.EQUAL);
    }
  }, [initialSplits]);

  const calculateSplits = () => {
    const selectedFriendsArray = Array.from(selectedFriends);
    const newSplits = new Map<string, number>();

    switch (splitType) {
      case SplitType.EQUAL: {
        const splitAmount = totalAmount / (selectedFriendsArray.length + 1); // +1 for current user
        // Set current user's split
        newSplits.set(currentUser.id, splitAmount);
        // Set friends' splits
        selectedFriendsArray.forEach(friendId => {
          newSplits.set(friendId, splitAmount);
        });
        break;
      }
      
      case SplitType.PERCENTAGE: {
        // Set current user's split
        const currentUserPercentage = percentages.get(currentUser.id) || 0;
        newSplits.set(currentUser.id, (totalAmount * currentUserPercentage) / 100);
        // Set friends' splits
        selectedFriendsArray.forEach(friendId => {
          const percentage = percentages.get(friendId) || 0;
          newSplits.set(friendId, (totalAmount * percentage) / 100);
        });
        break;
      }
      
      case SplitType.SHARES: {
        const allShares = new Map(shares);
        if (!allShares.has(currentUser.id)) {
          allShares.set(currentUser.id, 1); // Default share for current user
        }
        const totalShares = Array.from(allShares.values()).reduce((sum, share) => sum + share, 0);
        
        if (totalShares > 0) {
          // Set current user's split
          const currentUserShare = allShares.get(currentUser.id) || 1;
          newSplits.set(currentUser.id, (totalAmount * currentUserShare) / totalShares);
          // Set friends' splits
          selectedFriendsArray.forEach(friendId => {
            const share = allShares.get(friendId) || 0;
            newSplits.set(friendId, (totalAmount * share) / totalShares);
          });
        }
        break;
      }
      
      case SplitType.AMOUNT: {
        // Set current user's split
        newSplits.set(currentUser.id, splits.get(currentUser.id) || 0);
        // Set friends' splits
        selectedFriendsArray.forEach(friendId => {
          newSplits.set(friendId, splits.get(friendId) || 0);
        });
        break;
      }
    }

    setSplits(newSplits);
    notifyParent(newSplits);
  };

  useEffect(() => {
    calculateSplits();
  }, [totalAmount, splitType, selectedFriends, percentages, shares]);

  const handleFriendToggle = (friendId: string) => {
    const newSelectedFriends = new Set(selectedFriends);
    if (newSelectedFriends.has(friendId)) {
      newSelectedFriends.delete(friendId);
    } else {
      newSelectedFriends.add(friendId);
    }
    setSelectedFriends(newSelectedFriends);
  };

  const handleValueChange = (friendId: string, value: string, type: 'amount' | 'percentage' | 'shares') => {
    const numValue = parseFloat(value) || 0;
    
    switch (type) {
      case 'amount': {
        const newSplits = new Map(splits);
        newSplits.set(friendId, numValue);
        setSplits(newSplits);
        notifyParent(newSplits);
        break;
      }
      case 'percentage': {
        const newPercentages = new Map(percentages);
        newPercentages.set(friendId, numValue);
        setPercentages(newPercentages);
        break;
      }
      case 'shares': {
        const newShares = new Map(shares);
        newShares.set(friendId, numValue);
        setShares(newShares);
        break;
      }
    }
  };

  const notifyParent = (newSplits: Map<string, number>) => {
    const splitDetails = Array.from(selectedFriends).map(friendId => ({
      userId: friendId,
      splitAmount: newSplits.get(friendId) || 0,
      splitType,
      splitValue: splitType === SplitType.PERCENTAGE 
        ? percentages.get(friendId) 
        : splitType === SplitType.SHARES 
          ? shares.get(friendId) 
          : null
    }));
    onSplitUpdate(splitDetails);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card>
      <CardBody className="gap-4">
        <Select
          label="Split Type"
          selectedKeys={[splitType]}
          onChange={(e) => setSplitType(e.target.value as SplitType)}
          isDisabled={isReadOnly}
        >
          <SelectItem key={SplitType.EQUAL} value={SplitType.EQUAL}>
            Split Equally
          </SelectItem>
          <SelectItem key={SplitType.AMOUNT} value={SplitType.AMOUNT}>
            Split by Amount
          </SelectItem>
          <SelectItem key={SplitType.PERCENTAGE} value={SplitType.PERCENTAGE}>
            Split by Percentage
          </SelectItem>
          <SelectItem key={SplitType.SHARES} value={SplitType.SHARES}>
            Split by Shares
          </SelectItem>
        </Select>

        <Table
          removeWrapper
          aria-label="Split details table"
          className="mt-4"
        >
          <TableHeader>
            <TableColumn>PERSON</TableColumn>
            <TableColumn>SPLIT DETAILS</TableColumn>
            <TableColumn>AMOUNT</TableColumn>
            <TableColumn>INCLUDE</TableColumn>
          </TableHeader>
          <TableBody items={[currentUser, ...friends]}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar src={item.image} name={item.name} size="sm" />
                    <div>
                      <p className="font-medium text-small">{item.name || 'You'}</p>
                      <p className="text-tiny text-default-500">{item.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {splitType !== SplitType.EQUAL && (item.id === currentUser.id || selectedFriends.has(item.id)) && (
                    <Input
                      type="number"
                      size="sm"
                      value={
                        splitType === SplitType.AMOUNT 
                          ? splits.get(item.id)?.toString() || "0"
                          : splitType === SplitType.PERCENTAGE
                            ? percentages.get(item.id)?.toString() || (item.id === currentUser.id ? "0" : "0")
                            : shares.get(item.id)?.toString() || (item.id === currentUser.id ? "1" : "0")
                      }
                      onValueChange={(value) => handleValueChange(
                        item.id,
                        value,
                        splitType === SplitType.AMOUNT 
                          ? 'amount'
                          : splitType === SplitType.PERCENTAGE
                            ? 'percentage'
                            : 'shares'
                      )}
                      startContent={
                        splitType === SplitType.PERCENTAGE 
                          ? "%" 
                          : splitType === SplitType.SHARES
                            ? "#"
                            : "$"
                      }
                      isDisabled={isReadOnly}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {(item.id === currentUser.id || selectedFriends.has(item.id)) && (
                    <span className={splits.get(item.id) || 0 > 0 ? 'text-success' : ''}>
                      {formatAmount(splits.get(item.id) || 0)}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Checkbox
                    isSelected={item.id === currentUser.id || selectedFriends.has(item.id)}
                    onValueChange={() => item.id !== currentUser.id && handleFriendToggle(item.id)}
                    isDisabled={isReadOnly || item.id === currentUser.id}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
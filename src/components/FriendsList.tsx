"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Input,
  Button,
  Avatar,
  Tabs,
  Tab,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Chip,
  ScrollShadow,
} from "@heroui/react";
import { useToast } from "@/hooks/use-toast";
import { listFriendsAndRequests, sendFriendRequest, respondToFriendRequest, removeFriend } from "@/server/services/friendService";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface FriendRequest {
  id: string;
  sender: User;
  receiver?: User;
}

export default function FriendsList() {
  const { toast } = useToast();
  const [friendEmail, setFriendEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [friends, setFriends] = useState<User[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);

  const {
    isOpen: isAddFriendOpen,
    onOpen: onAddFriendOpen,
    onClose: onAddFriendClose
  } = useDisclosure();

  // Load friends and pending requests
  const loadFriendsAndRequests = useCallback(async () => {
    try {
      const response = await listFriendsAndRequests();
      if (response.success) {
        setFriends(response.friends ?? []);
        setReceivedRequests((response.pendingReceivedRequests as unknown as FriendRequest[]) ?? []);
        setSentRequests((response.pendingSentRequests as unknown as FriendRequest[]) ?? []);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load friends"
      });
    }
  }, [toast]);

  useEffect(() => {
    void loadFriendsAndRequests();
  }, [loadFriendsAndRequests]);

  const handleSendRequest = async () => {
    if (!friendEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter an email address"
      });
      return;
    }

    if (!isValidEmail(friendEmail)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await sendFriendRequest(friendEmail.trim().toLowerCase());
      if (response.success) {
        toast({
          title: "Success",
          description: "Friend request sent successfully"
        });
        setFriendEmail("");
        onAddFriendClose();
        // Reload the friends list to show updated state
        await loadFriendsAndRequests();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message ?? "Failed to send friend request"
        });
      }
    } catch (error: unknown) {
      let message = "Failed to send friend request";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const response = await respondToFriendRequest(requestId, accept);
      if (response.success) {
        toast({
          title: "Success",
          description: accept ? "Friend request accepted" : "Friend request rejected"
        });
        await loadFriendsAndRequests();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to respond to friend request"
      });
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const response = await removeFriend(friendId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Friend removed successfully"
        });
        await loadFriendsAndRequests();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove friend"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardBody className="gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Friends</h2>
            <Button color="primary" onPress={onAddFriendOpen}>
              Add Friend
            </Button>
          </div>

          <Tabs aria-label="Friends tabs">
            <Tab key="friends" title="Friends">
              <ScrollShadow className="max-h-[400px]">
                <div className="space-y-2">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-default-200"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar src={friend.image || undefined} name={friend.name || undefined} />
                        <div>
                          <p className="font-medium">{friend.name}</p>
                          <p className="text-small text-default-500">{friend.email}</p>
                        </div>
                      </div>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => void handleRemoveFriend(friend.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {friends.length === 0 && (
                    <p className="text-center text-default-500 py-4">
                      You haven&apos;t added any friends yet
                    </p>
                  )}
                </div>
              </ScrollShadow>
            </Tab>
            
            <Tab key="requests" title={
              <div className="flex items-center gap-2">
                <span>Pending</span>
                {(receivedRequests.length + sentRequests.length) > 0 && (
                  <Chip size="sm" color="primary">
                    {receivedRequests.length + sentRequests.length}
                  </Chip>
                )}
              </div>
            }>
              <ScrollShadow className="max-h-[400px]">
                <div className="space-y-4">
                  {/* Received Requests Section */}
                  {receivedRequests.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-default-600 mb-2">
                        Received Requests
                      </h3>
                      {receivedRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-default-200"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar src={request.sender.image || undefined} name={request.sender.name || undefined} />
                            <div>
                              <p className="font-medium">{request.sender.name}</p>
                              <p className="text-small text-default-500">{request.sender.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              color="success"
                              variant="flat"
                              size="sm"
                              onPress={() => void handleRespondToRequest(request.id, true)}
                            >
                              Accept
                            </Button>
                            <Button
                              color="danger"
                              variant="light"
                              size="sm"
                              onPress={() => void handleRespondToRequest(request.id, false)}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sent Requests Section */}
                  {sentRequests.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-default-600 mb-2">
                        Sent Requests
                      </h3>
                      {sentRequests.map((request) => (
                        <div
                          key={request.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-default-200"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar src={request.receiver?.image || undefined} name={request.receiver?.name || undefined} />
                            <div>
                              <p className="font-medium">{request.receiver?.name}</p>
                              <p className="text-small text-default-500">{request.receiver?.email}</p>
                            </div>
                          </div>
                          <Chip size="sm" variant="flat" color="warning">
                            Pending
                          </Chip>
                        </div>
                      ))}
                    </div>
                  )}

                  {receivedRequests.length === 0 && sentRequests.length === 0 && (
                    <p className="text-center text-default-500 py-4">
                      No pending requests
                    </p>
                  )}
                </div>
              </ScrollShadow>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Add Friend Modal */}
      <Modal
        isOpen={isAddFriendOpen}
        onClose={onAddFriendClose}
        size="lg"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Add Friend</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <p className="text-small text-default-500">
                    Enter your friend&apos;s email address to send them a friend request.
                  </p>
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="friend@example.com"
                    value={friendEmail}
                    onValueChange={setFriendEmail}
                    isRequired
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSendRequest}
                  isLoading={isSubmitting}
                  isDisabled={!friendEmail.trim() || !isValidEmail(friendEmail)}
                >
                  Send Request
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
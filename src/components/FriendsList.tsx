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
  Divider,
} from "@heroui/react";
import { useToast } from "@/hooks/use-toast";
import { listFriendsAndRequests, sendFriendRequest, respondToFriendRequest, removeFriend } from "@/server/services/friendService";

export default function FriendsList() {
  const { toast } = useToast();
  const [friendEmail, setFriendEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

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
        setFriends(response.friends || []);
        setReceivedRequests(response.pendingReceivedRequests || []);
        setSentRequests(response.pendingSentRequests || []);
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
    loadFriendsAndRequests();
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
          description: response.message || "Failed to send friend request"
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error?.message || "Failed to send friend request"
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
        loadFriendsAndRequests();
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
        loadFriendsAndRequests();
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
                        <Avatar src={friend.image} name={friend.name} />
                        <div>
                          <p className="font-medium">{friend.name}</p>
                          <p className="text-small text-default-500">{friend.email}</p>
                        </div>
                      </div>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => handleRemoveFriend(friend.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {friends.length === 0 && (
                    <p className="text-center text-default-500 py-4">
                      You haven't added any friends yet
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
                            <Avatar src={request.sender.image} name={request.sender.name} />
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
                              onPress={() => handleRespondToRequest(request.id, true)}
                            >
                              Accept
                            </Button>
                            <Button
                              color="danger"
                              variant="light"
                              size="sm"
                              onPress={() => handleRespondToRequest(request.id, false)}
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
                            <Avatar src={request.receiver.image} name={request.receiver.name} />
                            <div>
                              <p className="font-medium">{request.receiver.name}</p>
                              <p className="text-small text-default-500">{request.receiver.email}</p>
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
                    Enter your friend's email address to send them a friend request.
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
"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusIcon, UserPlus, UserMinus, Search, User, Loader2, Clock, Check, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  sendFriendRequest,
  listFriendsAndRequests,
  respondToFriendRequest,
  removeFriend,
  searchUsers,
  type FriendResult,
  type ListFriendsResult
} from "@/server/services/friendService"

export function FriendsSettings() {
  const [friends, setFriends] = useState<any[]>([])
  const [pendingReceivedRequests, setPendingReceivedRequests] = useState<any[]>([])
  const [pendingSentRequests, setPendingSentRequests] = useState<any[]>([])
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "add">("friends")
  const [searchEmail, setSearchEmail] = useState("")
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const response: ListFriendsResult = await listFriendsAndRequests()
      if (response.success) {
        setFriends(response.friends || [])
        setPendingReceivedRequests(response.pendingReceivedRequests || [])
        setPendingSentRequests(response.pendingSentRequests || [])
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load friends data",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleSendRequest = async (email: string) => {
    try {
      setSubmitting(true)
      const result: FriendResult = await sendFriendRequest(email)
      if (result.success) {
        await loadData()
        setSearchEmail("")
        toast({
          title: "Success",
          description: "Friend request sent successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send friend request",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleRespondToRequest = async (requestId: string, accept: boolean) => {
    try {
      const result: FriendResult = await respondToFriendRequest(requestId, accept)
      if (result.success) {
        await loadData()
        toast({
          title: "Success",
          description: accept ? "Friend request accepted" : "Friend request declined",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to respond to friend request",
      })
    }
  }

  const handleRemoveFriend = async (friendId: string) => {
    try {
      const result: FriendResult = await removeFriend(friendId)
      if (result.success) {
        await loadData()
        toast({
          title: "Success",
          description: "Friend removed successfully",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove friend",
      })
    }
  }

  const handleSearchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      setSubmitting(true)
      const response: ListFriendsResult = await searchUsers(searchQuery)
      if (response.success) {
        setSearchResults(response.friends || [])
      } else {
        setSearchResults([])
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message,
        })
      }
    } catch (error) {
      setSearchResults([])
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to search users",
      })
    } finally {
      setSubmitting(false)
    }
  }, [searchQuery, toast, setSubmitting, setSearchResults])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === "add") {
        void handleSearchUsers()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, activeTab, handleSearchUsers])

  const filteredFriends = friends.filter(friend =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email?.[0]?.toUpperCase() || '?'
  }

  const UserAvatar = ({ user }: { user: any }) => (
    <Avatar className="h-10 w-10">
      <AvatarImage src={user.image} alt={user.name || user.email} />
      <AvatarFallback>
        {getInitials(user.name, user.email)}
      </AvatarFallback>
    </Avatar>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Friends</CardTitle>
              <CardDescription>Manage your friends for splitting expenses and sharing transactions.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Search friends..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-48"
              />
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Friend
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Friend</DialogTitle>
                    <DialogDescription>Send a friend request by email address.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    void handleSendRequest(searchEmail)
                  }}>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="friend@example.com"
                          value={searchEmail}
                          onChange={(e) => setSearchEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={submitting || !searchEmail.trim()}>
                        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Send Request
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 border-b">
            <button
              onClick={() => setActiveTab("friends")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === "friends"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === "requests"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Requests ({pendingReceivedRequests.length + pendingSentRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("add")}
              className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                activeTab === "add"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              Find Friends
            </button>
          </div>

          {/* Content based on active tab */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : activeTab === "friends" ? (
            filteredFriends.length > 0 ? (
              <div className="space-y-3">
                {filteredFriends.map((friend) => (
                  <div
                    key={friend.id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar user={friend} />
                      <div>
                        <h3 className="font-medium">{friend.name || "No Name"}</h3>
                        <p className="text-sm text-muted-foreground">{friend.email}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFriend(friend.id)}
                      disabled={submitting}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No Friends</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  {searchQuery ? "No friends match your search." : "You haven't added any friends yet. Add friends to split expenses with them."}
                </p>
              </div>
            )
          ) : activeTab === "requests" ? (
            <div className="space-y-4">
              {pendingReceivedRequests.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Received Requests</h4>
                  <div className="space-y-3">
                    {pendingReceivedRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between gap-4 rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar user={request.sender} />
                          <div>
                            <h3 className="font-medium">{request.sender.name || "No Name"}</h3>
                            <p className="text-sm text-muted-foreground">{request.sender.email}</p>
                            <Badge variant="secondary" className="mt-1">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRespondToRequest(request.id, false)}
                            disabled={submitting}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleRespondToRequest(request.id, true)}
                            disabled={submitting}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pendingSentRequests.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Sent Requests</h4>
                  <div className="space-y-3">
                    {pendingSentRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between gap-4 rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar user={request.receiver} />
                          <div>
                            <h3 className="font-medium">{request.receiver.name || "No Name"}</h3>
                            <p className="text-sm text-muted-foreground">{request.receiver.email}</p>
                            <Badge variant="secondary" className="mt-1">
                              <Clock className="mr-1 h-3 w-3" />
                              Pending
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled
                        >
                          Request Sent
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pendingReceivedRequests.length === 0 && pendingSentRequests.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No Pending Requests</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    You don't have any pending friend requests.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {submitting ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-3">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <div>
                          <h3 className="font-medium">{user.name || "No Name"}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(user.email)}
                        disabled={submitting}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Friend
                      </Button>
                    </div>
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No Users Found</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    No users found matching "{searchQuery}". Try a different search term.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <UserPlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">Find Friends</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Search for users by name or email to send them friend requests.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Package, TrendingUp, CheckCircle, Clock } from "lucide-react"

const myPosts = [
  {
    id: "1",
    title: "Electronics Package - NY to Boston",
    status: "open",
    bids: 3,
    createdAt: "2024-12-14",
  },
  {
    id: "2",
    title: "Documents - Chicago to Denver",
    status: "closed",
    bids: 5,
    createdAt: "2024-12-10",
  },
]

const receivedBids = [
  {
    id: "1",
    postTitle: "Electronics Package - NY to Boston",
    bidderName: "John D.",
    amount: 45,
    status: "pending",
    message: "I can deliver this safely.",
  },
  {
    id: "2",
    postTitle: "Electronics Package - NY to Boston",
    bidderName: "Alex K.",
    amount: 35,
    status: "pending",
    message: "I'm driving and have space!",
  },
]

const myActiveBids = [
  {
    id: "1",
    postTitle: "Travel to SF - Luggage Space Available",
    postOwner: "Emma R.",
    amount: 50,
    status: "pending",
    createdAt: "2024-12-12",
  },
  {
    id: "2",
    postTitle: "Item Delivery - Electronics Package",
    postOwner: "Sarah M.",
    amount: 45,
    status: "accepted",
    createdAt: "2024-12-10",
  },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your posts, bids, and deliveries</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-xl bg-card border border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Active Posts</p>
              <Package className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">2</p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Pending Bids</p>
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <p className="text-3xl font-bold">2</p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">My Bids</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">2</p>
          </div>

          <div className="p-6 rounded-xl bg-card border border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Completed</p>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">8</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="my-posts" className="space-y-6">
          <TabsList className="bg-background border border-border">
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
            <TabsTrigger value="received-bids">Received Bids</TabsTrigger>
            <TabsTrigger value="my-bids">My Active Bids</TabsTrigger>
          </TabsList>

          {/* My Posts */}
          <TabsContent value="my-posts" className="space-y-4">
            {myPosts.map((post) => (
              <div key={post.id} className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <p className="text-sm text-muted-foreground">Posted {post.createdAt}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      post.status === "open" ? "bg-green-500/20 text-green-600" : "bg-gray-500/20 text-gray-600"
                    }`}
                  >
                    {post.status === "open" ? "Open" : "Closed"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{post.bids}</p>
                      <p className="text-xs text-muted-foreground">Offers</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Received Bids */}
          <TabsContent value="received-bids" className="space-y-4">
            {receivedBids.map((bid) => (
              <div key={bid.id} className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{bid.postTitle}</h3>
                    <p className="text-sm text-muted-foreground">From {bid.bidderName}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 rounded-lg text-sm font-medium">
                    Pending
                  </span>
                </div>

                <p className="text-foreground mb-4">{bid.message}</p>

                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-primary">${bid.amount}</p>
                  <div className="flex gap-2">
                    <Button size="sm">Accept</Button>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* My Active Bids */}
          <TabsContent value="my-bids" className="space-y-4">
            {myActiveBids.map((bid) => (
              <div key={bid.id} className="p-6 rounded-xl bg-card border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold">{bid.postTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      Posted by {bid.postOwner} • {bid.createdAt}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      bid.status === "accepted" ? "bg-green-500/20 text-green-600" : "bg-yellow-500/20 text-yellow-600"
                    }`}
                  >
                    {bid.status === "accepted" ? "Accepted" : "Pending"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-primary">${bid.amount}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      View Post
                    </Button>
                    {bid.status === "accepted" && <Button size="sm">Start Chat</Button>}
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

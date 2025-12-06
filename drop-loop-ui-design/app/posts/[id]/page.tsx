"use client"

import { MapPin, Package, MessageSquare, Star, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import Link from "next/link"

const mockPost = {
  id: "1",
  type: "item",
  from: "New York, NY",
  to: "Boston, MA",
  itemName: "Electronics Package",
  itemWeight: "2kg",
  description: "Laptop and charger. Handle with care.",
  date: "2024-12-15",
  userDisplayName: "Sarah M.",
  userPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  userRating: 4.9,
  userReviews: 28,
  imageUrl: "/laptop-electronics-package.jpg",
}

const mockBids = [
  {
    id: "1",
    bidderId: "user1",
    bidderName: "John D.",
    bidderPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    amount: 45,
    message: "I can deliver this safely. Flying to Boston tomorrow.",
    status: "pending",
    createdAt: "2024-12-14",
  },
  {
    id: "2",
    bidderId: "user2",
    bidderName: "Alex K.",
    bidderPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    amount: 35,
    message: "I'm driving and have space!",
    status: "pending",
    createdAt: "2024-12-13",
  },
  {
    id: "3",
    bidderId: "user3",
    bidderName: "Emma R.",
    bidderPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    amount: 50,
    message: "Premium service with tracking and insurance included.",
    status: "pending",
    createdAt: "2024-12-12",
  },
]

export default function PostDetail({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back Button */}
            <Link href="/posts">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="h-4 w-4 rotate-180" />
                Back to Posts
              </Button>
            </Link>

            {/* Post Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={mockPost.userPhotoURL || "/placeholder.svg"}
                    alt={mockPost.userDisplayName}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h1 className="text-2xl font-bold">{mockPost.userDisplayName}</h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span>{mockPost.userRating}</span>
                      <span>({mockPost.userReviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium">
                  <Package className="h-4 w-4" />
                  Item
                </span>
              </div>
            </div>

            {/* Image */}
            <div className="w-full h-96 rounded-xl overflow-hidden border border-border">
              <img
                src={mockPost.imageUrl || "/placeholder.svg"}
                alt={mockPost.itemName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Route */}
            <div className="grid grid-cols-2 gap-6 p-6 rounded-xl bg-card border border-border">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">From</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-lg">{mockPost.from}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">To</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent" />
                  <p className="font-semibold text-lg">{mockPost.to}</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Item Details</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Item Name</p>
                  <p className="font-semibold">{mockPost.itemName}</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Weight</p>
                  <p className="font-semibold">{mockPost.itemWeight}</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Date</p>
                  <p className="font-semibold">{mockPost.date}</p>
                </div>
                <div className="p-4 rounded-lg bg-card border border-border">
                  <p className="text-sm text-muted-foreground mb-2">Bids Received</p>
                  <p className="font-semibold">{mockBids.length} offers</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-card border border-border">
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p>{mockPost.description}</p>
              </div>
            </div>

            {/* Bids Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Offers Received ({mockBids.length})</h2>

              <div className="space-y-4">
                {mockBids.map((bid) => (
                  <div key={bid.id} className="p-6 rounded-xl bg-card border border-border space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={bid.bidderPhotoURL || "/placeholder.svg"}
                          alt={bid.bidderName}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{bid.bidderName}</h3>
                          <p className="text-sm text-muted-foreground">{bid.createdAt}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${bid.amount}</p>
                        <span className="inline-block px-2 py-1 text-xs bg-yellow-500/20 text-yellow-600 rounded font-medium">
                          Pending
                        </span>
                      </div>
                    </div>

                    <p className="text-foreground">{bid.message}</p>

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button className="flex-1" size="sm">
                        Accept
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                        Reject
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary Card */}
            <div className="p-6 rounded-xl bg-card border border-border space-y-6 sticky top-20">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Delivery Summary</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-semibold">
                      {mockPost.from.split(",")[0]} → {mockPost.to.split(",")[0]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Item</span>
                    <span className="font-semibold">{mockPost.itemWeight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-semibold">{mockPost.date}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-3">
                <Button className="w-full gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Contact Sender
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

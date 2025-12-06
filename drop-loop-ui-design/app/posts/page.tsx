"use client"

import { PlusCircle, Search, Filter } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { PostCard } from "@/components/post-card"

const mockPosts = [
  {
    id: "1",
    type: "item",
    from: "New York, NY",
    to: "Boston, MA",
    itemName: "Electronics Package",
    itemWeight: "2kg",
    date: "2024-12-15",
    departureDate: "2024-12-20",
    arrivalDate: "2024-12-21",
    userDisplayName: "Sarah M.",
    userPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    bidsCount: 3,
    amount: 45,
    imageURL: "/electronics-package.jpg",
  },
  {
    id: "2",
    type: "travel",
    from: "Los Angeles, CA",
    to: "San Francisco, CA",
    mode: "flight",
    date: "2024-12-14",
    departureDate: "2024-12-22",
    arrivalDate: "2024-12-22",
    userDisplayName: "John D.",
    userPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    bidsCount: 5,
    description: "Flying to SF, can carry up to 5kg",
  },
  {
    id: "3",
    type: "item",
    from: "Chicago, IL",
    to: "Denver, CO",
    itemName: "Documents & Files",
    itemWeight: "0.5kg",
    date: "2024-12-16",
    departureDate: "2024-12-23",
    arrivalDate: "2024-12-25",
    userDisplayName: "Alex K.",
    userPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    bidsCount: 2,
    amount: 30,
    imageURL: "/documents-folder.jpg",
  },
  {
    id: "4",
    type: "travel",
    from: "Miami, FL",
    to: "New York, NY",
    mode: "car",
    date: "2024-12-17",
    departureDate: "2024-12-24",
    arrivalDate: "2024-12-26",
    userDisplayName: "Emma R.",
    userPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    bidsCount: 4,
    description: "Road trip! Space for 3 packages",
  },
  {
    id: "5",
    type: "item",
    from: "Seattle, WA",
    to: "Portland, OR",
    itemName: "Laptop & Accessories",
    itemWeight: "1.8kg",
    date: "2024-12-15",
    departureDate: "2024-12-21",
    arrivalDate: "2024-12-22",
    userDisplayName: "Mike T.",
    userPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    bidsCount: 6,
    amount: 25,
    imageURL: "/modern-laptop.png",
  },
  {
    id: "6",
    type: "travel",
    from: "Austin, TX",
    to: "Dallas, TX",
    mode: "train",
    date: "2024-12-18",
    departureDate: "2024-12-25",
    arrivalDate: "2024-12-25",
    userDisplayName: "Lisa W.",
    userPhotoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa",
    bidsCount: 1,
    description: "Taking the train, luggage space available",
  },
]

export default function Posts() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tight">Browse Posts</h1>
                <p className="text-muted-foreground">Find items to deliver or travelers on your route</p>
              </div>
              <Link href="/create">
                <Button size="lg" className="gap-2">
                  <PlusCircle className="h-5 w-5" />
                  Create Post
                </Button>
              </Link>
            </div>

            {/* Search and Filter */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by location or item..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2 flex-1 bg-transparent">
                  <Filter className="h-4 w-4" />
                  All Posts
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  For Senders
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  For Travelers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  )
}

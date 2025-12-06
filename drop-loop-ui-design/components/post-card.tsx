"use client"

import type React from "react"

import { MapPin, Package, Plane, ArrowRight, Star, Calendar } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "./ui/button"

interface PostCardProps {
  post: {
    id: string
    type: "item" | "travel"
    from: string
    to: string
    date: string
    departureDate?: string
    arrivalDate?: string
    userDisplayName: string
    userPhotoURL: string
    bidsCount?: number
    amount?: number
    itemName?: string
    itemWeight?: string
    mode?: string
    description?: string
    imageURL?: string
  }
}

export function PostCard({ post }: PostCardProps) {
  const [showUserProfile, setShowUserProfile] = useState(false)

  const handleUserClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const profileLink = document.createElement("a")
    profileLink.href = "/profile"
    profileLink.click()
  }

  return (
    <>
      <Link href={`/posts/${post.id}`}>
        <div className="group cursor-pointer h-full flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          {/* Image Section - Consistent Height */}
          <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden relative flex items-center justify-center">
            {post.imageURL ? (
              <img
                src={post.imageURL || "/placeholder.svg"}
                alt={post.itemName || "Post"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                {post.type === "item" ? (
                  <Package className="h-12 w-12 opacity-20" />
                ) : (
                  <Plane className="h-12 w-12 opacity-20" />
                )}
                <span className="text-xs font-medium opacity-40">No image</span>
              </div>
            )}
          </div>

          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-background/50">
            <button onClick={handleUserClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src={post.userPhotoURL || "/placeholder.svg"}
                alt={post.userDisplayName}
                className="h-8 w-8 rounded-full border border-border"
              />
              <div className="text-left">
                <p className="text-sm font-medium hover:text-primary transition-colors">{post.userDisplayName}</p>
                <p className="text-xs text-muted-foreground">{post.date}</p>
              </div>
            </button>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
              {post.type === "item" ? (
                <>
                  <Package className="h-3 w-3" />
                  Item
                </>
              ) : (
                <>
                  <Plane className="h-3 w-3" />
                  Travel
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 flex-1 space-y-4">
            {/* Route */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">{post.from}</span>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">{post.to}</span>
              </div>
            </div>

            {/* Dates */}
            {(post.departureDate || post.arrivalDate) && (
              <div className="space-y-2 pt-2 border-t border-border">
                {post.departureDate && (
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Depart:</span>
                    <span className="font-medium text-foreground">{post.departureDate}</span>
                  </div>
                )}
                {post.arrivalDate && (
                  <div className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">Arrive:</span>
                    <span className="font-medium text-foreground">{post.arrivalDate}</span>
                  </div>
                )}
              </div>
            )}

            {/* Details */}
            <div className="space-y-2 pt-2">
              {post.type === "item" && (
                <>
                  <p className="text-sm">
                    <span className="font-medium">Item:</span> {post.itemName}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Weight:</span> {post.itemWeight}
                  </p>
                </>
              )}
              {post.type === "travel" && (
                <>
                  <p className="text-sm">
                    <span className="font-medium">Mode:</span> {post.mode}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  
                  
                </div>
                {post.amount && <div className="text-sm font-medium text-primary">From ${post.amount}</div>}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="p-4 border-t border-border bg-background/50">
            <Button size="sm" className="w-full group-hover:gap-2 transition-all">
              View Details
            </Button>
          </div>
        </div>
      </Link>

      {/* User Profile Modal */}
      {/* Removed the modal since navigation to profile page is handled */}
    </>
  )
}

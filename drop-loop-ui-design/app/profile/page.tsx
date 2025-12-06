"use client"

import type React from "react"

import { useState } from "react"
import { Star, Edit2, MapPin, Briefcase, BookOpen, MapIcon, MessageSquare, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

interface Review {
  id: string
  reviewerName: string
  reviewerAvatar: string
  rating: number
  text: string
  date: string
}

const mockProfile = {
  displayName: "Sarah Martinez",
  email: "sarah@example.com",
  photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  rating: 4.9,
  reviewCount: 28,
  completedDeliveries: 45,
  joinDate: "January 2023",
  profession: "Graphic Designer",
  education: "Bachelor's in Design",
  hometown: "New York, NY",
  bio: "Frequent traveler and reliable delivery partner. Always on time and careful with packages.",
}

const mockReviews: Review[] = [
  {
    id: "1",
    reviewerName: "John D.",
    reviewerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    rating: 5,
    text: "Excellent service! Delivered my package safely and on time. Very professional.",
    date: "2 weeks ago",
  },
  {
    id: "2",
    reviewerName: "Emma R.",
    reviewerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    rating: 5,
    text: "Amazing experience. Sarah was responsive and took great care of my items.",
    date: "1 month ago",
  },
  {
    id: "3",
    reviewerName: "Alex K.",
    reviewerAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    rating: 4,
    text: "Good delivery. Minor delay but overall very satisfied.",
    date: "2 months ago",
  },
]

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(mockProfile)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setProfileData({
      ...profileData,
      [field]: e.target.value,
    })
  }

  const handleSave = () => {
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Profile Header */}
      <div className="border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <img
                  src={profileData.photoURL || "/placeholder.svg"}
                  alt={profileData.displayName}
                  className="h-24 w-24 rounded-full border-4 border-primary/20"
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                    <Edit2 className="h-6 w-6 text-white" />
                    <input type="file" accept="image/*" className="hidden" />
                  </label>
                )}
              </div>

              <div className="space-y-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => handleInputChange(e, "displayName")}
                    className="text-3xl font-bold bg-background border border-border rounded-lg px-4 py-2 text-foreground"
                  />
                ) : (
                  <h1 className="text-4xl font-bold">{profileData.displayName}</h1>
                )}

                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-card border border-border">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-semibold">{profileData.rating}</span>
                    <span className="text-sm text-muted-foreground">({profileData.reviewCount} reviews)</span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-card border border-border">
                    <Award className="h-4 w-4 text-accent" />
                    <span className="text-sm">{profileData.completedDeliveries} Deliveries</span>
                  </div>

                  <div className="text-sm text-muted-foreground">Joined {profileData.joinDate}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="bg-transparent">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 bg-transparent">
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="gap-2 bg-transparent">
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">About</h2>
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange(e, "bio")}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors h-24 resize-none"
                />
              ) : (
                <p className="text-muted-foreground text-lg">{profileData.bio}</p>
              )}
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Profession */}
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    Profession
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.profession}
                      onChange={(e) => handleInputChange(e, "profession")}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground text-sm"
                    />
                  ) : (
                    <p className="font-semibold">{profileData.profession}</p>
                  )}
                </div>

                {/* Education */}
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    Education
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.education}
                      onChange={(e) => handleInputChange(e, "education")}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground text-sm"
                    />
                  ) : (
                    <p className="font-semibold">{profileData.education}</p>
                  )}
                </div>

                {/* Hometown */}
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapIcon className="h-4 w-4" />
                    Hometown
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.hometown}
                      onChange={(e) => handleInputChange(e, "hometown")}
                      className="w-full px-3 py-2 bg-background border border-border rounded text-foreground text-sm"
                    />
                  ) : (
                    <p className="font-semibold">{profileData.hometown}</p>
                  )}
                </div>

                {/* Email */}
                <div className="p-4 rounded-lg bg-card border border-border space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-semibold">{profileData.email}</p>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Reviews ({mockReviews.length})</h2>

              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div key={review.id} className="p-6 rounded-lg bg-card border border-border space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={review.reviewerAvatar || "/placeholder.svg"}
                          alt={review.reviewerName}
                          className="h-10 w-10 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold">{review.reviewerName}</h3>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-4">
            
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { X, Star, Award, MessageSquare, MapPin, BookOpen, Briefcase } from "lucide-react"
import { Button } from "./ui/button"

interface UserProfileModalProps {
  onClose: () => void
}

export function UserProfileModal({ onClose }: UserProfileModalProps) {
  const userProfile = {
    displayName: "Sarah Martinez",
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-border bg-background/95 backdrop-blur">
          <h2 className="text-xl font-bold">User Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-card rounded-lg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center text-center space-y-3">
            <img
              src={userProfile.photoURL || "/placeholder.svg"}
              alt={userProfile.displayName}
              className="h-20 w-20 rounded-full border-4 border-primary/20"
            />
            <div>
              <h3 className="text-2xl font-bold">{userProfile.displayName}</h3>
              <p className="text-sm text-muted-foreground">Joined {userProfile.joinDate}</p>
            </div>
          </div>

          {/* Rating & Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-card border border-border text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-bold text-lg">{userProfile.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground">{userProfile.reviewCount} reviews</p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="h-4 w-4 text-accent" />
                <span className="font-bold text-lg">{userProfile.completedDeliveries}</span>
              </div>
              <p className="text-xs text-muted-foreground">Deliveries</p>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">About</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{userProfile.bio}</p>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Details</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Profession:</span>
                <span className="font-medium">{userProfile.profession}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Education:</span>
                <span className="font-medium">{userProfile.education}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">Hometown:</span>
                <span className="font-medium">{userProfile.hometown}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" size="sm">
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

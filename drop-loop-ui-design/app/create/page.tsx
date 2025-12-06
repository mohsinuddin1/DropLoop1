"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, MapPin, Package, Plane, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"

export default function CreatePost() {
  const [postType, setPostType] = useState<"travel" | "item">("item")
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold tracking-tight">Create a Post</h1>
          <p className="text-muted-foreground mt-2">Share what you're traveling with or sending</p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <button
            onClick={() => setPostType("item")}
            className={`p-6 rounded-xl border-2 transition-all text-left space-y-3 ${
              postType === "item" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className={`h-6 w-6 ${postType === "item" ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="font-semibold">I Want to Send an Item</h3>
            </div>
            <p className="text-sm text-muted-foreground">Post items you want to send with a traveler</p>
          </button>

          <button
            onClick={() => setPostType("travel")}
            className={`p-6 rounded-xl border-2 transition-all text-left space-y-3 ${
              postType === "travel" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Plane className={`h-6 w-6 ${postType === "travel" ? "text-primary" : "text-muted-foreground"}`} />
              <h3 className="font-semibold">I am Travelling</h3>
            </div>
            <p className="text-sm text-muted-foreground">Share your travel route and earn money carrying items</p>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-8">
          {/* Route Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Route Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Departure city"
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Destination city"
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Schedule</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Departure Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Arrival Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item/Travel Specific Fields */}
          {postType === "item" ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Item Details</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g., Electronics, Documents, Clothes"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight</label>
                  <input
                    type="text"
                    placeholder="e.g., 2kg"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Offer Price (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., $50"
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Describe the item, any fragile/special instructions"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors h-24 resize-none"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Item Photo (Optional)</label>
                <div className="relative">
                  {!uploadedImage ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-background/50 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Item"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setUploadedImage(null)}
                        className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-4 w-4 text-destructive-foreground" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Travel Details</h2>

              <div className="space-y-2">
                <label className="text-sm font-medium">Transport Mode</label>
                <select className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors">
                  <option>Flight</option>
                  <option>Train</option>
                  <option>Bus</option>
                  <option>Car</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <input
                  type="text"
                  placeholder="e.g., 5kg, 2 packages"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Additional Details</label>
                <textarea
                  placeholder="Any special notes, restrictions, or additional information"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors h-24 resize-none"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-4 pt-8 border-t border-border">
            <Button variant="outline" className="flex-1 bg-transparent">
              Save as Draft
            </Button>
            <Button className="flex-1">Publish Post</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

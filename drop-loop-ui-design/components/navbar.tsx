"use client"

import { Menu, X, MessageCircle, LogOut, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Image from "next/image"
import { Button } from "./ui/button"
import { useTheme } from "@/app/theme"
import { UserProfileModal } from "./user-profile-modal"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState(false)
  const { isDark, setIsDark } = useTheme()
  const router = useRouter()
  const isLoggedIn = false // TODO: Connect to auth

  const handleLogoClick = () => {
    router.push("/")
  }

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity group"
            >
              <div className="relative h-8 w-8 flex items-center justify-center rounded-lg group-hover:bg-primary/10 transition-colors">
                <Image src="/droploop-logo.png" alt="DropLoop" width={32} height={32} className="object-contain" />
              </div>
              
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/posts" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Browse Posts
              </Link>
              <Link href="/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Create Post
              </Link>
              <Link
                href="/messages"
                className="relative text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-destructive text-xs text-destructive-foreground flex items-center justify-center hidden">
                  2
                </span>
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {isLoggedIn ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserProfile(true)}
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                      alt="User"
                      className="h-8 w-8 rounded-full"
                    />
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)} className="rounded-full">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-border py-4 space-y-3">
              <Link
                href="/posts"
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors"
              >
                Browse Posts
              </Link>
              <Link
                href="/create"
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors"
              >
                Create Post
              </Link>
              <Link
                href="/messages"
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors"
              >
                Messages
              </Link>
              <Link
                href="/dashboard"
                className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors"
              >
                Dashboard
              </Link>
              <div className="border-t border-border pt-3 space-y-2">
                {isLoggedIn ? (
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link href="/login" className="block">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup" className="block">
                      <Button size="sm" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* User Profile Modal */}
      {showUserProfile && <UserProfileModal onClose={() => setShowUserProfile(false)} />}
    </>
  )
}

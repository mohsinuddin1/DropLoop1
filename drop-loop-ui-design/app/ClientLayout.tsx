"use client"

import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { useState, useEffect } from "react"
import { ThemeContext } from "./theme"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") || "dark"
    setIsDark(savedTheme === "dark")
  }, [])

  useEffect(() => {
    if (mounted) {
      const html = document.documentElement
      if (isDark) {
        html.classList.add("dark")
        html.classList.remove("light")
        localStorage.setItem("theme", "dark")
      } else {
        html.classList.remove("dark")
        html.classList.add("light")
        localStorage.setItem("theme", "light")
      }
    }
  }, [isDark, mounted])

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      <div className={`${geist.className} font-sans antialiased`}>
        {children}
        <Analytics />
      </div>
    </ThemeContext.Provider>
  )
}

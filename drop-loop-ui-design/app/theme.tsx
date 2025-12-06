"use client"

import { createContext, useContext } from "react"

export const ThemeContext = createContext<{
  isDark: boolean
  setIsDark: (dark: boolean) => void
}>({
  isDark: true,
  setIsDark: () => {},
})

export const useTheme = () => useContext(ThemeContext)

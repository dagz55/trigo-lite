"use client"

import { useEffect, useState } from "react"
import { AnimatedLogo } from "@/components/animated-logo"

interface TriGOLoadingProps {
  size?: number
  color?: string
  fullPage?: boolean
  showText?: boolean
}

export function TriGOLoading({ size = 24, color = "#8b5cf6", fullPage = false, showText = true }: TriGOLoadingProps) {
  const [text, setText] = useState("")
  const fullText = "TriGO"

  // Handle typing effect animation
  useEffect(() => {
    if (!showText) return

    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setText(fullText.substring(0, currentIndex))
        currentIndex++
      } else {
        // Reset to start typing again
        currentIndex = 0
      }
    }, 200)

    return () => clearInterval(typingInterval)
  }, [showText])

  // Calculate sizes based on whether it's full page or not
  const logoSize = fullPage ? size * 3 : size
  const containerClasses = fullPage
    ? "fixed inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-trigo-900/80 z-50"
    : "relative flex flex-col items-center justify-center"

  return (
    <div
      className={containerClasses}
      style={{
        width: fullPage ? "100%" : `${logoSize}px`,
        height: fullPage ? "100%" : `${logoSize}px`,
      }}
    >
      <AnimatedLogo size={logoSize} className={fullPage ? "shadow-glow animate-pulse-glow" : ""} />

      {showText && (
        <div
          className="mt-4 font-bold text-transparent bg-clip-text bg-gradient-to-r from-trigo-500 to-trigo-700 dark:from-trigo-400 dark:to-trigo-600"
          style={{
            fontSize: fullPage ? "2rem" : "1rem",
            height: fullPage ? "2.5rem" : "1.5rem",
            minWidth: fullPage ? "6rem" : "3rem",
            textAlign: "center",
          }}
        >
          {text}
          <span className="animate-pulse">|</span>
        </div>
      )}
    </div>
  )
}

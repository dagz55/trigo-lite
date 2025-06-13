"use client"

import { ArrowLeft, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedLogo } from "@/components/animated-logo"

export function HeaderRide() {
  const router = useRouter()

  // Create a robust goBack function that uses multiple methods
  const goBack = useCallback(() => {
    console.log("Back button clicked")

    try {
      // Try using Next.js router first
      router.back()
      console.log("Used router.back()")
    } catch (error) {
      console.error("router.back() failed:", error)

      // Fallback to window.history if router fails
      try {
        window.history.back()
        console.log("Used window.history.back()")
      } catch (historyError) {
        console.error("window.history.back() failed:", historyError)

        // Last resort: try to navigate to a specific page
        try {
          router.push("/")
          console.log("Used router.push('/')")
        } catch (pushError) {
          console.error("router.push('/') failed:", pushError)
        }
      }
    }
  }, [router])

  return (
    <div className="flex items-center justify-between p-4 border-b border-trigo-200 dark:border-trigo-800">
      <button
        type="button"
        onClick={goBack}
        aria-label="Go back"
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-trigo-100 dark:hover:bg-trigo-800 transition-colors hover:shadow-glow-sm"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2">
        <AnimatedLogo size={32} className="shadow-glow-sm" />
        <h1 className="text-lg font-medium">Book a Ride</h1>
      </div>
      <div className="flex items-center">
        <ThemeToggle />
        <button
          type="button"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-trigo-100 dark:hover:bg-trigo-800 transition-colors hover:shadow-glow-sm"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

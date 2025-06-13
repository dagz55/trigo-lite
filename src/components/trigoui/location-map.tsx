"use client"
import type { TODA } from "@/lib/location-utils"
import { TriGOLoading } from "@/components/trigoui/trigo-loading"
import { MapPin, Locate } from "lucide-react"
import { isGeolocationBlockedByPolicy } from "@/lib/location-utils"
import { useEffect, useState, useRef } from "react"

interface LocationMapProps {
  userLocation: { lat: number; lng: number }
  selectedTODA: TODA | null
  isLoading: boolean
  apiKey: string
  onLocateMe?: () => void
}

export default function LocationMap({ userLocation, selectedTODA, isLoading, apiKey, onLocateMe }: LocationMapProps) {
  const [geolocationBlocked, setGeolocationBlocked] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Check if geolocation is blocked by policy
  useEffect(() => {
    setGeolocationBlocked(isGeolocationBlockedByPolicy())
  }, [])

  // Handle locate me button click with loading state
  const handleLocateMe = () => {
    if (onLocateMe) {
      setIsLocating(true)
      onLocateMe()

      // Simulate a delay to show loading state
      setTimeout(() => {
        setIsLocating(false)
      }, 1500)
    }
  }

  // Simple map placeholder that doesn't use Google Maps
  if (isLoading) {
    return (
      <div className="w-full h-40 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
        <TriGOLoading size={30} showText={false} />
      </div>
    )
  }

  return (
    <div className="w-full h-40 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden relative honeycomb-bg">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {selectedTODA ? selectedTODA.name : "Current Location"}
          </p>
          {selectedTODA && <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">{selectedTODA.area}</p>}
        </div>
      </div>

      {/* Locate Me button - only show if geolocation is not blocked by policy */}
      {onLocateMe && !geolocationBlocked && (
        <button
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1.5 bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 rounded-md shadow-md border border-zinc-200 dark:border-zinc-600 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          {isLocating ? <TriGOLoading size={12} showText={false} /> : <Locate className="w-3 h-3" />}
          Locate Me
        </button>
      )}
    </div>
  )
}

"use client"

import { MapPin, Home, History, Star } from "lucide-react"
import { useState } from "react"

type LocationType = "home" | "recent" | "favorite" | "default"

interface SavedLocation {
  type: LocationType
  name: string
  description?: string
  coordinates: {
    lat: number
    lng: number
  }
  todaId?: string
}

interface SavedLocationButtonProps {
  onSelect: (location: SavedLocation) => void
  className?: string
}

export const SavedLocationButton = ({ onSelect, className = "" }: SavedLocationButtonProps) => {
  // For this mock test, we'll use Las Piñas Talon Kuatro as the default location
  // Converting from 14°26'05.7"N, 121°00'10.7"E to decimal degrees
  const defaultLocation: SavedLocation = {
    type: "default",
    name: "Las Piñas Talon Kuatro",
    description: "Default location for mock test",
    coordinates: {
      lat: 14.4349167, // 14°26'05.7"N
      lng: 121.0029722, // 121°00'10.7"E
    },
    todaId: "toda-lp-18",
  }

  // In a real app, we would fetch these from user preferences or history
  const [savedLocations] = useState<SavedLocation[]>([defaultLocation])

  // For the mock test, we'll just use the default location
  const primaryLocation = savedLocations[0]

  // Icon mapping based on location type
  const getIcon = (type: LocationType) => {
    switch (type) {
      case "home":
        return <Home className="h-3.5 w-3.5" />
      case "recent":
        return <History className="h-3.5 w-3.5" />
      case "favorite":
        return <Star className="h-3.5 w-3.5" />
      default:
        return <MapPin className="h-3.5 w-3.5" />
    }
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(primaryLocation)}
      className={`flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors ${className}`}
    >
      {getIcon(primaryLocation.type)}
      <span>{primaryLocation.name}</span>
    </button>
  )
}

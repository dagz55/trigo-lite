"use client"

import type React from "react"

import { MapPin, Navigation, Sparkles, Search, Clock, CreditCard, Locate } from "lucide-react"
import { SettingsRide } from "@/components/trigoui/settings-ride"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useState, useRef, useEffect } from "react"
import type { TODA } from "@/lib/location-utils"
import { calculateFare } from "@/lib/distance-utils"
import { SavedLocationButton } from "./saved-location-button"
import { TriGOLoading } from "./trigo-loading"
import { isGeolocationBlockedByPolicy } from "@/lib/location-utils"

interface RideSettings {
  rideType: string
  paymentMethod: string
  priority: string
  passengers: string
  toda: string
}

interface FormProps {
  onSubmit: (e: React.FormEvent) => void
  settings: RideSettings
  onSettingsChange: (settings: RideSettings) => void
  nearbyTODAs: TODA[]
  userLocation: { lat: number; lng: number } | null
  selectedTODA: TODA | null
  onSavedLocationSelect?: (location: any) => void
  onLocateMe?: () => void
}

export const FormRide = ({
  onSubmit,
  settings,
  onSettingsChange,
  nearbyTODAs,
  userLocation,
  selectedTODA,
  onSavedLocationSelect,
  onLocateMe,
}: FormProps) => {
  const [todaSearch, setTodaSearch] = useState("")
  const [pickupValue, setPickupValue] = useState(
    userLocation
      ? settings.toda
        ? `Near ${nearbyTODAs.find((toda) => toda.id === settings.toda)?.name}`
        : "Current Location"
      : "Enter your location",
  )
  const [destinationValue, setDestinationValue] = useState(
    selectedTODA ? `${selectedTODA.name} exit point (labasan)` : "exit point (labasan)",
  )
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [isLoadingDestinationSuggestions, setIsLoadingDestinationSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const pickupInputRef = useRef<HTMLInputElement>(null)
  const destinationInputRef = useRef<HTMLInputElement>(null)
  const [geolocationBlocked, setGeolocationBlocked] = useState(false)

  // New state variables for distance and fare calculation
  const [distance, setDistance] = useState<number | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [fare, setFare] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationError, setCalculationError] = useState<string | null>(null)

  // Google Maps API Key
  const googleMapsApiKey = "AIzaSyCocElqSxBeihmCxzVdtg9D7wEEObPHYjM"

  // Check if geolocation is blocked by policy
  useEffect(() => {
    setGeolocationBlocked(isGeolocationBlockedByPolicy())
  }, [])

  // Update destination when selectedTODA changes
  useEffect(() => {
    setDestinationValue(selectedTODA ? `${selectedTODA.name} exit point (labasan)` : "exit point (labasan)")
  }, [selectedTODA])

  // Filter TODAs based on search
  const filteredTODAs = nearbyTODAs.filter((toda) => toda.name.toLowerCase().includes(todaSearch.toLowerCase()))

  const selectedTODA_local = nearbyTODAs.find((toda) => toda.id === settings.toda)

  // Pre-load location suggestions for faster response
  useEffect(() => {
    if (selectedTODA_local) {
      // Pre-generate some location suggestions based on the selected TODA
      const suggestions = [
        `Near ${selectedTODA_local.name}`,
        `${selectedTODA_local.area} Main Road`,
        `${selectedTODA_local.area} Market`,
        `${selectedTODA_local.area} Plaza`,
        `${selectedTODA_local.area} Terminal`,
      ]
      setLocationSuggestions(suggestions)

      // Pre-generate destination suggestions based on the selected TODA area
      const destSuggestions = [
        `${selectedTODA_local.name} exit point (labasan)`,
        `${selectedTODA_local.area} Mall`,
        `${selectedTODA_local.area} Hospital`,
        `${selectedTODA_local.area} Church`,
        `${selectedTODA_local.area} School`,
        `${selectedTODA_local.area} Park`,
        `${selectedTODA_local.area} Market`,
        `${selectedTODA_local.area} Plaza`,
        `${selectedTODA_local.area} Terminal`,
        `${selectedTODA_local.area} Main Road`,
      ]

      // Add specific locations for Talon Kuatro
      if (selectedTODA_local.area === "Las Piñas") {
        destSuggestions.push(
          "SM Southmall",
          "Las Piñas City Hall",
          "Las Piñas General Hospital",
          "Robinsons Las Piñas",
          "University of Perpetual Help",
          "Zapote Road",
          "CAA Road",
          "BF Resort",
          "Pilar Village",
          "Verdant Acres",
        )
      }

      setDestinationSuggestions(destSuggestions)
    }
  }, [selectedTODA_local])

  // Calculate distance and fare when both pickup and destination are set
  useEffect(() => {
    const calculateDistanceAndFare = async () => {
      // Only calculate if both pickup and destination are set and not default values
      if (
        pickupValue &&
        destinationValue &&
        pickupValue !== "Enter your location" &&
        pickupValue !== "Current Location" &&
        destinationValue !== "exit point (labasan)"
      ) {
        setIsCalculating(true)
        setCalculationError(null)

        try {
          // For demo purposes, we'll use a simulated API call
          // In a real app, you would use the actual Google Maps Distance Matrix API
          // const result = await calculateDistance(pickupValue, destinationValue, googleMapsApiKey);

          // Simulated API response for demo
          const simulatedDistance = Math.random() * 8 + 1 // Random distance between 1-9 km
          const simulatedDuration = simulatedDistance * 3 // Roughly 3 minutes per km

          setDistance(Number.parseFloat(simulatedDistance.toFixed(1)))
          setDuration(Math.round(simulatedDuration))

          // Calculate fare based on distance
          const calculatedFare = calculateFare(simulatedDistance)
          setFare(Math.round(calculatedFare)) // Round to nearest peso
        } catch (error) {
          console.error("Error calculating distance and fare:", error)
          setCalculationError("Could not calculate fare. Please try again.")
        } finally {
          setIsCalculating(false)
        }
      } else {
        // Reset values if conditions aren't met
        setDistance(null)
        setDuration(null)
        setFare(null)
        setCalculationError(null)
      }
    }

    calculateDistanceAndFare()
  }, [pickupValue, destinationValue])

  // Handle saved location selection
  const handleSavedLocationSelect = (location: any) => {
    if (onSavedLocationSelect) {
      onSavedLocationSelect(location)
      // Update pickup value to reflect the selected location
      setPickupValue(location.name)
      // Clear destination when pickup changes
      setDestinationValue("")
    } else {
      // Fallback if the prop isn't provided
      console.log("Selected saved location:", location)

      // Find the TODA associated with this location
      const toda = nearbyTODAs.find((t) => t.id === location.todaId)
      if (toda) {
        onSettingsChange({ ...settings, toda: toda.id })
        setPickupValue(location.name)
        // Clear destination when pickup changes
        setDestinationValue("")
      }
    }
  }

  // Handle pickup input click - clear the value
  const handlePickupClick = () => {
    setPickupValue("")
    if (pickupInputRef.current) {
      pickupInputRef.current.focus()
    }
    // Clear destination when pickup is clicked
    setDestinationValue("")
  }

  // Handle destination input click
  const handleDestinationClick = () => {
    setDestinationValue("")
    setShowDestinationSuggestions(true)
    if (destinationInputRef.current) {
      destinationInputRef.current.focus()
    }
  }

  // Handle locate me button click
  const handleLocateMe = () => {
    if (onLocateMe) {
      setIsLocating(true)
      onLocateMe()
      setPickupValue("Current Location")

      // Simulate a delay to show loading state
      setTimeout(() => {
        setIsLocating(false)
      }, 1500)
    }
  }

  // Simulate quick loading of location suggestions
  const handlePickupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPickupValue(value)

    // Clear destination when pickup changes
    setDestinationValue("")

    if (value.length > 1) {
      // Reduced to 1 character for faster suggestions
      setIsLoadingSuggestions(true)
      // Simulate quick loading of suggestions (in a real app, this would be an API call)
      setTimeout(() => {
        const filteredSuggestions = locationSuggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase()),
        )
        // Add the current input as a suggestion if it's not already in the list
        if (!filteredSuggestions.includes(value) && value.length > 0) {
          filteredSuggestions.unshift(value)
        }
        setLocationSuggestions(filteredSuggestions)
        setIsLoadingSuggestions(false)
      }, 50) // Reduced to 50ms for even faster response
    }
  }

  // Handle destination change with auto-complete
  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDestinationValue(value)
    setShowDestinationSuggestions(true)

    if (value.length > 1) {
      setIsLoadingDestinationSuggestions(true)

      // Simulate quick loading of suggestions
      setTimeout(() => {
        const filteredSuggestions = destinationSuggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(value.toLowerCase()),
        )

        // Add the current input as a suggestion if it's not already in the list
        if (!filteredSuggestions.includes(value) && value.length > 0) {
          filteredSuggestions.unshift(value)
        }

        setDestinationSuggestions(filteredSuggestions)
        setIsLoadingDestinationSuggestions(false)
      }, 50)
    } else {
      setShowDestinationSuggestions(false)
    }
  }

  // Handle clicking outside to close suggestion dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationInputRef.current && !destinationInputRef.current.contains(event.target as Node)) {
        setShowDestinationSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 flex-1 p-4 justify-between honeycomb-bg">
      <div className="space-y-4">
        {/* Pickup location input field */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-500">Pickup Location</span>
            </div>
            <div className="flex items-center gap-2">
              {onLocateMe && !geolocationBlocked && (
                <button
                  type="button"
                  onClick={handleLocateMe}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-trigo-50 dark:bg-trigo-900/20 text-trigo-600 dark:text-trigo-400 rounded-full border border-trigo-200 dark:border-trigo-800 hover:bg-trigo-100 dark:hover:bg-trigo-900/30 transition-colors hover:shadow-glow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Locate Me
                </button>
              )}
              <SavedLocationButton onSelect={handleSavedLocationSelect} className="ml-auto" />
            </div>
          </div>
          <div className="relative">
            <Input
              ref={pickupInputRef}
              type="text"
              size={16}
              value={pickupValue}
              onChange={handlePickupChange}
              onClick={handlePickupClick}
              placeholder={userLocation ? "Enter your pickup location" : "Type your exact pickup address"}
              className={`w-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 rounded-xl focus:outline-hidden focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100 pr-10 ${!userLocation ? "border-amber-300 dark:border-amber-700" : ""}`}
            />
            {/* Pin Location Button */}
            {onLocateMe && !geolocationBlocked && (
              <button
                type="button"
                onClick={handleLocateMe}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-trigo-50 dark:bg-trigo-900/30 text-trigo-600 dark:text-trigo-400 hover:bg-trigo-100 dark:hover:bg-trigo-900/50 transition-colors hover:shadow-glow-sm"
                disabled={isLocating}
              >
                {isLocating ? <TriGOLoading size={16} showText={false} /> : <Locate className="w-4 h-4" />}
              </button>
            )}
          </div>
          {!userLocation && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              You can still book a ride without location access - just be specific about your pickup location.
            </p>
          )}

          {/* Quick location suggestions - Talon Cuatro locations */}
          {pickupValue.length > 1 && (
            <div className="mt-1 p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm quick-fade-in max-w-[250px]">
              <div className="px-2 py-1 border-b border-zinc-100 dark:border-zinc-700">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Talon Kuatro Locations</p>
              </div>
              <ul className="max-h-28 overflow-y-auto py-1">
                {[
                  "Talon Kuatro Main Road",
                  "Talon Kuatro Market",
                  "Talon Kuatro Elementary School",
                  "Talon Kuatro Basketball Court",
                  "Talon Kuatro Chapel",
                  "Zapote Road Junction",
                  "Verdant Acres, Talon Kuatro",
                  "Pilar Village Gate, Talon Kuatro",
                ]
                  .filter((location) => location.toLowerCase().includes(pickupValue.toLowerCase()))
                  .slice(0, 5)
                  .map((location, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => {
                          setPickupValue(location)
                          setDestinationValue("") // Clear destination when suggestion is selected
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-md"
                      >
                        {location}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* Destination input field */}
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-zinc-500" />
            <span className="text-sm text-zinc-500">Destination</span>
          </div>
          <Input
            ref={destinationInputRef}
            type="text"
            size={16}
            value={destinationValue}
            onChange={handleDestinationChange}
            onClick={handleDestinationClick}
            placeholder="Where are you going?"
            className="w-full bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 rounded-xl focus:outline-hidden focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-zinc-900 dark:focus-visible:border-zinc-100"
          />
          <p className="text-xs text-zinc-500">Default destination is the nearest terminal exit point ("labasan")</p>

          {/* Destination suggestions */}
          {showDestinationSuggestions && destinationValue.length > 1 && (
            <div className="absolute z-10 mt-1 p-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm quick-fade-in w-full max-w-[300px]">
              <div className="px-2 py-1 border-b border-zinc-100 dark:border-zinc-700">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Popular Destinations</p>
              </div>
              {isLoadingDestinationSuggestions ? (
                <div className="py-2 px-3 flex items-center justify-center">
                  <TriGOLoading size={16} showText={false} />
                  <span className="ml-2 text-xs text-zinc-500">Loading suggestions...</span>
                </div>
              ) : (
                <ul className="max-h-40 overflow-y-auto py-1">
                  {destinationSuggestions
                    .filter((location) => location.toLowerCase().includes(destinationValue.toLowerCase()))
                    .slice(0, 8)
                    .map((location, index) => (
                      <li key={index}>
                        <button
                          type="button"
                          onClick={() => {
                            setDestinationValue(location)
                            setShowDestinationSuggestions(false)
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-md"
                        >
                          {location}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Fare Calculation Display */}
        {isCalculating ? (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
            <TriGOLoading size={20} showText={false} />
            <span className="ml-2 text-sm text-zinc-500">Calculating fare...</span>
          </div>
        ) : fare !== null && distance !== null && duration !== null ? (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Estimated Fare</span>
              </div>
              <span className="text-lg font-bold text-green-700 dark:text-green-300">₱{fare.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-green-600 dark:text-green-400">
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Distance: {distance} km</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Duration: ~{duration} mins</span>
              </div>
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 pt-1 border-t border-green-100 dark:border-green-800/50">
              <p>Base fare: ₱25.00 (first 2km) + ₱10.00/km after</p>
            </div>
          </div>
        ) : calculationError ? (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{calculationError}</p>
          </div>
        ) : null}

        {/* TODA Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="toda">Select TODA</Label>
            {nearbyTODAs.length > 0 && (
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {nearbyTODAs.length} TODAs available in {nearbyTODAs[0]?.area || "your area"}
              </span>
            )}
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search TODAs..."
              className="pl-9 bg-zinc-100 dark:bg-zinc-800 border-0"
              value={todaSearch}
              onChange={(e) => setTodaSearch(e.target.value)}
            />
          </div>
          <Select
            value={settings.toda}
            onValueChange={(value) => {
              onSettingsChange({ ...settings, toda: value })
              // Clear destination when TODA changes
              setDestinationValue("")
            }}
          >
            <SelectTrigger className="w-full bg-zinc-100 dark:bg-zinc-800 border-0">
              <SelectValue placeholder="Select TODA" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {filteredTODAs.length > 0 ? (
                filteredTODAs.map((toda) => (
                  <SelectItem key={toda.id} value={toda.id}>
                    {toda.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-toda" disabled>
                  No TODAs available in your area
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Display nearest TODA information */}
          {settings.toda && nearbyTODAs.find((t) => t.id === settings.toda) && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-xs font-medium text-green-700 dark:text-green-300">
                  Nearest TODA: {nearbyTODAs.find((t) => t.id === settings.toda)?.name}
                </p>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 pl-6">
                Base fare: ₱{nearbyTODAs.find((t) => t.id === settings.toda)?.fareBase || 0}/km: ₱
                {nearbyTODAs.find((t) => t.id === settings.toda)?.farePerKm || 0}
              </p>
            </div>
          )}
        </div>
      </div>

      <SettingsRide settings={settings} onSettingsChange={onSettingsChange} />

      <button
        type="submit"
        className="w-full h-9 flex items-center justify-center gap-2 bg-trigo-600 hover:bg-trigo-700 dark:bg-trigo-600 dark:hover:bg-trigo-700 text-white text-sm font-medium rounded-xl transition-colors self-end btn-glow"
      >
        <Sparkles className="w-4 h-4" />
        Find Riders
      </button>
    </form>
  )
}

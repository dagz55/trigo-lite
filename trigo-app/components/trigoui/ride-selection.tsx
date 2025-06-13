"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Preview } from "@/components/trigoui/preview-ride"
import { ErrorRide } from "@/components/trigoui/error-ride"
import { FormRide } from "@/components/trigoui/form-ride"
import { HeaderRide } from "@/components/trigoui/header-ride"
import LocationMap from "@/components/trigoui/location-map"
import { TriGOLoading } from "@/components/trigoui/trigo-loading"
import {
  getCurrentPosition,
  findNearestTODA,
  todaData,
  getAllAreas,
  type TODA,
  isLocationPermissionDenied,
  isGeolocationBlockedByPolicy,
  getDefaultLocation,
} from "@/lib/location-utils"
import { MapPin, Search, AlertTriangle, Info } from "lucide-react"
import { Input } from "@/components/ui/input"

interface RideSettings {
  rideType: string
  paymentMethod: string
  priority: string
  passengers: string
  toda: string
}

export default function RideSelection() {
  const [showForm, setShowForm] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedTODA, setSelectedTODA] = useState<TODA | null>(null)
  const [nearbyTODAs, setNearbyTODAs] = useState<TODA[]>([])
  const [areaSearch, setAreaSearch] = useState("")
  const [showManualSelection, setShowManualSelection] = useState(false)
  const [settings, setSettings] = useState<RideSettings>({
    rideType: "tricycle",
    paymentMethod: "cash",
    priority: "standard",
    passengers: "1",
    toda: "",
  })
  const [destination, setDestination] = useState<string>("exit point (labasan)")
  const [geolocationBlocked, setGeolocationBlocked] = useState(false)

  // Instead of trying to load Google Maps, just set mapsLoaded to true
  const [mapsLoaded, setMapsLoaded] = useState(true)
  const googleMapsApiKey = "AIzaSyCocElqSxBeihmCxzVdtg9D7wEEObPHYjM"

  // Add these state variables to the component
  const [calculatedFare, setCalculatedFare] = useState<number>(75) // Default fare
  const [calculatedDistance, setCalculatedDistance] = useState<number>(3.5) // Default distance
  const [calculatedDuration, setCalculatedDuration] = useState<number>(12) // Default duration

  // Check if geolocation is available and not blocked by policy
  useEffect(() => {
    const blocked = isGeolocationBlockedByPolicy()
    setGeolocationBlocked(blocked)

    if (blocked) {
      setError("Geolocation has been disabled by permissions policy. Please use manual location selection.")
      setShowManualSelection(true)
    }
  }, [])

  // Set default location to Las Piñas Talon Kuatro immediately on component mount
  useEffect(() => {
    // Las Piñas Talon Kuatro coordinates (14°26'05.7"N, 121°00'10.7"E)
    const defaultLocation = getDefaultLocation()
    setUserLocation(defaultLocation)

    // Find the TODA for Talon Kuatro
    const talonKuatroTODA = todaData.find((t) => t.id === "toda-lp-18")
    if (talonKuatroTODA) {
      setSelectedTODA(talonKuatroTODA)
      setSettings((prev) => ({ ...prev, toda: talonKuatroTODA.id }))

      // Get nearby TODAs in Las Piñas
      const nearbyTODAs = todaData.filter((t) => t.area === "Las Piñas")
      setNearbyTODAs(nearbyTODAs)

      // Set destination with the TODA name
      setDestination(`${talonKuatroTODA.name} exit point (labasan)`)
    }
  }, []) // Empty dependency array to run only once on mount

  // Get all unique areas
  const allAreas = getAllAreas()

  // Filter areas based on search
  const filteredAreas = allAreas.filter((area) => area.toLowerCase().includes(areaSearch.toLowerCase()))

  // Handle manual location selection
  const handleManualLocationSelect = useCallback((area: string) => {
    // Clear error message
    setError(null)

    // Filter TODAs by selected area
    const areaTodasList = todaData.filter((toda) => toda.area === area)
    setNearbyTODAs(areaTodasList)

    console.log(`Selected area: ${area}, found ${areaTodasList.length} TODAs`)

    if (areaTodasList.length > 0) {
      // Set the first TODA in the area as selected
      const firstToda = areaTodasList[0]
      setSelectedTODA(firstToda)
      setSettings((prev) => ({ ...prev, toda: firstToda.id }))

      // Update user location to the TODA's location
      setUserLocation(firstToda.coordinates)

      // Update destination
      setDestination(`${firstToda.name} exit point (labasan)`)

      // Hide the manual selection UI after successful selection
      setShowManualSelection(false)
    }
  }, [])

  // Helper function to detect browser for instructions
  const detectBrowser = () => {
    if (typeof window === "undefined") return "unknown"

    const userAgent = navigator.userAgent.toLowerCase()

    if (userAgent.includes("chrome")) return "chrome"
    if (userAgent.includes("firefox")) return "firefox"
    if (userAgent.includes("safari") && !userAgent.includes("chrome")) return "safari"
    if (userAgent.includes("edge")) return "edge"

    return "unknown"
  }

  // Helper function to provide browser-specific instructions
  const getLocationEnableInstructions = (browser: string) => {
    switch (browser) {
      case "chrome":
        return "To enable, click the lock icon in your address bar and allow location access."
      case "firefox":
        return "To enable, click the shield icon in your address bar and allow location access."
      case "safari":
        return "To enable, go to Safari > Preferences > Websites > Location and allow for this site."
      case "edge":
        return "To enable, click the lock icon in your address bar and allow location access."
      default:
        return "To enable, check your browser settings to allow location access for this site."
    }
  }

  const handleLocationError = useCallback((error: Error) => {
    console.error("Error getting location:", error)

    let errorMessage = error.message || "Could not access your location. Please select manually."

    // Check for permissions policy error
    if (errorMessage.toLowerCase().includes("permissions policy")) {
      errorMessage = "Geolocation has been disabled by permissions policy. Please use manual location selection."
      setGeolocationBlocked(true)
      // Show manual selection UI immediately
      setShowManualSelection(true)
    } else if (errorMessage.includes("denied")) {
      // Show manual selection UI when location is denied
      const browserName = detectBrowser()
      errorMessage = `Location access was denied. ${getLocationEnableInstructions(browserName)}`
      setShowManualSelection(true)
    }

    setError(errorMessage)
  }, [])

  // Add this function to handle the "Locate Me" button click
  const handleLocateMe = useCallback(() => {
    // If geolocation is blocked by policy, don't even try
    if (geolocationBlocked) {
      setError("Geolocation has been disabled by permissions policy. Please use manual location selection.")
      setShowManualSelection(true)
      return
    }

    setIsLocating(true)
    setError(null)

    // Remove the denied flag from localStorage to allow a fresh attempt
    if (typeof window !== "undefined") {
      localStorage.removeItem("locationAccessDenied")
    }

    getCurrentPosition()
      .then((position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        // Find nearest TODA
        const nearestTODA = findNearestTODA(latitude, longitude)
        setSelectedTODA(nearestTODA)

        // Update settings
        setSettings((prev) => ({ ...prev, toda: nearestTODA.id }))

        // Get nearby TODAs - get all TODAs in the same area as the nearest TODA
        const area = nearestTODA.area
        const nearbyTODAs = todaData.filter((toda) => toda.area === area)
        setNearbyTODAs(nearbyTODAs)

        // Update destination
        setDestination(`${nearestTODA.name} exit point (labasan)`)

        console.log(`Found ${nearbyTODAs.length} TODAs in ${area}`)

        // Hide manual selection on successful location access
        setShowManualSelection(false)
      })
      .catch(handleLocationError)
      .finally(() => {
        setIsLocating(false)
      })
  }, [
    handleLocationError,
    setSettings,
    setSelectedTODA,
    setUserLocation,
    setNearbyTODAs,
    setDestination,
    setShowManualSelection,
    setError,
    geolocationBlocked,
  ])

  const retryLocationAccess = useCallback(() => {
    // If geolocation is blocked by policy, don't even try
    if (geolocationBlocked) {
      setError("Geolocation has been disabled by permissions policy. Please use manual location selection.")
      setShowManualSelection(true)
      return
    }

    // Clear any errors before retrying
    setError(null)
    setIsLocating(true)

    // Remove the denied flag from localStorage to allow a fresh attempt
    if (typeof window !== "undefined") {
      localStorage.removeItem("locationAccessDenied")
    }

    // Try to get location again
    getCurrentPosition()
      .then((position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        // Find nearest TODA
        const nearestTODA = findNearestTODA(latitude, longitude)
        setSelectedTODA(nearestTODA)

        // Update settings
        setSettings((prev) => ({ ...prev, toda: nearestTODA.id }))

        // Get nearby TODAs - get all TODAs in the same area as the nearest TODA
        const area = nearestTODA.area
        const nearbyTODAs = todaData.filter((toda) => toda.area === area)
        setNearbyTODAs(nearbyTODAs)

        // Update destination
        setDestination(`${nearestTODA.name} exit point (labasan)`)

        console.log(`Found ${nearbyTODAs.length} TODAs in ${area}`)

        // Hide manual selection on successful location access
        setShowManualSelection(false)
      })
      .catch(handleLocationError)
      .finally(() => {
        setIsLocating(false)
      })
  }, [
    handleLocationError,
    setSettings,
    setSelectedTODA,
    setUserLocation,
    setNearbyTODAs,
    setDestination,
    setShowManualSelection,
    setError,
    geolocationBlocked,
  ])

  // Add a function to center the map on user location
  const centerOnUserLocation = () => {
    // If geolocation is blocked by policy, don't even try
    if (geolocationBlocked) {
      setError("Geolocation has been disabled by permissions policy. Please use manual location selection.")
      return
    }

    if (userLocation && !isLocationPermissionDenied()) {
      // If we already have a location and permission isn't denied, we don't need to do anything
      // The LocationMap component will handle centering
      return
    }

    // If we don't have a location or permission was denied, try to get it again
    setIsLocating(true)

    // Remove the denied flag from localStorage to allow a fresh attempt
    if (typeof window !== "undefined") {
      localStorage.removeItem("locationAccessDenied")
    }

    getCurrentPosition()
      .then((position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })

        // Find nearest TODA
        const nearestTODA = findNearestTODA(latitude, longitude)
        setSelectedTODA(nearestTODA)

        // Update settings
        setSettings((prev) => ({ ...prev, toda: nearestTODA.id }))

        // Get nearby TODAs - get all TODAs in the same area as the nearest TODA
        const area = nearestTODA.area
        const nearbyTODAs = todaData.filter((toda) => toda.area === area)
        setNearbyTODAs(nearbyTODAs)

        // Update destination
        setDestination(`${nearestTODA.name} exit point (labasan)`)

        console.log(`Found ${nearbyTODAs.length} TODAs in ${area}`)

        // Clear any location error
        setError(null)

        // Hide manual selection on successful location access
        setShowManualSelection(false)
      })
      .catch(handleLocationError)
      .finally(() => {
        setIsLocating(false)
      })
  }

  // Update selected TODA when settings change
  useEffect(() => {
    if (settings.toda) {
      const toda = todaData.find((t) => t.id === settings.toda)
      if (toda && (!selectedTODA || selectedTODA.id !== toda.id)) {
        setSelectedTODA(toda)
        // Update destination when TODA changes
        setDestination(`${toda.name} exit point (labasan)`)
      }
    }
  }, [settings.toda, selectedTODA])

  // Add this function to handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowForm(false)
    setIsLoading(true)
    setError(null)

    try {
      // In a real app, you would make an API call here
      // For demo purposes, we'll use a timeout to simulate loading
      setTimeout(() => {
        setShowForm(false)
        setIsLoading(false)

        // Use the calculated values or defaults
        setCalculatedFare(75)
        setCalculatedDistance(3.5)
        setCalculatedDuration(12)
      }, 3000)
    } catch (err) {
      setError("Failed to find riders. Please try again.")
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowForm(false)
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      setShowForm(false)
    } catch (err) {
      setError("Failed to find riders. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToSettings = () => {
    setShowForm(true)
    setError(null)
  }

  // Function to toggle manual selection UI
  const toggleManualSelection = () => {
    setShowManualSelection((prev) => !prev)
  }

  // Add a function to handle saved location selection
  const handleSavedLocationSelect = (location: any) => {
    // Clear any errors
    setError(null)

    // Set the user location to the saved location coordinates
    setUserLocation(location.coordinates)

    // Find the TODA associated with this location or the nearest one
    let toda
    if (location.todaId) {
      toda = todaData.find((t) => t.id === location.todaId)
    }

    if (!toda) {
      // If no TODA is specified or found, find the nearest one
      toda = findNearestTODA(location.coordinates.lat, location.coordinates.lng)
    }

    // Update selected TODA
    setSelectedTODA(toda)

    // Update settings
    setSettings((prev) => ({ ...prev, toda: toda.id }))

    // Update destination
    setDestination(`${toda.name} exit point (labasan)`)

    // Get nearby TODAs - get all TODAs in the same area as the selected TODA
    const area = toda.area
    const nearbyTODAs = todaData.filter((t) => t.area === area)
    setNearbyTODAs(nearbyTODAs)

    console.log(`Using saved location: ${location.name}, TODA: ${toda.name}`)

    // Hide manual selection if it's open
    setShowManualSelection(false)
  }

  return (
    <div className="group relative overflow-hidden w-full max-w-sm bg-white dark:bg-trigo-900 border border-trigo-200 dark:border-trigo-800 rounded-2xl transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] min-h-[500px] flex flex-col justify-between gap-2 honeycomb-pattern">
      <HeaderRide />
      <div className="flex-1 overflow-hidden flex flex-col">
        {error && <ErrorRide error={error} />}

        {/* Policy restriction notice */}
        {geolocationBlocked && !error && (
          <div className="px-4 pt-2">
            <div className="p-3 bg-trigo-50 dark:bg-trigo-900/20 border border-trigo-200 dark:border-trigo-800 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-trigo-500 dark:text-trigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-trigo-600 dark:text-trigo-400">
                  Geolocation is restricted in this environment. Please use manual location selection.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Manual Location Selection UI */}
        {(showManualSelection || (error && (error.includes("denied") || error.includes("policy")))) && (
          <div className="px-4 pt-2 pb-1">
            <div className="p-4 space-y-3 bg-trigo-50 dark:bg-trigo-800/50 rounded-xl border border-trigo-200 dark:border-trigo-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-trigo-900 dark:text-trigo-100 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-trigo-600" />
                  Manual Location Selection
                </h3>
                {!geolocationBlocked && (
                  <button
                    onClick={retryLocationAccess}
                    className="px-2 py-1 text-xs bg-trigo-50 dark:bg-trigo-900/20 text-trigo-600 hover:bg-trigo-100 dark:text-trigo-400 dark:hover:text-trigo-300 rounded-md transition-colors hover:shadow-glow-sm"
                  >
                    Try again
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-900/20 p-2 rounded-lg">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                <p>
                  {geolocationBlocked
                    ? "Geolocation is restricted in this environment. Please select your area manually."
                    : "Location access is required for accurate TODA selection. Please select your area manually below."}
                </p>
              </div>

              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-trigo-500" />
                <Input
                  type="text"
                  placeholder="Search areas..."
                  className="pl-9 bg-white dark:bg-trigo-700 border-trigo-200 dark:border-trigo-600"
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto py-1 px-0.5">
                {filteredAreas.map((area) => (
                  <button
                    key={area}
                    onClick={() => handleManualLocationSelect(area)}
                    className="py-2 px-3 text-sm bg-white dark:bg-trigo-700 rounded-lg border border-trigo-200 dark:border-trigo-600 hover:bg-trigo-50 dark:hover:bg-trigo-900/20 transition-colors text-left"
                  >
                    {area}
                  </button>
                ))}
              </div>

              {!geolocationBlocked && (
                <button
                  onClick={centerOnUserLocation}
                  className="mt-2 w-full py-2 flex items-center justify-center gap-2 bg-trigo-50 dark:bg-trigo-900/20 text-trigo-600 dark:text-trigo-400 rounded-lg border border-trigo-200 dark:border-trigo-800 hover:bg-trigo-100 dark:hover:bg-trigo-900/30 transition-colors hover:shadow-glow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Show My Location
                </button>
              )}

              {selectedTODA && (
                <div className="text-xs text-trigo-600 dark:text-trigo-400 mt-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-trigo-500"></div>
                  <p>
                    Using {selectedTODA.name} ({selectedTODA.area})
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {isLocating && (
          <div className="p-4 flex items-center justify-center w-full">
            <TriGOLoading size={30} showText={true} />
          </div>
        )}

        {userLocation && (
          <div className="px-4 pt-4">
            <LocationMap
              userLocation={userLocation}
              selectedTODA={selectedTODA}
              isLoading={false}
              apiKey={googleMapsApiKey}
              onLocateMe={!geolocationBlocked ? handleLocateMe : undefined}
            />

            {selectedTODA && (
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-trigo-600 dark:text-trigo-400">
                  <MapPin className="w-4 h-4" />
                  <p>Nearest TODA: {selectedTODA.name}</p>
                </div>
                <button
                  onClick={toggleManualSelection}
                  className="text-xs text-trigo-500 hover:text-trigo-700 dark:hover:text-trigo-300 underline"
                >
                  Change location
                </button>
              </div>
            )}
          </div>
        )}

        {showForm ? (
          <FormRide
            onSubmit={handleFormSubmit}
            settings={settings}
            onSettingsChange={setSettings}
            nearbyTODAs={nearbyTODAs}
            userLocation={userLocation}
            selectedTODA={selectedTODA}
            onSavedLocationSelect={handleSavedLocationSelect}
            onLocateMe={!geolocationBlocked ? handleLocateMe : undefined}
          />
        ) : (
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <TriGOLoading size={40} showText={true} />
              </div>
            ) : (
              <Preview
                isLoading={isLoading}
                imageUrl="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/profile-mjss82WnWBRO86MHHGxvJ2TVZuyrDv.jpeg"
                selectedTODA={selectedTODA}
                destination={destination}
                fare={calculatedFare}
                distance={calculatedDistance}
                duration={calculatedDuration}
              />
            )}

            {!isLoading && (
              <div className="space-y-4">
                <div className="p-3 space-y-2 bg-trigo-50 dark:bg-trigo-800/50 rounded-xl">
                  <div className="flex justify-between text-sm">
                    <span className="text-trigo-500">Estimated Time</span>
                    <span className="text-trigo-900 dark:text-trigo-100">{calculatedDuration} mins</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-trigo-500">Fare</span>
                    <span className="text-trigo-900 dark:text-trigo-100">₱{calculatedFare}.00</span>
                  </div>
                  {selectedTODA && (
                    <div className="flex justify-between text-sm">
                      <span className="text-trigo-500">TODA</span>
                      <span className="text-trigo-900 dark:text-trigo-100">{selectedTODA.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleBackToSettings}
                    className="w-full h-9 flex items-center justify-center gap-2 border border-trigo-200 dark:border-trigo-700 text-trigo-900 dark:text-trigo-100 text-sm font-medium rounded-xl hover:bg-trigo-50 dark:hover:bg-trigo-800 transition-colors hover:shadow-glow-sm"
                  >
                    Change Options
                  </button>
                  <button
                    type="button"
                    className="w-full h-9 flex items-center justify-center gap-2 bg-trigo-600 hover:bg-trigo-700 dark:bg-trigo-600 dark:hover:bg-trigo-700 text-white text-sm font-medium rounded-xl transition-colors btn-glow"
                  >
                    Confirm Ride
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

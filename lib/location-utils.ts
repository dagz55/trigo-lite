export interface TODA {
  id: string
  name: string
  area: string
  coordinates: {
    lat: number
    lng: number
  }
  fareBase: number
  farePerKm: number
}

// Sample TODA data
export const todaData: TODA[] = [
  {
    id: "toda-lp-18",
    name: "Talon Kuatro TODA",
    area: "Las Piñas",
    coordinates: {
      lat: 14.4349167, // 14°26'05.7"N
      lng: 121.0029722, // 121°00'10.7"E
    },
    fareBase: 75,
    farePerKm: 15,
  },
  {
    id: "toda-lp-2",
    name: "Talon Singko TODA",
    area: "Las Piñas",
    coordinates: {
      lat: 14.4329,
      lng: 121.0045,
    },
    fareBase: 70,
    farePerKm: 15,
  },
  {
    id: "toda-lp-3",
    name: "BF Resort TODA",
    area: "Las Piñas",
    coordinates: {
      lat: 14.4372,
      lng: 121.0112,
    },
    fareBase: 80,
    farePerKm: 18,
  },
  {
    id: "toda-par-1",
    name: "Sucat TODA",
    area: "Parañaque",
    coordinates: {
      lat: 14.4762,
      lng: 121.0488,
    },
    fareBase: 75,
    farePerKm: 16,
  },
  {
    id: "toda-par-2",
    name: "BF Homes TODA",
    area: "Parañaque",
    coordinates: {
      lat: 14.4731,
      lng: 121.0269,
    },
    fareBase: 85,
    farePerKm: 18,
  },
  {
    id: "toda-mun-1",
    name: "Alabang TODA",
    area: "Muntinlupa",
    coordinates: {
      lat: 14.4236,
      lng: 121.0476,
    },
    fareBase: 80,
    farePerKm: 17,
  },
]

// Get all unique areas
export function getAllAreas(): string[] {
  const areas = new Set<string>()
  todaData.forEach((toda) => areas.add(toda.area))
  return Array.from(areas).sort()
}

// Find nearest TODA based on coordinates
export function findNearestTODA(lat: number, lng: number): TODA {
  let nearestTODA = todaData[0]
  let minDistance = Number.MAX_VALUE

  todaData.forEach((toda) => {
    const distance = calculateDistance(lat, lng, toda.coordinates.lat, toda.coordinates.lng)

    if (distance < minDistance) {
      minDistance = distance
      nearestTODA = toda
    }
  })

  return nearestTODA
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Check if geolocation is available in this environment
export function isGeolocationAvailable(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator
}

// Check if geolocation is likely to be blocked by permissions policy
export function isGeolocationBlockedByPolicy(): boolean {
  if (typeof window === "undefined") return false

  // Check if we're in an iframe
  const isInIframe = window !== window.top

  // Check if we have a stored flag indicating policy restriction
  const policyBlocked = localStorage.getItem("geolocationPolicyBlocked") === "true"

  return isInIframe || policyBlocked
}

// Get current position using Geolocation API with improved error handling
export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    // Check if geolocation is supported
    if (!isGeolocationAvailable()) {
      const error = new Error("Geolocation is not supported by your browser")
      if (typeof window !== "undefined") {
        localStorage.setItem("locationAccessDenied", "true")
      }
      reject(error)
      return
    }

    // If we know geolocation is blocked by policy, fail fast
    if (isGeolocationBlockedByPolicy()) {
      const error = new Error(
        "Geolocation has been disabled by permissions policy. Please use manual location selection.",
      )
      reject(error)
      return
    }

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Clear any stored flags on success
          if (typeof window !== "undefined") {
            localStorage.removeItem("locationAccessDenied")
            localStorage.removeItem("geolocationPolicyBlocked")
          }
          resolve(position)
        },
        (error) => {
          // Handle specific geolocation errors
          let errorMessage: string

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access was denied by the user."
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case error.TIMEOUT:
              errorMessage = "The request to get user location timed out."
              break
            default:
              errorMessage = "An unknown error occurred while trying to get location."
          }

          // Check for permissions policy error in the message
          if (error.message && error.message.toLowerCase().includes("permissions policy")) {
            errorMessage = "Geolocation has been disabled by permissions policy. Please use manual location selection."
            // Store that this is a policy restriction
            if (typeof window !== "undefined") {
              localStorage.setItem("geolocationPolicyBlocked", "true")
            }
          }

          // Store that location access was denied
          if (typeof window !== "undefined") {
            localStorage.setItem("locationAccessDenied", "true")
          }

          const customError = new Error(errorMessage)
          reject(customError)
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      )
    } catch (e) {
      // Catch any unexpected errors
      const error = e instanceof Error ? e : new Error("Failed to get location due to an unexpected error")
      if (typeof window !== "undefined") {
        localStorage.setItem("locationAccessDenied", "true")
      }
      reject(error)
    }
  })
}

// Check if location permission was previously denied
export function isLocationPermissionDenied(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem("locationAccessDenied") === "true"
}

// Get a default location when geolocation is not available
export function getDefaultLocation() {
  // Las Piñas Talon Kuatro coordinates (14°26'05.7"N, 121°00'10.7"E)
  return {
    lat: 14.4349167,
    lng: 121.0029722,
  }
}

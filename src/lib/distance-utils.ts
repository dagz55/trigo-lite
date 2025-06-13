export async function calculateDistance(
  origin: string,
  destination: string,
  apiKey: string,
): Promise<{ distance: number; duration: number }> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
        origin,
      )}&destinations=${encodeURIComponent(destination)}&mode=driving&key=${apiKey}`,
      { next: { revalidate: 60 } }, // Cache for 60 seconds
    )

    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Distance Matrix API error: ${data.status}`)
    }

    const distanceInMeters = data.rows[0].elements[0].distance.value
    const durationInSeconds = data.rows[0].elements[0].duration.value

    return {
      distance: distanceInMeters / 1000, // Convert to kilometers
      duration: durationInSeconds / 60, // Convert to minutes
    }
  } catch (error) {
    console.error("Error calculating distance:", error)
    throw error
  }
}

// Function to calculate fare based on distance
export function calculateFare(distanceInKm: number): number {
  // Base price: PHP 25.00 for the first 2 kilometers
  // Additional: PHP 10.00 per kilometer after the first 2 kilometers
  const baseFare = 25
  const baseDistance = 2 // kilometers
  const additionalRatePerKm = 10

  if (distanceInKm <= baseDistance) {
    return baseFare
  }

  const additionalDistance = distanceInKm - baseDistance
  const additionalFare = additionalDistance * additionalRatePerKm

  return baseFare + additionalFare
}


import type { Coordinates, TodaZone } from '@/types';

/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @param coord1 First coordinate { latitude, longitude }
 * @param coord2 Second coordinate { latitude, longitude }
 * @returns Distance in kilometers.
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Radius of the Earth in kilometers
  const lat1 = coord1.latitude;
  const lon1 = coord1.longitude;
  const lat2 = coord2.latitude;
  const lon2 = coord2.longitude;

  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if a point is inside a circle defined by a center and radius.
 * @param point The point to check { latitude, longitude }
 * @param zoneCenter The center of the circle { latitude, longitude }
 * @param radiusKm The radius of the circle in kilometers.
 * @returns True if the point is inside the circle, false otherwise.
 */
export function isPointInCircle(point: Coordinates, zoneCenter: Coordinates, radiusKm: number): boolean {
  return calculateDistance(point, zoneCenter) <= radiusKm;
}

/**
 * Creates a GeoJSON Feature for a circle polygon.
 * @param center Center of the circle [longitude, latitude]
 * @param radiusInKm Radius of the circle in kilometers.
 * @param points Number of points to approximate the circle (default 64).
 * @returns GeoJSON Feature object representing the circle.
 */
export function createGeoJSONCircle(center: [number, number], radiusInKm: number, points: number = 64): GeoJSON.Feature<GeoJSON.Polygon> {
    const coords = {
        latitude: center[1],
        longitude: center[0]
    };
    const km = radiusInKm;
    const ret: number[][] = [];
    
    // Earth's radius in km
    const earthRadiusKm = 6371;

    for (let i = 0; i < points; i++) {
        const angle = (i / points) * (2 * Math.PI);
        
        const lat1Rad = coords.latitude * Math.PI / 180;
        const lon1Rad = coords.longitude * Math.PI / 180;

        const ad = km / earthRadiusKm; // Angular distance

        const lat2Rad = Math.asin(Math.sin(lat1Rad) * Math.cos(ad) + Math.cos(lat1Rad) * Math.sin(ad) * Math.cos(angle));
        const lon2Rad = lon1Rad + Math.atan2(Math.sin(angle) * Math.sin(ad) * Math.cos(lat1Rad), Math.cos(ad) - Math.sin(lat1Rad) * Math.sin(lat2Rad));
        
        ret.push([lon2Rad * 180 / Math.PI, lat2Rad * 180 / Math.PI]);
    }
    ret.push(ret[0]); // Close the polygon

    return {
        type: "Feature",
        geometry: {
            type: "Polygon",
            coordinates: [ret]
        },
        properties: {}
    };
}

/**
 * Generates a random point within a circle.
 * @param center The center of the circle { latitude, longitude }
 * @param radiusKm The radius of the circle in kilometers.
 * @returns A random coordinate { latitude, longitude } within the circle.
 */
export function getRandomPointInCircle(center: Coordinates, radiusKm: number): Coordinates {
  // Convert radius from km to degrees (approximate)
  const radiusInDegrees = radiusKm / 111.32; // Approximate km per degree latitude

  const r = radiusInDegrees * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;

  const latitude = center.latitude + r * Math.sin(theta);
  const longitude = center.longitude + r * Math.cos(theta) / Math.cos(center.latitude * Math.PI / 180); // Adjust for longitude convergence

  return { latitude, longitude };
}


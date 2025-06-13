// This file is intentionally left empty to avoid any DOM manipulation
// that might cause the "removeChild" error.
// We're using a static map placeholder instead of Google Maps.

export function loadGoogleMapsApi(apiKey: string): Promise<void> {
  // Return a resolved promise immediately
  return Promise.resolve()
}

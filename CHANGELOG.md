
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Settings Page (`/settings`):**
  - Fully functional settings page to configure application theme (light, dark, system), default map zoom and center, heatmap visibility, and data simulation intervals (new ride requests, trider location updates, AI insights).
  - Settings are persisted in `localStorage` and applied globally.
- **Role Switcher (`/sign-in`):**
  - New `RoleSwitcher` component on the sign-in page to allow testers to launch Passenger or Trider demo roles in new windows.
- **Passenger Demo Page (`/passenger`):**
  - Page for simulating the passenger experience.
  - Passengers can select pickup and dropoff locations on a map.
  - Simulates ride requests, trider assignment, and fare estimation.
  - Displays assigned trider's "live" location and ETA on the map, with the trider following the route.
  - Uses distinct colors for trider-to-pickup and pickup-to-dropoff route segments.
- **Trider Demo Page (`/trider`):**
  - Page for simulating the trider experience.
  - Triders can go online/offline.
  - Receives mock ride requests (within their assigned TODA zone).
  - Can accept rides and simulate picking up passengers and completing trips.
  - Displays active ride details and route on the map.
  - Includes a basic wallet overview.
- Helper utilities for geolocation (`geoUtils.ts`).
- Defined TODA zones for Las Piñas City, Philippines.
- `reactStrictMode` explicitly enabled in `next.config.ts`.
- `placehold.co` added to image remote patterns in `next.config.ts`.
- Initial project setup with Next.js, TypeScript, Tailwind CSS, ShadCN UI.
- Dispatch Dashboard (`/`):
    - Mapbox integration for displaying triders, ride requests, and TODA zones.
    - Mock data for triders, ride requests, and AI insights.
    - Basic selection for triders and ride requests.
    - Route preview functionality using Mapbox Directions API.
    - Dispatch simulation with zone validation.
    - Heatmap layer for ride request density (mocked).
- Trider Management Dashboard (`/triders`):
    - List of triders with filtering by name, zone, status.
    - Detailed trider panel with map preview, status controls, and wallet info (mocked).
    - Chat functionality UI (mocked).
    - Simulated payout and status change actions.
- Custom TriGo logo and alert icon in the sidebar.
- Initial README.md and CHANGELOG.md.

### Changed
- Updated Mapbox map default location to Las Piñas City, Philippines.
- Enhanced Trider Management Dashboard:
    - Updated trider names to Jesus' apostles (12 triders with mock profiles).
- Updated `README.md` and `CHANGELOG.md` to reflect recent updates and Clerk removal.
- Updated map view on main dispatch and demo pages to a default 3D perspective (pitch 45 degrees).
- Used Philippine Peso (₱) symbol for currency display.
- Refined map marker colors and styles for better visibility.
- Toasts for ride status changes in demo pages are now managed more safely within `useEffect` hooks.

### Fixed
- Resolved "Cannot update a component while rendering a different component" errors related to toast notifications on Passenger and Trider demo pages.
- Resolved Mapbox GL JS errors related to paint property color types by using resolved HSL strings from CSS variables for map layers (route, TODA zones, labels, heatmap).
- Corrected middleware export function issue.
- Addressed potential "Failed to load chunk" errors in Next.js.
- Addressed Clerk authentication configuration issues related to custom domains and proxy URLs in README (prior to removal).

### Removed
- Clerk authentication:
    - Removed `@clerk/nextjs` dependency.
    - Updated sign-in and sign-up pages to be placeholders with a Role Switcher.
    - Removed Clerk UI components from layouts.
    - Removed Clerk middleware, replaced with minimal pass-through middleware.
    - Removed `ClerkProvider` from root layout.
    - Routes previously protected by Clerk are now publicly accessible.

## [0.1.0] - YYYY-MM-DD (Replace with actual date of first significant version)
- Initial release.

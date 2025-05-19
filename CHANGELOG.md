
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Route Restructuring:**
    - Dispatcher related pages (Dashboard, Triders, Settings) moved under `/dispatcher` route.
    - `/passenger` and `/trider` routes remain top-level for role simulation.
- **Passenger Role Simulation (`/passenger`):**
    - UI for selecting pickup and dropoff on map.
    - Mock ride request flow: searching, trider assignment, trider en route, ride completion.
    - Map display of assigned trider's live location (simulated) and ETA.
    - Trider follows Mapbox-calculated route to pickup and dropoff segments.
    - Distinct route colors for trider-to-pickup and pickup-to-dropoff segments.
    - Geolocation for initial pickup suggestion.
    - Address input fields with Mapbox Geocoding API for autocomplete/suggestions.
    - Red Hat inspired theme (white background, black header, red accents).
    - Glassmorphism countdown timer for ETA, with visual cues for final 10 seconds.
    - Ride Ticket ID display.
    - Per-passenger map style settings (streets, satellite, dark) saved to localStorage.
    - "Locate Me" button inside pickup input field to trigger geolocation.
    - Ride receipt dialog displayed upon ride completion.
- **Trider Role Simulation (`/trider`):**
    - UI for trider to go online/offline.
    - Geolocation on going online to set initial position.
    - View and accept mock ride requests within their TODA zone.
    - Map display of current location, active ride details, and route.
    - Simulation of trider movement along Mapbox-calculated routes.
    - TODA Zone Change Request feature.
- **Functional Application Settings Page (`/dispatcher/settings`):**
    - UI for theme selection (light, dark, system).
    - Configuration for default map zoom and center.
    - Toggle for heatmap layer visibility on dispatch map.
    - Inputs to adjust mock data simulation intervals (new rides, trider updates, AI insights).
    - Settings are saved to and loaded from `localStorage`.
    - Reset to default settings functionality.
    - Configuration for global convenience fee (PIN-protected for demo) and per-TODA base fares.
- **TODA Zones Management Page (`/dispatcher/toda-management`):**
    - New page for managing fare matrix.
    - Inputs for global default base fare, per KM charge, and convenience fee.
    - Modal-based editing for overriding base fares for each specific TODA zone.
    - Search functionality for TODA zones when configuring fares.
    - Placeholder sections for future TODA, Trider-in-TODA, and Passenger CRUD.
- **Settings Context (`SettingsContext.tsx`):**
    - Manages application settings state.
    - Applies theme changes dynamically.
    - Manages fare settings (convenience fee, per-TODA base fares, global default base fare, per KM charge).
- **Role Switcher Component (`RoleSwitcher.tsx`):**
    - Card UI on `/sign-in` page to launch Passenger or Trider roles in new windows.
    - Includes icons and responsive design.
    - Dropdowns to select a specific TODA zone and then a specific passenger profile from that zone to launch a tailored demo.
- **Type Definitions:** Added `PassengerRideState`, `TriderSimState`, `RoutePath`, `AppSettings`, `MockPassengerProfile`, `PassengerSettings` to `types/index.ts`.
- Updated Mapbox map to default to a 3D perspective (pitch).
- Updated `next.config.js` to include `placehold.co` in image remote patterns.
- Added P1TODA (Pamplona Uno) zone and 3 triders for it.
- Added 5 TEPTODA triders.
- Refined trider data to focus more on Talon Kuatro, TEPTODA, and P1TODA.

### Changed
- Dispatch Dashboard main page is now `/dispatcher`.
- Trider Management Dashboard is now `/dispatcher/triders`.
- Application Settings page is now `/dispatcher/settings`.
- Links in Dispatcher layout and sign-in/up pages updated to reflect new routes.
- `MapboxMap.tsx` component enhanced to use resolved HSL color strings for layers to fix rendering issues.
- Refined trider movement simulation to follow Mapbox route paths more accurately on both Passenger and Trider demo pages.
- Updated `triders/page.tsx` (Dispatcher view) and `page.tsx` (Dispatcher dashboard) to initialize `currentPath` and `pathIndex` for Trider objects.
- Toast notifications in Passenger and Trider demo pages are now triggered more safely within `useEffect` hooks dependent on state changes.
- Mapbox route fetching logic updated to request alternatives and select the route with the shortest distance.
- Updated passenger page theme to Red Hat inspired (white background, black header, red accents).
- Improved countdown timer accuracy and display on Passenger page.
- `README.md` and `CHANGELOG.md` updated to reflect recent major changes.

### Fixed
- Resolved Mapbox GL JS errors related to paint property color types by using resolved HSL strings for route and label layers.
- Addressed React "cannot update a component while rendering another component" error by refactoring `toast` calls in Passenger and Trider demo pages.
- Corrected `TriderList.tsx` `status` check to include all relevant statuses.
- Minimal middleware function added to `middleware.ts` to resolve Next.js export error after Clerk removal.
- Explicitly set `reactStrictMode: true` in `next.config.ts`.
- Fixed `React.Children.only` error in `SidebarMenuButton` by wrapping `Link` children.
- Resolved `ReferenceError: rs is not defined` in Passenger page countdown logic.
- Fixed `TypeError: Cannot read properties of undefined (reading 'id')` in Trider page ride request generation.
- Addressed accessibility warning by adding `SheetTitle` to mobile sidebar in `Sidebar` component and dispatcher layout.
- Corrected import error for `DEFAULT_TODA_BASE_FARE_FALLBACK` in settings page.

### Removed
- **Clerk Authentication:**
    - Removed `@clerk/nextjs` dependency.
    - Deleted Clerk sign-in and sign-up pages (replaced with placeholders).
    - Removed Clerk UI components from layouts.
    - Removed Clerk middleware.
    - Removed `ClerkProvider` from root layout.
    - Routes previously protected by Clerk are now publicly accessible.
- Removed `(dispatch)` route group; its contents are now under `/dispatcher`.

## [0.1.0] - YYYY-MM-DD (Replace with actual date of first significant version)
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
- Helper utilities for geolocation (`geoUtils.ts`).
- Defined TODA zones for Las Piñas City, Philippines.
- Ensured triders respect TODA zone boundaries for pickups.
- Initial README.md and CHANGELOG.md.
- Updated Mapbox map default location to Las Piñas City, Philippines.
- Used Philippine Peso (₱) symbol for currency display.
- Refined map marker colors and styles for better visibility.
- Corrected Mapbox GL JS color parsing issues for dynamic theme colors.
- Updated trider names to Jesus' apostles (12 triders with mock profiles).
- Updated README.md and CHANGELOG.md to reflect Clerk removal and configuration updates.
- Resolved Mapbox GL JS errors related to paint property color types by using resolved HSL strings.
- Addressed Clerk authentication configuration issues related to custom domains and proxy URLs in README (prior to removal).
- Ensured map layers (route, TODA zones, labels, heatmap) use correctly resolved color values from CSS variables.
- Placeholder middleware (prior to Clerk removal).



# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
- Clerk authentication for user sign-in, sign-up.
- Protected routes for dispatch and trider management dashboards using Clerk middleware.
- Custom TriGo logo and alert icon in the sidebar.
- Helper utilities for geolocation (`geoUtils.ts`).
- Defined TODA zones for Las Piñas City, Philippines.
- Ensured triders respect TODA zone boundaries for pickups.
- Initial README.md and CHANGELOG.md.

### Changed
- Updated Mapbox map default location to Las Piñas City, Philippines.
- Used Philippine Peso (₱) symbol for currency display.
- Refined map marker colors and styles for better visibility.
- Corrected Mapbox GL JS color parsing issues for dynamic theme colors.
- Updated trider names to Jesus' apostles (12 triders with mock profiles).

### Fixed
- Resolved Mapbox GL JS errors related to paint property color types by using resolved HSL strings.
- Addressed Clerk authentication configuration issues related to custom domains and proxy URLs in README.
- Ensured map layers (route, TODA zones, labels, heatmap) use correctly resolved color values from CSS variables.

### Removed
- Placeholder middleware.

## [0.1.0] - YYYY-MM-DD (Replace with actual date of first significant version)
- Initial release.

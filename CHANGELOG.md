# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
<<<<<<< HEAD
- **🍎 Apple-like Payment Method Selector with Autosave Functionality:**
    - **Apple-inspired Design:** Beautiful dropdown with rounded corners (rounded-2xl), smooth transitions, and backdrop blur effects.
    - **Intelligent Autosave System:** Automatic saving of payment method selections within 500ms using debounced save logic.
    - **Real-time Status Indicator:** Visual feedback showing save progress (idle/saving/saved/error) with timestamps.
    - **Individual User Preferences:** Each user's payment method selection persists across browser sessions using localStorage.
    - **Manual Save Option:** "Save Now" button for immediate confirmation when needed.
    - **Enhanced User Experience:** Smooth animations, hover effects, and accessibility features including keyboard navigation.
    - **Error Handling:** Comprehensive error handling with fallback options and detailed error reporting.
    - **Performance Optimized:** Debounced saving prevents excessive localStorage operations while maintaining responsiveness.
    - **Comprehensive Testing:** Created automated test suites for dropdown functionality, autosave verification, and Apple design elements validation.
    - **Production Ready:** Cross-browser compatibility, accessibility compliance, and comprehensive documentation included.
- **Payment Method Selection on Landing Page:** Added a section to select a preferred payment method directly on the landing page, including autosave functionality.
- **Passenger Landing Page Button Functionality:**
    - Made all buttons on the passenger landing page fully functional with appropriate actions and feedback.
    - **Header Buttons:** Menu, Search, Map Style Toggle, and Login/Logout buttons now provide interactive functionality.
    - **Menu Button:** Shows informational toast about upcoming menu features.
    - **Search Button:** Switches between landing view and ride booking mode with contextual feedback.
    - **Map Style Toggle:** Cycles through map styles (Streets → Satellite → Dark) with real-time preview and toast notifications.
    - **Login/Logout Button:** Simulates authentication flow - opens sign-in page for login or clears profile data for logout.
    - **Enhanced Action Buttons:** "Ride Before" and "Ride Later" buttons now show detailed feature descriptions instead of generic "coming soon" messages.
- **Passenger Navigation System:**
    - **Bottom Navigation Bar:** Functional navigation with Home, Map View, and Profile links.
    - **Map Page (`/passenger/map`):** New dedicated map view page with enhanced features, navigation controls, and map feature descriptions.
    - **Profile Page (`/passenger/profile`):** Comprehensive user profile management page with personal information editing and quick actions.
- **Payment Methods Integration:**
    - **Complete Payment Methods Management:** Full-featured payment system in the passenger profile page.
    - **Supported Payment Methods:**
        - **GCash:** Uses actual GCash logo from `/GCash.png` with e-wallet functionality.
        - **PayMaya:** Uses actual Maya logo from `/maya-logo.png` with e-wallet functionality.
        - **TriCoin:** Custom gold gradient circular icon with "₮" symbol for cryptocurrency payments.
    - **Payment Features:**
        - Set default payment method with visual feedback and state management.
        - Balance display for each payment method (₱1,250.50 for GCash, ₱850.25 for PayMaya, ₱45.75 for TriCoin).
        - Modal-based payment method selection and management interface.
        - Visual distinction for default payment method (purple border and background).
        - "Add Payment Method" functionality with placeholder for future expansion.
        - Toast notifications for payment method updates and user feedback.
||||||| parent of 1c0fdf2 (latest-jun182025)
=======
- **Passenger-Trider Chat Feature (2024-01-19):**
    - **Real-time Chat Session:**
        - Created `RideChatSheet` component for in-ride communication
        - Two-way messaging between passenger and trider during active rides
        - Auto-scrolling chat interface with timestamp display
        - Different message bubble styles for passenger vs trider messages
        - Automatic greeting message when trider is assigned
    - **Premium Voice Call Feature:**
        - Voice call button integrated into chat interface
        - Call functionality restricted to Premium account holders
        - Non-premium users see upgrade prompt with gem icon
        - Toast notifications for call initiation and connection status
        - Premium badge display for premium users in chat
    - **Intelligent Auto-Responses:**
        - Simulated trider responses based on message context
        - Contextual replies for location queries, ETA questions, traffic concerns
        - Natural conversation flow with 2-4 second response delay
        - Support for greetings and thanks in multiple languages
    - **Chat Integration:**
        - Chat button added to trider card during active rides
        - Chat state management with message history
        - Chat history automatically cleared between rides
        - Seamless integration with existing ride flow
    - **UI/UX Enhancements:**
        - Clean, modern chat interface matching app design
        - Responsive layout for mobile and desktop
        - Smooth animations and transitions
        - Non-intrusive design with sheet component
- **Advanced UI Components (2024-01-18):**
    - **Collapsible/Minimizable Interface:**
        - Created `CollapsibleCard` component for flexible UI panels
        - All cards can be collapsed to show just headers or minimized to single line
        - Smooth transition animations for all state changes
        - Support for custom titles and badges
    - **Persistent UI State Management:**
        - UI preferences saved to localStorage
        - Collapse/minimize states persist across page reloads
        - Each card has unique ID for state management
    - **Trider Dashboard Enhancements:**
        - Collapsible ride request panel with status badge
        - Minimizable profile card with wallet information
        - Floating quick stats panel with balance, rides, and earnings
        - Floating map controls with center button
        - Mobile-ready with Sheet component integration
    - **UI/UX Improvements:**
        - Non-intrusive floating panels
        - Backdrop blur effects for better readability
        - Responsive design optimizations
        - Clean, professional interface with reduced clutter
>>>>>>> 1c0fdf2 (latest-jun182025)
- **Route Restructuring:**
    - Dispatcher related pages (Dashboard, Triders, Settings) moved under `/dispatcher` route.
    - `/passenger` and `/trider` routes remain top-level for role simulation.
- **Passenger Role Simulation (`/passenger`):**
    - **New Landing Page:** Initial view for passengers featuring "Ride Before", "Ride Now", "Ride Later" options, with a background image and themed elements.
    - **"Pick Me Up Now" Feature:** Core passenger ride request flow implemented. Passengers can request a ride via a button. The system alerts the nearest available triders sequentially at 10-second intervals until accepted.
    - Mock ride request flow: searching, trider assignment, trider en route, ride completion.
    - Map display of assigned trider's live location (simulated) and ETA, with trider accurately following Mapbox-calculated route.
    - Distinct route colors for trider-to-pickup and pickup-to-dropoff segments.
    - **Geolocation Services Integration:**
    - **Browser Geolocation API:** Uses `navigator.geolocation.getCurrentPosition()` with high accuracy enabled and 10-second timeout.
    - **Coordinate System:** Implements WGS84 coordinate system (latitude/longitude) with 4-decimal precision for location accuracy.
    - **Default Location:** Las Piñas City, Philippines center coordinates (14.4445°N, 120.9938°E) as fallback location.
    - **Reverse Geocoding:** Mapbox Geocoding API integration for converting coordinates to human-readable addresses.
    - **"Locate Me" Functionality:** Interactive button inside pickup input field for automatic location detection with error handling.
    - Address input fields with Mapbox Geocoding API for autocomplete/suggestions.
    - Orange-themed header (was Red Hat inspired, then purple, now orange accents).
    - Glassmorphism countdown timer card with neon green text for ETA, with visual cues for final 10 seconds.
    - Ride Ticket ID display.
    - Ride receipt dialog displayed upon ride completion (data logged to console, not DB).
    - Per-passenger map style settings (streets, satellite, dark) saved to localStorage.
- **Development Server & Network Configuration:**
    - **Local Development:** Next.js development server configured to run on `localhost:9002` with Turbopack enabled for faster builds.
    - **Network Utilities:** Integrated `whatismyip.py` script for network diagnostics including LAN IP detection using `socket.gethostbyname()` method.
    - **IP Geolocation Services:** External IP geolocation via ipinfo.io API for location-based network information.
    - **Cross-platform Networking:** Socket-based hostname resolution and network interface detection compatible across operating systems.
- **Trider Role Simulation (`/trider`):**
    - UI for trider to go online/offline. **Enhanced Geolocation:** Uses browser's native geolocation API with high accuracy positioning and automatic fallback to TODA zone center coordinates.
    - View and accept mock ride requests within their TODA zone.
    - Map display of current location, active ride details, and route.
    - Simulation of trider movement along Mapbox-calculated routes.
    - TODA Zone Change Request feature.
    - **New Sections & Bottom Navigation:** Added Wallet, Settings, and Premium Subscription views with a bottom navigation bar. Functionality is mocked.
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
    - Modal includes fields for setting TODA Terminal Exit Point (coordinates and address).
    - Search functionality for TODA zones when configuring fares.
    - Placeholder sections for future TODA, Trider-in-TODA, and Passenger CRUD.
- **Settings Context (`SettingsContext.tsx`):**
    - Manages application settings state.
    - Applies theme changes dynamically.
    - Manages fare settings (convenience fee, per-TODA base fares, global default base fare, per KM charge, TODA terminal exit points).
- **Role Switcher Component (`RoleSwitcher.tsx`):**
    - Card UI on `/sign-in` page to launch Passenger or Trider roles in new windows.
    - Includes icons and responsive design.
    - Dropdowns to select a specific TODA zone and then a specific passenger profile from that zone to launch a tailored demo.
- **Type Definitions:** Added/Updated `PassengerRideState`, `TriderSimState`, `RoutePath`, `AppSettings`, `MockPassengerProfile`, `PassengerSettings`, `TodaZone` (with terminal points), `TriderWalletTransaction`, `TriderAppSettings` in `types/index.ts`.
- Updated Mapbox map to default to a 3D perspective (pitch).
- Updated `next.config.js` to include `placehold.co` in image remote patterns.
- Added P1TODA (Pamplona Uno) zone and 3 triders for it.
- Added 5 TEPTODA triders.
- Refined trider data to focus more on Talon Kuatro, TEPTODA, and P1TODA, including unique body numbers.
- Homepage (`/`) now uses a dynamic, glassmorphic design with a central triangular TriGo logo (auto-rickshaw SVG) that flips and has an electric aura on hover. Links to passenger, trider, dispatcher, and admin roles.

### Changed
<<<<<<< HEAD
- **Enhanced User Experience:** All passenger landing page buttons now provide meaningful interactions instead of placeholder functionality.
- **Improved Navigation:** Bottom navigation bar now links to actual functional pages instead of placeholder routes.
- **Payment System Integration:** Profile page now includes a complete payment management system with real payment method options.
||||||| parent of 1c0fdf2 (latest-jun182025)
=======
- **Documentation Updates (2024-01-18):**
    - Completely revamped README.md with professional formatting
    - Added emoji indicators for better visual navigation
    - Restructured content with clear sections and subsections
    - Added comprehensive feature descriptions
    - Updated tech stack with latest versions
    - Improved installation and setup instructions
    - Added configuration guides for all integrations
    - Created proper script documentation table
    - Added contributing guidelines
    - Professional acknowledgments section
>>>>>>> 1c0fdf2 (latest-jun182025)
- Dispatch Dashboard main page is now `/dispatcher`.
- Trider Management Dashboard is now `/dispatcher/triders`.
- Application Settings page is now `/dispatcher/settings`.
- Links in Dispatcher layout and sign-in/up pages updated to reflect new routes.
- `MapboxMap.tsx` component enhanced to use resolved HSL color strings for layers.
- Refined trider movement simulation to follow Mapbox route paths more accurately on both Passenger and Trider demo pages.
- Updated `triders/page.tsx` (Dispatcher view) and `page.tsx` (Dispatcher dashboard) to initialize `currentPath` and `pathIndex` for Trider objects.
- Toast notifications in Passenger and Trider demo pages are now triggered more safely within `useEffect` hooks dependent on state changes to prevent rapid firing and rendering errors.
- Mapbox route fetching logic updated to request alternatives and select the route with the shortest distance.
- Updated passenger page theme to use orange accents with a white background and black header (was purple, and before that Red Hat inspired).
- Improved countdown timer accuracy and display on Passenger page; ETA is recomputed periodically.
- `README.md` and `CHANGELOG.md` updated.
- Trider list in Dispatcher Dashboard is now dynamically filtered based on the selected ride request's TODA zone.
- Dispatch Control view now places Trider and Ride Request lists side-by-side on larger screens.
- Dispatcher sidebar menu "Live Map" link changed to "TODA Zones" linking to `/dispatcher/toda-management` with a `Landmark` icon. Added "Channels", "Wallet", and "More Options" dropdown to sidebar.

### Fixed
- Resolved Mapbox GL JS errors related to paint property color types by using resolved HSL strings for route and label layers.
- Addressed React "cannot update a component while rendering another component" error by refactoring `toast` calls in Passenger and Trider demo pages.
- Corrected `TriderList.tsx` `status` check.
- Minimal middleware function added to `middleware.ts` to resolve Next.js export error after Clerk removal.
- Explicitly set `reactStrictMode: true` in `next.config.ts`.
- Fixed `React.Children.only` error in `SidebarMenuButton` by wrapping `Link` children.
- Resolved `ReferenceError: rs is not defined` and `ReferenceError: Cannot access 'calculateEstimatedFare' before initialization` in Passenger page countdown/fare logic.
- Fixed `ReferenceError: Label is not defined` in Passenger page.
- Addressed accessibility warning by adding `SheetTitle` to mobile sidebar in `Sidebar` component and dispatcher layout.
- Corrected import error for `DEFAULT_TODA_BASE_FARE_FALLBACK` in settings page.
- Corrected SVG attribute naming (kebab-case to camelCase) in `PickMeUpIcon.tsx` to resolve JSX parsing errors.
- Fixed `TypeError: Cannot read properties of undefined (reading 'id')` in Trider page ride request generation.
- Resolved `indicatorClassName` prop error on `Progress` component in Admin Dashboard.

### Removed
- **Clerk Authentication:**
    - Removed `@clerk/nextjs` dependency.
    - Deleted Clerk sign-in and sign-up pages (replaced with placeholders and Role Switcher).
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
- **Geolocation Utilities (`geoUtils.ts`):**
    - **Haversine Formula Implementation:** Calculates accurate distances between coordinates using Earth's radius (6371 km).
    - **Coordinate System:** WGS84 standard with latitude/longitude decimal degrees for global compatibility.
    - **Zone Boundary Detection:** Point-in-circle algorithms for TODA zone validation using radius-based calculations.
    - **GeoJSON Circle Generation:** Creates polygon approximations of circular zones with configurable point density (default 64 points).
    - **Random Point Generation:** Generates random coordinates within circular boundaries for simulation purposes.
- **Geographic Configuration:**
    - **Default Location:** Las Piñas City, Philippines center coordinates (14.4445°N, 120.9938°E).
    - **TODA Zone Definitions:** Circular zones with center coordinates and radius specifications for tricycle operations.
    - **Zone Boundary Enforcement:** Ensures triders respect TODA zone boundaries for pickup requests.
- Initial README.md and CHANGELOG.md.
- **Localization:** Philippine Peso (₱) symbol for currency display and local market adaptation.
- Refined map marker colors and styles for better visibility.
- Corrected Mapbox GL JS color parsing issues for dynamic theme colors.
- Updated trider names to Jesus' apostles (12 triders with mock profiles).
- Updated README.md and CHANGELOG.md to reflect Clerk removal and configuration updates.
- Resolved Mapbox GL JS errors related to paint property color types by using resolved HSL strings.
- Addressed Clerk authentication configuration issues related to custom domains and proxy URLs in README (prior to removal).
- Ensured map layers (route, TODA zones, labels, heatmap) use correctly resolved color values from CSS variables.
- Placeholder middleware (prior to Clerk removal).

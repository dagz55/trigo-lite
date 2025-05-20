
# TriGo Dispatch Lite - Firebase Studio

This is a Next.js application for TriGo Dispatch Lite, a real-time trider monitoring and dispatching system. Built with Next.js, TypeScript, Tailwind CSS, ShadCN UI components, and Mapbox GL JS.

## Features

- **Dispatch Dashboard (`/dispatcher`):**
  - Live map visualization of triders and ride requests using Mapbox.
  - TODA (Tricycle Operators and Drivers' Association) zone boundaries displayed on the map.
  - Real-time (mocked) updates for trider locations and incoming ride requests.
  - Selection of triders and ride requests for dispatch.
  - Route calculation (shortest distance among alternatives) and ETA preview using Mapbox Directions API.
  - Manual dispatch functionality (triders can only serve pickups within their assigned TODA zone).
  - Heatmap overlay for ride request density.
  - AI-driven insights and alerts (currently mocked).
- **Trider Management (`/dispatcher/triders`):**
  - Comprehensive list of all triders with details: name, TODA zone, vehicle type, status.
  - Filtering options: by name, TODA zone, status.
  - Sorting functionality by name, TODA zone, or status.
  - Detailed Trider panel:
    - Live GPS preview on a mini-map.
    - Status controls (force online/offline, ping trider, suspend/unsuspend).
    - Wallet information: balance, earnings, payout history, recent rides (mocked).
    - Simulated payout functionality.
    - TODA Zone change request approval/rejection.
  - Dispatcher-to-Trider chat functionality (mocked, UI in place).
- **Passenger Role Simulation (`/passenger`):**
  - Interface for passengers to request rides.
  - Map view to select pickup and dropoff locations.
  - Initial pickup suggestion via geolocation.
  - "Locate Me" button in pickup input for easy geolocation.
  - Address input with autocomplete/suggestions using Mapbox Geocoding API.
  - Simulation of trider assignment, movement to pickup (following Mapbox route), and trip to destination (following Mapbox route).
  - Displays trider's live location and ETA on the map, with distinct route colors.
  - Red Hat inspired theme (white background, black header, red accents).
  - Glassmorphism countdown timer for ETA with visual cues.
  - Ride Ticket ID display and ride receipt dialog upon completion.
  - Customizable map style (streets, satellite, dark) per passenger, saved in `localStorage`.
- **Trider Role Simulation (`/trider`):**
  - Dashboard for triders to manage their status (online/offline).
  - Geolocation on going online to set initial position.
  - View and accept incoming ride requests within their TODA zone.
  - Map view showing current location, active ride details (pickup/dropoff), and route.
  - Simulation of movement to pickup and then to dropoff, following Mapbox routes.
  - Ability to request a change to a different TODA zone.
- **Application Settings (`/dispatcher/settings`):**
  - Customizable theme (light, dark, system).
  - Configuration for default map zoom and center coordinates.
  - Toggle for heatmap visibility on the dispatch map.
  - Adjustable intervals for mock data simulation (new rides, trider updates, AI insights).
  - Configuration for global convenience fee (PIN-protected for demo) and per-TODA base fares (if not set on TODA Management page).
- **TODA Zones Management (`/dispatcher/toda-management`):**
  - Dedicated page to configure the fare matrix.
  - Set global default base fare and per KM charge.
  - Modal-based editing to override base fares for specific TODA zones.
  - Search functionality for TODA zones when configuring fares.
  - Placeholders for future TODA/Trider/Passenger CRUD operations.
- **Authentication:** (Currently Removed)
  - Authentication was previously handled by Clerk but has been removed for streamlined testing.
  - Sign-in (`/sign-in`) and Sign-up (`/sign-up`) pages are now placeholders, with a role switcher to access demo pages.
  - The sign-in page also allows selecting a specific TODA zone and passenger profile to launch a tailored demo.
  - Protected routes are currently accessible without login.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- A Mapbox Access Token

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/dagz55/trigo-lite.git
    cd trigo-lite
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add the following:

    ```env
    # Mapbox Configuration
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

    # Genkit/AI Configuration (if used)
    # Example for Google AI Studio API Key
    # GOOGLE_API_KEY=your_google_ai_studio_api_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002` by default (or the port you configured). Access the dispatcher dashboard at `/dispatcher`.

5.  **(Optional) Run Genkit development server (if using AI features):**
    In a separate terminal:
    ```bash
    npm run genkit:dev
    # or for watching changes
    npm run genkit:watch
    ```

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, ShadCN UI
- **Mapping:** Mapbox GL JS, react-map-gl
- **State Management:** React Context (for settings), React Hooks (for page-level state)
- **Linting/Formatting:** ESLint, Prettier (via Next.js defaults)
- **AI (Optional):** Genkit

## Project Structure (Key Directories)

```
.
├── src/
│   ├── app/                        # Next.js App Router (pages and layouts)
│   │   ├── dispatcher/             # Dispatcher-specific routes
│   │   │   ├── layout.tsx          # Layout for dispatcher section (sidebar, header)
│   │   │   ├── page.tsx            # Main dispatch dashboard page
│   │   │   ├── triders/            # Trider management section
│   │   │   │   └── page.tsx        # Trider management dashboard page
│   │   │   ├── settings/           # Application settings page
│   │   │   │   └── page.tsx        # Settings page UI
│   │   │   └── toda-management/    # TODA Zone and fare management page
│   │   │       └── page.tsx        # TODA management UI
│   │   ├── passenger/              # Passenger role simulation
│   │   │   └── page.tsx            # Passenger page UI and logic
│   │   ├── trider/                 # Trider role simulation
│   │   │   └── page.tsx            # Trider page UI and logic
│   │   ├── sign-in/                # Placeholder sign-in page with Role Switcher & profile selection
│   │   ├── sign-up/                # Placeholder sign-up page
│   │   ├── globals.css             # Global styles and Tailwind directives
│   │   └── layout.tsx              # Root layout
│   ├── ai/                         # Genkit AI flows and configurations
│   ├── components/                 # UI components
│   │   ├── dispatch/               # Components specific to the dispatch dashboard
│   │   ├── map/                    # Map-related components
│   │   ├── passenger/              # Components specific to the passenger demo
│   │   ├── triders/                # Components for the trider management dashboard
│   │   ├── ui/                     # ShadCN UI components (button, card, etc.)
│   │   └── RoleSwitcher.tsx        # Component for role selection
│   ├── contexts/                   # React Contexts (e.g., SettingsContext)
│   ├── data/                       # Static data (e.g., TODA zone definitions, mock passenger profiles)
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility functions and libraries
│   │   ├── geoUtils.ts             # Geolocation utility functions
│   │   └── utils.ts                # General utility functions (e.g., cn for Tailwind)
│   ├── middleware.ts               # Next.js middleware (currently minimal)
│   └── types/                      # TypeScript type definitions
├── public/                         # Static assets
├── .env.local                      # Environment variables (ignored by Git)
├── next.config.ts                  # Next.js configuration
├── package.json
└── tsconfig.json
```

## Available Scripts

- `npm run dev`: Starts the Next.js development server (Turbopack enabled on port 9002).
- `npm run genkit:dev`: Starts the Genkit development server.
- `npm run genkit:watch`: Starts the Genkit development server with file watching.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the codebase.
- `npm run typecheck`: Runs TypeScript type checking.

## Contributing

Please refer to contributing guidelines if available. For now, ensure code quality, follow existing patterns, and write clear commit messages.

## License

This project is licensed under [Specify License Here - e.g., MIT License].



# TriGo Dispatch Lite - Firebase Studio

This is a Next.js application for TriGo Dispatch Lite, a real-time trider monitoring and dispatching system. Built with Next.js, TypeScript, Tailwind CSS, ShadCN UI components, and Mapbox GL JS.

## Features

- **Dispatch Dashboard (`/`):**
  - Live map visualization of triders and ride requests using Mapbox.
  - TODA (Tricycle Operators and Drivers' Association) zone boundaries displayed on the map.
  - Real-time (mocked) updates for trider locations and incoming ride requests.
  - Selection of triders and ride requests for dispatch.
  - Route calculation and ETA preview using Mapbox Directions API.
  - Manual dispatch functionality (triders can only serve pickups within their assigned TODA zone).
  - Heatmap overlay for ride request density.
  - AI-driven insights and alerts (currently mocked).
- **Trider Management (`/triders`):**
  - Comprehensive list of all triders with details: name, TODA zone, vehicle type, status.
  - Filtering options: by name, TODA zone, status.
  - Detailed Trider panel:
    - Live GPS preview on a mini-map.
    - Status controls (force online/offline, ping trider, suspend/unsuspend).
    - Wallet information: balance, earnings, payout history, recent rides (mocked).
    - Simulated payout functionality.
  - Dispatcher-to-Trider chat functionality (mocked, UI in place).
- **Authentication:** (Currently Removed)
  - Authentication was previously handled by Clerk but has been removed.
  - Sign-in and Sign-up pages are now placeholders.
  - Protected routes are currently accessible without login.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- A Mapbox Access Token

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
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
    The application will be available at `http://localhost:9002` by default (or the port you configured).

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
- **Authentication:** (Removed - previously Clerk)
- **State Management:** React Context, React Hooks
- **Linting/Formatting:** ESLint, Prettier (via Next.js defaults)
- **AI (Optional):** Genkit

## Project Structure (Key Directories)

```
.
├── src/
│   ├── app/                        # Next.js App Router (pages and layouts)
│   │   ├── (dispatch)/             # Group for dispatch routes (previously authenticated)
│   │   │   ├── layout.tsx          # Layout for dispatch section (sidebar, header)
│   │   │   ├── page.tsx            # Main dispatch dashboard page
│   │   │   └── triders/            # Trider management section
│   │   │       └── page.tsx        # Trider management dashboard page
│   │   ├── sign-in/                # Placeholder sign-in page
│   │   ├── sign-up/                # Placeholder sign-up page
│   │   ├── globals.css             # Global styles and Tailwind directives
│   │   └── layout.tsx              # Root layout
│   ├── ai/                         # Genkit AI flows and configurations
│   │   ├── genkit.ts               # Genkit initialization
│   │   └── dev.ts                  # Genkit development server entry
│   ├── components/                 # UI components
│   │   ├── dispatch/               # Components specific to the dispatch dashboard
│   │   ├── map/                    # Map-related components
│   │   ├── triders/                # Components for the trider management dashboard
│   │   └── ui/                     # ShadCN UI components (button, card, etc.)
│   ├── data/                       # Static data (e.g., TODA zone definitions)
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utility functions and libraries
│   │   ├── geoUtils.ts             # Geolocation utility functions
│   │   └── utils.ts                # General utility functions (e.g., cn for Tailwind)
│   ├── middleware.ts               # Next.js middleware (Clerk removed, currently minimal)
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

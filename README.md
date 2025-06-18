# TriGo Lite

A modern, real-time tricycle dispatching and monitoring system built with Next.js, TypeScript, and Mapbox. TriGo Lite provides comprehensive tools for managing TODA (Tricycle Operators and Drivers' Association) operations, including live tracking, dispatch management, and payment processing.

## 🚀 Features

<<<<<<< HEAD
- **Homepage (`/`):**
  - Dynamic, glassmorphic landing page with an animated background.
  - Central triangular TriGo logo (auto-rickshaw SVG) that flips and has an electric aura effect on hover, linking to `https://trigo.live`.
  - Role selection cards (Passenger, Trider, Dispatcher, Admin) with unique icons and color themes, linking to respective demo/dashboard pages.
  - **Payment Method Selection:** Added a section to select a preferred payment method directly on the landing page with autosave functionality.
- **Dispatch Dashboard (`/dispatcher`):**
  - Live map visualization of triders and ride requests using Mapbox.
  - TODA (Tricycle Operators and Drivers' Association) zone boundaries displayed on the map.
  - Real-time (mocked) updates for trider locations and incoming ride requests.
  - Selection of triders and ride requests for dispatch; triders are dynamically filtered based on the selected ride's TODA zone.
  - Route calculation (shortest distance among alternatives) and ETA preview using Mapbox Directions API.
  - Manual dispatch functionality (triders can only serve pickups within their assigned TODA zone).
  - Heatmap overlay for ride request density.
  - AI-driven insights and alerts (currently mocked).
  - **View Switcher:** Toggle between "Dispatch Control" (lists, forms) and "Map View".
- **Trider Management (`/dispatcher/triders`):**
  - Comprehensive list of all triders with details: name, body number, TODA zone, vehicle type, status.
  - Filtering options: by name, TODA zone, status.
  - Sorting functionality by name, body number, TODA zone, or status.
  - Detailed Trider panel:
    - Live GPS preview on a mini-map.
    - Status controls (force online/offline, ping trider, suspend/unsuspend).
    - Wallet information: balance, earnings, payout history, recent rides (mocked).
    - Simulated payout functionality.
    - TODA Zone change request approval/rejection.
  - Dispatcher-to-Trider chat functionality (mocked, UI in place).
- **Passenger Role Simulation (`/passenger`):**
  - **New Landing Page:** Initial view for passengers featuring "Ride Before", "Ride Now", "Ride Later" options, with a background image and themed elements.
  - **Fully Functional Button Interface:**
    - All landing page buttons are now functional with appropriate actions and feedback.
    - Menu, Search, Map Style Toggle, and Login/Logout buttons in header provide interactive functionality.
    - Enhanced "Ride Before" and "Ride Later" buttons with detailed feature descriptions.
    - Map style cycling (Streets → Satellite → Dark) with real-time preview and toast notifications.
  - **Navigation System:**
    - Bottom navigation bar with functional links to Home, Map View, and Profile pages.
    - Dedicated Map page (`/passenger/map`) with enhanced map features and controls.
    - Comprehensive Profile page (`/passenger/profile`) with user management capabilities.
  - **Payment Methods Integration:**
    - Complete payment methods management in profile page with **Apple-like dropdown design**.
    - Support for GCash (with @gcash icon), PayMaya (with @public/maya-logo.png), and TriCoin (custom gold icon).
    - **Autosave functionality** - payment method selections are automatically saved within 500ms.
    - **Real-time autosave status indicator** with visual feedback (saving/saved/error states).
    - **Individual user preferences** - each user's payment method selection persists across sessions.
    - Balance display and payment method status indicators.
    - **Apple-inspired UI** with rounded corners, smooth transitions, and elegant animations.
    - **Manual save option** for immediate confirmation with "Save Now" button.
  - **Requesting Ride:**
    - Map view to select pickup and dropoff locations.
    - Initial pickup suggestion via geolocation. "Locate Me" button inside pickup input field.
    - Address input with autocomplete/suggestions using Mapbox Geocoding API.
  - **Ride In Progress:**
    - Simulation of trider assignment, movement to pickup (following Mapbox route), and trip to destination (following Mapbox route).
    - Displays trider's live location and ETA on the map, with distinct route colors (trider-to-pickup: accent green, pickup-to-dropoff: passenger theme orange).
    - Orange-themed header, white page background.
    - Glassmorphism countdown timer card with neon green text for ETA, visual cues for final 10 seconds. Timer is recomputed periodically for accuracy.
    - Ride Ticket ID display.
    - Ride receipt dialog displayed upon ride completion (data logged to console, not DB).
  - **"Pick Me Up Now" Feature (from `confirmingRide` state):**
    - A prominent button allows passengers to quickly request a ride from their current location to their selected destination.
    - The system automatically identifies the nearest available (online) trider within the passenger's TODA zone (mocked).
    - If the nearest trider does not accept within 10 seconds, the request is automatically forwarded to the next nearest available trider (simulated by assigning a random trider).
  - Customizable map style (streets, satellite, dark) per passenger, saved in `localStorage`.
- **Trider Role Simulation (`/trider`):**
  - **Bottom Navigation:** Dashboard, Wallet, Settings, Premium views.

  - **Dashboard:** Manage status (online/offline). Geolocation on going online. View and accept incoming ride requests within their TODA zone. Map view showing current location, active ride details, and route. Simulation of movement following Mapbox routes.
  - **Wallet (Mocked):** View balance, send/add mock "TriCoin", view mock transaction history.
  - **Settings (Mocked):** Toggle notification preferences, select map style (saved to localStorage).

  - **Premium (Mocked):** View subscription status, mock upgrade/downgrade.
  - Ability to request a change to a different TODA zone.
- **Application Settings (`/dispatcher/settings`):**
  - Customizable theme (light, dark, system).
  - Configuration for default map zoom and center coordinates.
  - Toggle for heatmap visibility on the dispatch map.
  - Adjustable intervals for mock data simulation (new rides, trider updates, AI insights).
  - Configuration for global convenience fee (PIN-protected for demo) and per-TODA base fares.
- **TODA Zones Management (`/dispatcher/toda-management`):**
  - Dedicated page to configure the fare matrix.
  - Set global default base fare and per KM charge.
  - Modal-based editing to override base fares and set Terminal Exit Points (coordinates & address) for specific TODA zones.
  - Search functionality for TODA zones.
  - Placeholder sections for future TODA/Trider/Passenger CRUD operations.
- **Admin Dashboard (`/dispatcher/admin-dashboard`):**
  - Modern UI with real-time (mocked) metrics: Total Users, Triders, Weekly Revenue, Completed Rides with animated counters.
  - Platform Activity line chart (simulated active sessions).
  - Performance metrics panel with progress bars and update effects.
  - Live scrolling notification feed for recent system activities.
  - Quick access buttons grid with glassmorphism style and hover effects.
- **Authentication:** (Currently Removed)
  - Sign-in (`/sign-in`) page features a Role Switcher and Passenger Profile Selector.
  - Sign-up (`/sign-up`) page is a placeholder.
||||||| parent of 1c0fdf2 (latest-jun182025)
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
=======
### Core Functionality
>>>>>>> 1c0fdf2 (latest-jun182025)

- **Real-time Dispatch Dashboard** (`/dispatcher`)
  - Live map visualization with Mapbox GL JS
  - TODA zone boundaries and management
  - Real-time trider location tracking
  - Intelligent route calculation with shortest distance selection
  - Zone-based dispatch restrictions
  - Heatmap visualization for ride density
  - AI-driven insights and alerts

- **Advanced UI Components**
  - **Collapsible/Minimizable Interface**: All UI panels can be collapsed or minimized for a cleaner workspace
  - **Persistent UI State**: Layout preferences saved to localStorage
  - **Floating Quick Stats**: Non-intrusive status panels with key metrics
  - **Responsive Design**: Optimized for both desktop and mobile devices

### Role-Based Interfaces

#### 👨‍✈️ Dispatcher Features
- **Trider Management** (`/dispatcher/triders`)
  - Comprehensive trider directory with filtering and sorting
  - Real-time status monitoring and control
  - Wallet management with payout simulation
  - TODA zone change request handling
  - Direct messaging system (UI ready)
  - Detailed performance analytics

- **TODA Zone Management** (`/dispatcher/toda-management`)
  - Fare matrix configuration
  - Zone-specific pricing overrides
  - Global fare settings management
  - Future CRUD operations support

#### 🚴 Trider Features (`/trider`)
- **Smart Dashboard**
  - Collapsible ride request panel
  - Minimizable profile card with wallet info
  - Floating map controls
  - Quick stats overlay
  - Online/offline status management
  - Geolocation-based positioning
  - Zone-restricted ride acceptance
  - Real-time route navigation
  - TODA zone change requests

#### 👤 Passenger Features (`/passenger`)
- **Intuitive Booking Interface**
  - Interactive map for location selection
  - Address autocomplete with Mapbox Geocoding
  - Real-time trider tracking
  - ETA with glassmorphism countdown
  - Ride receipt generation
  - Multiple payment options via PayMongo
  - Customizable map themes
- **In-Ride Communication**
  - Real-time chat with assigned trider
  - Voice call feature (Premium accounts only)
  - Automated greeting messages
  - Contextual auto-responses from triders
  - Message history during active rides

### 💳 Payment Integration
- **PayMongo Integration**
  - Secure payment processing
  - Multiple payment methods (GCash, Maya, GrabPay, cards, online banking)
  - Real-time webhook handling
  - Wallet top-up functionality
  - Ready for subscription features

### ⚙️ System Features
- **Application Settings** (`/dispatcher/settings`)
  - Theme customization (light/dark/system)
  - Map configuration options
  - Simulation interval controls
  - PIN-protected fee configuration
  - Persistent settings storage

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Maps**: Mapbox GL JS, react-map-gl
- **State Management**: React Context, localStorage
- **Payment Processing**: PayMongo API
- **AI Integration**: Google Genkit (optional)
- **Icons**: Lucide React

## 📁 Project Structure

```
trigo-lite/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── api/                    # API endpoints
│   │   │   └── payment/            # PayMongo integration
│   │   ├── dispatcher/             # Dispatcher routes
│   │   │   ├── layout.tsx          # Shared layout with sidebar
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   ├── triders/            # Trider management
│   │   │   ├── toda-management/    # TODA configuration
│   │   │   └── settings/           # App settings
│   │   ├── passenger/              # Passenger interface
│   │   │   ├── page.tsx            # Booking interface
│   │   │   └── wallet/             # Payment management
│   │   ├── trider/                 # Trider dashboard
│   │   └── sign-in/                # Role selection
│   ├── components/                 # Reusable components
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── dispatch/               # Dispatcher components
│   │   ├── map/                    # Map components
│   │   ├── passenger/              # Passenger components
│   │   └── triders/                # Trider components
│   ├── contexts/                   # React contexts
│   ├── data/                       # Static data/mocks
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Utilities
│   └── types/                      # TypeScript definitions
├── docs/                           # Documentation
├── public/                         # Static assets
└── [config files]                  # Various configuration files
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- Mapbox account with access token
- PayMongo account (for payment features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dagz55/trigo-lite.git
   cd trigo-lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:

   ```env
   # Mapbox Configuration
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

   # PayMongo Configuration
   PAYMONGO_SECRET_KEY=sk_test_your_secret_key
   PAYMONGO_PUBLIC_KEY=pk_test_your_public_key
   NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_your_public_key
   PAYMONGO_WEBHOOK_SECRET=whsk_your_webhook_secret

<<<<<<< HEAD
4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002` by default.
||||||| parent of 1c0fdf2 (latest-jun182025)
4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002` by default (or the port you configured). Access the dispatcher dashboard at `/dispatcher`.
=======
   # Application URL
   NEXT_PUBLIC_APP_URL=http://localhost:9002
>>>>>>> 1c0fdf2 (latest-jun182025)

   # Optional: AI Integration
   # GOOGLE_API_KEY=your_google_ai_studio_key
   ```

<<<<<<< HEAD
## Key Features Highlight

### 🍎 Apple-like Payment Method Selector
- **Design Philosophy:** Inspired by Apple's design language with clean, minimal aesthetics
- **Smooth Animations:** 200ms transitions with rounded corners (rounded-2xl) and backdrop blur effects
- **Intuitive Interaction:** Click-to-open dropdown with visual feedback and hover effects
- **Accessibility:** Full keyboard navigation support and screen reader compatibility

### 💾 Intelligent Autosave System
- **Debounced Saving:** Automatic save after 500ms of inactivity to prevent excessive operations
- **Real-time Status:** Visual indicator showing save progress (idle/saving/saved/error)
- **Persistent Storage:** Uses localStorage for immediate persistence across browser sessions
- **Error Handling:** Comprehensive error handling with manual save fallback option
- **Individual Preferences:** Each user's payment method selection is saved independently

### 🎨 User Experience Enhancements
- **Visual Feedback:** Real-time autosave status with timestamps and error reporting
- **Payment Method Icons:** Custom icons for GCash (@gcash), PayMaya (@public/maya-logo.png), and TriCoin (gold)
- **Balance Display:** Shows current balance for each payment method
- **Default Indicators:** Clear visual indication of selected default payment method

## Tech Stack
||||||| parent of 1c0fdf2 (latest-jun182025)
## Tech Stack
=======
4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
>>>>>>> 1c0fdf2 (latest-jun182025)

<<<<<<< HEAD
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, ShadCN UI
- **Mapping:** Mapbox GL JS, react-map-gl
- **State Management:** React Context (for settings and user data), React Hooks (for page-level state)
- **Data Persistence:** localStorage for client-side data persistence
- **Charts:** Recharts
- **Linting/Formatting:** ESLint, Prettier (via Next.js defaults)
- **AI (Optional):** Genkit
||||||| parent of 1c0fdf2 (latest-jun182025)
- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, ShadCN UI
- **Mapping:** Mapbox GL JS, react-map-gl
- **State Management:** React Context (for settings), React Hooks (for page-level state)
- **Linting/Formatting:** ESLint, Prettier (via Next.js defaults)
- **AI (Optional):** Genkit
=======
   The application will be available at `http://localhost:9002`
>>>>>>> 1c0fdf2 (latest-jun182025)

5. **Access different interfaces**
   - Dispatcher Dashboard: `http://localhost:9002/dispatcher`
   - Trider Interface: `http://localhost:9002/trider`
   - Passenger Interface: `http://localhost:9002/passenger`

<<<<<<< HEAD
```
.
├── src/
│   ├── app/                        # Next.js App Router (pages and layouts)
│   │   ├── dispatcher/             # Dispatcher-specific routes
│   │   │   ├── layout.tsx          # Layout for dispatcher section (sidebar, header)
│   │   │   ├── page.tsx            # Main dispatch dashboard page
│   │   │   ├── triders/            # Trider management section
│   │   │   ├── settings/           # Application settings page
│   │   │   ├── toda-management/    # TODA Zone and fare management page
│   │   │   └── admin-dashboard/    # Admin overview dashboard
│   │   ├── passenger/              # Passenger role simulation
│   │   ├── trider/                 # Trider role simulation
│   │   ├── (sign-in|sign-up)/      # Placeholder auth pages with Role Switcher
│   │   ├── globals.css             # Global styles and Tailwind directives
│   │   └── layout.tsx              # Root layout
│   ├── components/                 # UI components
│   │   ├── dispatch/               # Components specific to the dispatch dashboard
│   │   ├── map/                    # Map-related components
│   │   ├── passenger/              # Components specific to the passenger demo
│   │   ├── triders/                # Components for the trider management dashboard
│   │   ├── ui/                     # ShadCN UI components
│   │   └── RoleSwitcher.tsx        # Component for role selection on sign-in
│   ├── contexts/                   # React Contexts (e.g., SettingsContext)
│   ├── data/                       # Static data (TODA zones, mock passenger profiles)
│   ├── hooks/                      # Custom React hooks (use-mobile, use-toast)
│   ├── lib/                        # Utility functions (geoUtils, utils)
│   ├── middleware.ts               # Next.js middleware (minimal)
│   └── types/                      # TypeScript type definitions
├── public/                         # Static assets
├── .env.local                      # Environment variables
├── next.config.ts                  # Next.js configuration
└── ...
||||||| parent of 1c0fdf2 (latest-jun182025)
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
=======
### Optional: AI Features

To enable AI-powered insights:

```bash
# In a separate terminal
npm run genkit:dev
# or for auto-reload
npm run genkit:watch
>>>>>>> 1c0fdf2 (latest-jun182025)
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 9002) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler check |
| `npm run genkit:dev` | Start Genkit development server |
| `npm run genkit:watch` | Start Genkit with file watching |

## 🔧 Configuration

### Mapbox Setup
1. Sign up at [Mapbox](https://mapbox.com)
2. Create an access token
3. Add to `.env.local`

### PayMongo Setup
1. Create account at [PayMongo Dashboard](https://dashboard.paymongo.com)
2. Get API keys from Developers → API Keys
3. Configure webhooks (see `docs/PAYMONGO_INTEGRATION.md`)

<<<<<<< HEAD
This project is licensed under [Specify License Here - e.g., MIT License].
||||||| parent of 1c0fdf2 (latest-jun182025)
This project is licensed under [Specify License Here - e.g., MIT License].

=======
### Theme Customization
The application supports light, dark, and system themes. Colors and styling can be customized in:
- `src/app/globals.css` - Global styles and CSS variables
- `tailwind.config.ts` - Tailwind configuration

## 📚 Documentation

- [PayMongo Integration Guide](docs/PAYMONGO_INTEGRATION.md)
- [UI Components Guide](docs/UI_COMPONENTS.md)
- [System Blueprint](docs/blueprint.md)
- [API Documentation](docs/API.md) *(coming soon)*
- [Component Library](docs/COMPONENTS.md) *(coming soon)*

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow existing code patterns
- Use TypeScript strict mode
- Write meaningful commit messages
- Add appropriate documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Mapbox](https://mapbox.com) for mapping services
- [PayMongo](https://paymongo.com) for payment processing
- The TODA community of Las Piñas City

---

Built with ❤️ for the Philippine tricycle community

>>>>>>> 1c0fdf2 (latest-jun182025)

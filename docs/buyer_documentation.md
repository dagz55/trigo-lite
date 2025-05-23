# TriGo Lite Buyer Documentation

This document provides comprehensive information for buyers of the TriGo Lite application, covering its purpose, usage, technical overview, and guidance on maintenance, scaling, and support.

## 1. Introduction

TriGo Lite is a real-time trider monitoring and dispatching system built as a Next.js application. It is designed to facilitate the management and operation of a tricycle fleet, connecting passengers, triders, and dispatchers through a unified platform. The application provides features for ride requests, trider tracking, dispatching, and administrative oversight.

## 2. Getting Started

This section outlines the steps required to set up and run the TriGo Lite application.

### 2.1 Prerequisites

Ensure the following software is installed on your system:

*   **Node.js:** The recommended LTS version.
*   **npm or yarn:** Package managers for Node.js.
*   **Mapbox Access Token:** Required for map functionalities. Obtain one from [Mapbox](https://www.mapbox.com/).

### 2.2 Installation

1.  **Obtain the application code:** You will receive the application code as a compressed archive or a link to a code repository. If it's a repository, clone it using Git:
    ```bash
    git clone [repository_url]
    cd trigo-lite
    ```
    If it's an archive, extract it and navigate into the project directory.

2.  **Install dependencies:** Open a terminal in the project directory and run the appropriate command:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:** Create a file named `.env.local` in the root directory of the project. Add your Mapbox Access Token to this file:
    ```env
    # Mapbox Configuration
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

    # Optional: Genkit/AI Configuration (if used)
    # If AI features are enabled, you might need additional keys.
    # Example for Google AI Studio API Key:
    # GOOGLE_API_KEY=your_google_ai_studio_api_key
    ```
    Replace `your_mapbox_access_token_here` with your actual Mapbox token. Additional environment variables may be required depending on specific configurations or integrations (e.g., database credentials, API keys). Consult the deployment guide for production environment variables.

### 2.3 Running the Application

1.  **Development Server:** To run the application in development mode (suitable for testing and development):
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be accessible at `http://localhost:9002`.

2.  **Production Build and Server:** To build the application for production and serve it:
    ```bash
    npm run build
    # or
    yarn build
    ```
    Then, start the production server:
    ```bash
    npm run start
    # or
    yarn start
    ```
    The production server will also typically run on a specified port (often 3000 or 9002, depending on configuration).

3.  **Genkit Development Server (if using AI features):** If the application utilizes AI features via Genkit, you may need to run the Genkit development server in a separate terminal:
    ```bash
    npm run genkit:dev
    # or for watching changes
    npm run genkit:watch
    ```

## 3. Usage

TriGo Lite supports multiple user roles: Passenger, Trider, Dispatcher, and Admin. Access to specific roles is typically managed through the sign-in process.

### 3.1 Homepage (`/`)

The landing page provides an overview of the application and allows users to select their role to proceed to the respective interfaces.

### 3.2 Passenger Role (`/passenger`)

Simulates the passenger experience.
*   **Landing Page:** Choose between "Ride Before", "Ride Now", "Ride Later".
*   **Requesting a Ride:** Use the map to select pickup and dropoff locations. Geolocation can suggest the initial pickup. Address input includes autocomplete.
*   **Ride In Progress:** View the trider's location and ETA on the map. The map displays routes for the trider's journey to pickup and the trip to the destination. A countdown timer shows the estimated time of arrival.
*   **"Pick Me Up Now":** Quickly request a ride from the current location. The system attempts to assign the nearest available trider within the TODA zone.
*   **Ride Completion:** A ride receipt dialog is displayed upon completion.
*   **Settings:** Customizable map style saved in local storage.

### 3.3 Trider Role (`/trider`)

Simulates the trider experience.
*   **Bottom Navigation:** Access Dashboard, Wallet, Settings, and Premium views.
*   **Dashboard:** Manage online/offline status. View and accept incoming ride requests within their assigned TODA zone. The map shows the trider's current location and active ride details.
*   **Wallet (Mocked):** View balance, simulate transactions.
*   **Settings (Mocked):** Configure notification preferences and map style.
*   **Premium (Mocked):** View subscription status.
*   **TODA Zone Change Request:** Ability to request a change to a different TODA zone.

### 3.4 Dispatcher Dashboard (`/dispatcher`)

The central hub for managing triders and ride requests.
*   **Map Visualization:** Live view of triders and ride requests on a Mapbox map, including TODA zone boundaries.
*   **Real-time Updates (Mocked):** Simulated updates for trider locations and ride requests.
*   **Dispatching:** Select triders and ride requests for manual dispatch. Triders are filtered by the ride's TODA zone.
*   **Route Calculation:** Preview shortest routes and ETAs using Mapbox Directions API.
*   **Heatmap:** Overlay showing ride request density.
*   **AI Insights (Mocked):** Simulated AI-driven alerts and insights.
*   **View Switcher:** Toggle between dispatch control panels (lists, forms) and the main map view.

### 3.5 Trider Management (`/dispatcher/triders`)

Manage the trider fleet.
*   **Trider List:** View details for all triders (name, body number, TODA zone, status).
*   **Filtering and Sorting:** Filter by name, TODA zone, status, and sort by various criteria.
*   **Detailed Trider Panel:** View live GPS preview, control trider status (online/offline, suspend), view wallet information, simulate payouts, and manage TODA zone change requests.
*   **Dispatcher-to-Trider Chat (Mocked):** UI is in place for communication.

### 3.6 Application Settings (`/dispatcher/settings`)

Configure application-wide settings.
*   **Theme:** Customize the application theme (light, dark, system).
*   **Map Configuration:** Set default map zoom and center coordinates.
*   **Heatmap:** Toggle heatmap visibility on the dispatch map.
*   **Simulation Intervals:** Adjust intervals for mock data updates (new rides, trider locations, AI insights).
*   **Fare Configuration:** Configure global convenience fees (PIN-protected) and per-TODA base fares.

### 3.7 TODA Zones Management (`/dispatcher/toda-management`)

Manage TODA zones and fare structures.
*   **Fare Matrix:** Configure global default base fare and per KM charge.
*   **TODA Zone Specific Fares:** Use modals to override base fares and set Terminal Exit Points for specific TODA zones.
*   **Search:** Search for specific TODA zones.
*   **CRUD Placeholders:** Sections for future Create, Read, Update, Delete operations for TODA, Trider, and Passenger data.

### 3.8 Admin Dashboard (`/dispatcher/admin-dashboard`)

Provides an administrative overview.
*   **Metrics (Mocked):** View simulated real-time metrics like Total Users, Triders, Revenue, and Completed Rides.
*   **Platform Activity:** Line chart showing simulated active sessions.
*   **Performance Metrics:** Panel with simulated performance indicators.
*   **Notification Feed:** Live scrolling feed of recent system activities.
*   **Quick Access:** Grid of buttons for quick navigation to key sections.

## 4. Architecture Overview

TriGo Lite is built using the following key technologies:

*   **Next.js (App Router):** The React framework for building the application interface and handling routing.
*   **TypeScript:** Provides static typing for improved code quality and maintainability.
*   **Tailwind CSS & ShadCN UI:** Used for styling and pre-built UI components.
*   **Mapbox GL JS & react-map-gl:** For interactive maps and geospatial data visualization.
*   **React Context & Hooks:** For state management within the application.
*   **Recharts:** Used for rendering charts in the Admin Dashboard.
*   **Genkit (Optional):** A framework for building AI-powered features.

The application follows a component-based architecture, with pages defined in the `src/app` directory and reusable UI components in `src/components`. Utility functions and data are organized in `src/lib` and `src/data` respectively.

## 5. Configuration

Beyond the `.env.local` file for API keys, some application settings can be configured within the Dispatcher Settings page (`/dispatcher/settings`). These include theme, map defaults, simulation intervals, and fare structures.

For production deployments, additional configuration related to databases, authentication providers, and other services will be necessary. Refer to the specific deployment guide for your environment.

## 6. Maintenance

Regular maintenance is crucial for the smooth operation of the application.
*   **Dependency Updates:** Periodically update project dependencies using `npm update` or `yarn upgrade`. Review changelogs for any breaking changes.
*   **Monitoring:** Implement monitoring for server health, application logs, and performance metrics.
*   **Backups:** Establish a backup strategy for any persistent data (e.g., databases, if connected).
*   **Security:** Keep dependencies updated to patch security vulnerabilities. Follow secure coding practices.

## 7. Troubleshooting

Common issues may include:
*   **Map not loading:** Verify your `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` in `.env.local` is correct and that you have an active Mapbox account. Check browser console for Mapbox related errors.
*   **Application not starting:** Check the terminal output for error messages during `npm run dev` or `npm run start`. Ensure Node.js and dependencies are correctly installed.
*   **Mock data not updating:** Check the simulation interval settings in the Dispatcher Settings page. Ensure the development server is running correctly.
*   **Build failures:** Check the output of `npm run build` for specific error messages. Ensure all dependencies are installed and there are no TypeScript or linting errors.

For more complex issues, consult the application logs and the browser's developer console for detailed error information.

## 8. Scaling

The current TriGo Lite application is designed as a demonstration and may require significant modifications for large-scale production use.
*   **Backend:** The current version relies heavily on mocked data and lacks a persistent backend database and real-time communication layer (like WebSockets). A production deployment would require implementing a robust backend to handle user authentication, data storage, real-time updates, and business logic.
*   **Real-time Data:** Replace mocked data with actual data fetched from a backend. Implement real-time data streaming for trider locations and ride requests.
*   **Mapbox Usage:** Monitor Mapbox API usage and consider optimizing map interactions and data fetching to manage costs and performance at scale.
*   **Server Infrastructure:** Deploy the Next.js application to a scalable hosting environment (e.g., Vercel, Netlify, AWS, Google Cloud) and ensure the backend infrastructure can handle anticipated load.

## 9. Support

Support arrangements for the TriGo Lite application are subject to the terms of your purchase agreement. Please refer to your contract for details on support channels, hours, and scope.

## 10. Upgrades and Updates

Applying upgrades or updates to the TriGo Lite application will typically involve:
1.  **Obtaining the updated code:** Receive the new version of the application code.
2.  **Installing new dependencies:** Run `npm install` or `yarn install` in the updated project directory to install any new or updated dependencies.
3.  **Reviewing Changelogs:** Check the `CHANGELOG.md` file (if provided) for information on changes, new features, bug fixes, and any migration steps required.
4.  **Applying Configuration Changes:** Update environment variables or application settings as required by the new version.
5.  **Building and Deploying:** Build the new version for production (`npm run build`) and deploy it to your hosting environment.
6.  **Testing:** Thoroughly test the updated application in a staging environment before deploying to production.

Major upgrades might require database schema changes or significant code modifications. Always back up your data and code before performing major updates.

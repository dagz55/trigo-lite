
# TriGo Dispatch Lite - Firebase Studio

This is a Next.js application for TriGo Dispatch Lite, a real-time trider monitoring and dispatching system. Built with Next.js, TypeScript, Tailwind CSS, ShadCN UI components, Mapbox GL JS, and Clerk for authentication.

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
- **Authentication:**
  - Secured by Clerk, protecting dashboard and trider management pages.
  - Sign-in and Sign-up flows.

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm or yarn
- A Mapbox Access Token
- Clerk Account and Application Setup

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
    # Clerk Configuration
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...

    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

    # Clerk Domain/Proxy (Important for production)
    # If your app is hosted at https://example.com
    # For development, usually http://localhost:PORT (e.g., http://localhost:9002)
    # For production (e.g., app.trigo.live):
    # CLERK_PROXY_URL should be your app's full public URL, including https://
    # NEXT_PUBLIC_CLERK_DOMAIN should be your app's domain (e.g., app.trigo.live or trigo.live)
    CLERK_PROXY_URL=
    NEXT_PUBLIC_CLERK_DOMAIN=


    # Mapbox Configuration
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

    # Genkit/AI Configuration (if used)
    # Example for Google AI Studio API Key
    # GOOGLE_API_KEY=your_google_ai_studio_api_key
    ```

    **CRITICAL Notes on Clerk `NEXT_PUBLIC_CLERK_DOMAIN` and `CLERK_PROXY_URL` for Production:**

    This application uses Clerk's **proxy setup**. This means your Next.js application backend itself acts as a proxy for Clerk's services. Authentication routes like `/sign-in` and `/sign-up` are handled by your application, which then communicates with Clerk.

    *   **Development (e.g., `http://localhost:9002`):**
        *   `NEXT_PUBLIC_CLERK_DOMAIN=localhost`
        *   `CLERK_PROXY_URL=http://localhost:9002` (Match your dev server URL and port)
    *   **Production (e.g., `https://app.trigo.live`):**
        *   `CLERK_PROXY_URL=https://app.trigo.live` (**MUST include `https://` and be the full, public URL of your deployed application.**)
        *   `NEXT_PUBLIC_CLERK_DOMAIN=app.trigo.live` (The domain your users access your app on. Do not include `https://` here.)

    **Why is this important?**
    If `CLERK_PROXY_URL` is incorrect (e.g., missing `https://`, wrong domain, or points to a non-existent URL), Clerk's authentication flow will break. Errors like "unsupported protocol" often arise from `CLERK_PROXY_URL` not having `https://` in a production HTTPS environment. Errors like "server IP address could not be found" for `accounts.yourdomain.com` can happen if Clerk is misconfigured to look for a separate `accounts` subdomain instead of using your app as the proxy.

4.  **Configure DNS for Production (Custom Domain):**
    If you are using a custom domain (e.g., `app.trigo.live`), your primary DNS setup is for your application itself.

    **DNS Setup (General Guidance for `app.trigo.live`):**
    *   Your application domain (e.g., `app.trigo.live`) should have an `A` record or `CNAME` record pointing to your hosting provider (e.g., Vercel, Netlify, your server IP).
    *   **With the proxy setup used in this app, you typically DO NOT need separate `CNAME` records for Clerk like `clerk.yourdomain.com` or `accounts.yourdomain.com`.** Your application at `CLERK_PROXY_URL` handles the Clerk interaction.

    **Example DNS `CNAME` for `app.trigo.live` (if hosting on Vercel):**
    *   Type: `CNAME`
    *   Name: `app` (or `www` if `www.trigo.live`, or `@` if `trigo.live` is the application host)
    *   Value: `cname.vercel-dns.com.` (or your specific hosting provider's CNAME target)

    **Key Clerk Environment Variables for Custom Domain (e.g., `https://app.trigo.live`):**
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # Your actual publishable key
    CLERK_SECRET_KEY=sk_test_... # Your actual secret key

    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in       # Path on your app
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up       # Path on your app
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

    # Essential for custom domain proxy setup:
    CLERK_PROXY_URL=https://app.trigo.live # CRITICAL: Full HTTPS URL of your app
    NEXT_PUBLIC_CLERK_DOMAIN=app.trigo.live  # Your app's domain
    ```

    *   **Verify your domain setup in the Clerk Dashboard:**
        *   Go to your Clerk application -> API Keys. Note your Publishable Key and Secret Key.
        *   Go to Clerk application -> Paths. Ensure "Sign-in URL", "Sign-up URL", etc., match your app's routes (e.g., `/sign-in`, `/sign-up`). These are paths on *your* application.
        *   Go to Clerk application -> Domains.
            *   For a proxy setup, your primary concern is that your application is reachable at `CLERK_PROXY_URL`.
            *   If you previously configured a "Custom Domain" in Clerk (e.g., `clerk.yourdomain.com`), ensure this is not conflicting. With the proxy setup, Clerk does not need its own subdomain.
            *   The "Frontend API URL" and "Accounts portal URL" listed in the Clerk Dashboard may reflect Clerk's own domains (like `*.clerk.accounts.dev`). This is normal when using proxy, as your app (via `CLERK_PROXY_URL`) is the effective frontend.

    **Troubleshooting Clerk Errors:**

    *   **"Server IP address could not be found" for `accounts.yourdomain.com` or `clerk.yourdomain.com`:**
        This typically occurs if:
        1.  Your Clerk application in the Dashboard is configured to use a custom Clerk subdomain (e.g., `accounts.yourdomain.com`) AND you haven't set up the corresponding CNAME record in your DNS.
        2.  **More likely for this project:** Your `CLERK_PROXY_URL` or `NEXT_PUBLIC_CLERK_DOMAIN` might be incorrect, causing Clerk to fall back or attempt to use a separate domain structure.
        **Solution for this project:** Ensure `CLERK_PROXY_URL` points to your *application's* full HTTPS URL (e.g., `https://app.trigo.live`) and `NEXT_PUBLIC_CLERK_DOMAIN` is set to your app's domain (e.g., `app.trigo.live`). Your app itself serves the Clerk UI components on its own paths (e.g., `https://app.trigo.live/sign-in`). **No CNAME for `accounts.yourdomain.com` should be needed for Clerk when using the proxy setup correctly.**

    *   **"`accounts.trigo.live` uses an unsupported protocol" or similar SSL/protocol errors:**
        This error strongly suggests that Clerk is attempting to connect to a URL using `http` when `https` is expected, or the URL is malformed.
        1.  **Check `CLERK_PROXY_URL`:** This is the most common culprit. **Ensure this environment variable includes the `https://` prefix for your production URL** (e.g., `CLERK_PROXY_URL=https://app.trigo.live`, NOT `CLERK_PROXY_URL=app.trigo.live`).
        2.  **Check `NEXT_PUBLIC_CLERK_DOMAIN`:** Ensure this is the correct hostname without the protocol (e.g., `app.trigo.live`).
        3.  **Clerk Dashboard Settings:** Double-check any URLs configured in your Clerk dashboard (e.g., under "Paths" or "Domains"). Ensure they also use `https://` where appropriate if they refer to your application directly. If `accounts.trigo.live` is appearing in error messages, it indicates that Clerk is still attempting to use that subdomain, likely due to misconfiguration in environment variables or the dashboard not correctly recognizing the proxy setup.
        4.  **Mixed Content:** Ensure your entire application is served over HTTPS in production. Your hosting provider should enforce HTTPS.

    *   **Infinite Redirects or "Too many redirects":**
        This can happen if your middleware or Clerk settings create a loop.
        1.  Check your `middleware.ts` and ensure `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` are correct and accessible.
        2.  Ensure your `CLERK_PROXY_URL` and `NEXT_PUBLIC_CLERK_DOMAIN` are correctly set for your environment.
        3.  Verify your Clerk application "Paths" settings in the dashboard are correct.

5.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be available at `http://localhost:9002` by default (or the port you configured).

6.  **(Optional) Run Genkit development server (if using AI features):**
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
- **Authentication:** Clerk
- **State Management:** React Context, React Hooks
- **Linting/Formatting:** ESLint, Prettier (via Next.js defaults)
- **AI (Optional):** Genkit

## Project Structure (Key Directories)

```
.
├── src/
│   ├── app/                        # Next.js App Router (pages and layouts)
│   │   ├── (dispatch)/             # Group for authenticated dispatch routes
│   │   │   ├── layout.tsx          # Layout for dispatch section (sidebar, header)
│   │   │   ├── page.tsx            # Main dispatch dashboard page
│   │   │   └── triders/            # Trider management section
│   │   │       └── page.tsx        # Trider management dashboard page
│   │   ├── sign-in/                # Clerk sign-in page
│   │   ├── sign-up/                # Clerk sign-up page
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
│   ├── middleware.ts               # Next.js middleware (for Clerk authentication)
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
```
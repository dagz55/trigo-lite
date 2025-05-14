
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

    **Notes on Clerk `NEXT_PUBLIC_CLERK_DOMAIN` and `CLERK_PROXY_URL`:**
    *   **Development (e.g., `http://localhost:9002`):**
        *   If your app runs on `http://localhost:9002`, you might not need to set `NEXT_PUBLIC_CLERK_DOMAIN` and `CLERK_PROXY_URL` explicitly if Clerk's default development setup works for you.
        *   However, if you encounter issues or want to prepare for production, set them:
            *   `NEXT_PUBLIC_CLERK_DOMAIN=localhost` (or your specific local hostname if not just 'localhost')
            *   `CLERK_PROXY_URL=http://localhost:9002` (ensure this matches your dev server URL)
    *   **Production (e.g., `https://app.trigo.live`):**
        *   `CLERK_PROXY_URL=https://app.trigo.live` (**Must include `https://`**)
        *   `NEXT_PUBLIC_CLERK_DOMAIN=app.trigo.live` (The domain your users access your app on)
        *   This configuration tells Clerk that authentication requests originating from your frontend at `app.trigo.live` are legitimate and should be handled by your backend also at `app.trigo.live` acting as a proxy.

4.  **Configure Clerk DNS for Production (Custom Domain):**
    If you are using a custom domain for your application (e.g., `app.trigo.live`) and want Clerk to operate seamlessly under this domain (e.g., handling sign-in at `app.trigo.live/sign-in`), you need to ensure your DNS is correctly set up for your hosting provider.

    Clerk's JWT tokens are typically issued for the domain specified in your Clerk dashboard settings. For custom domains, you'll use the "Proxy URL" setup with the `CLERK_PROXY_URL` environment variable.

    **DNS Setup (General Guidance):**
    *   Your primary application domain (e.g., `app.trigo.live`) should have an `A` record or `CNAME` record pointing to your hosting provider (e.g., Vercel, Netlify, your server IP).
    *   **Clerk's recommended setup for custom domains with Next.js (like this project) involves setting the `CLERK_PROXY_URL` environment variable to your application's full public URL (e.g., `https://app.trigo.live`).** This makes your application backend proxy requests to Clerk, allowing authentication to happen under your domain. No separate `clerk.` or `accounts.` CNAME records are typically needed for Clerk itself when using the proxy method.

    **Example DNS `CNAME` for `app.trigo.live` (if hosting on Vercel):**
    *   Type: `CNAME`
    *   Name: `app` (or `www` if `www.trigo.live`, or `@` if `trigo.live` is the application host)
    *   Value: `cname.vercel-dns.com.` (or your specific hosting provider's CNAME target)

    **Key Clerk Environment Variables for Custom Domain (e.g., `https://app.trigo.live`):**
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_... # Your actual publishable key
    CLERK_SECRET_KEY=sk_test_... # Your actual secret key

    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

    # Essential for custom domain proxy setup:
    CLERK_PROXY_URL=https://app.trigo.live # CRITICAL: Must be the full URL where your app is hosted, including https
    NEXT_PUBLIC_CLERK_DOMAIN=app.trigo.live  # The domain Clerk should associate with (for cookies, etc.)
    ```

    *   **Verify your domain setup in the Clerk Dashboard:**
        *   Go to your Clerk application -> API Keys. Note your Publishable Key and Secret Key.
        *   Go to Clerk application -> Paths. Ensure "Sign-in URL", "Sign-up URL", etc., match your app's routes (e.g., `/sign-in`, `/sign-up`).
        *   Go to Clerk application -> Domains. For a proxy setup, the "Frontend API URL" and "Accounts portal URL" are less critical as your app handles these. However, ensure no settings there conflict with your proxy setup. If you previously had a CNAME setup (e.g., `clerk.yourdomain.com`), you might need to adjust settings if you're moving to a full proxy model.

    **Troubleshooting Clerk Issues:**

    *   **"Server IP address could not be found" for `accounts.yourdomain.com` or `clerk.yourdomain.com`:**
        This error usually means that a `CNAME` record for a Clerk-specific subdomain (e.g., `accounts.yourdomain.com` or the one shown as "Frontend API URL" in your Clerk dashboard if it's like `clerk.happy.panda-12.lcl.dev`) is either missing or misconfigured in your DNS settings.
        1.  **Using Proxy (Recommended for this app structure):** If you are using the `CLERK_PROXY_URL` (e.g., `https://app.trigo.live`), your app *itself* acts as the frontend for Clerk. In this case, you generally **do not need** a CNAME record for `accounts.yourdomain.com` or `clerk.yourdomain.com` pointing to Clerk's servers. The error might appear if `CLERK_PROXY_URL` is missing or incorrect, or if Clerk dashboard settings are still trying to direct to a separate `accounts.` subdomain.
            *   **Ensure `CLERK_PROXY_URL` is correctly set to your app's full public HTTPS URL.**
            *   **Ensure `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (and `_SIGN_UP_URL`) point to paths on *your* app (e.g., `/sign-in`).**
            *   Review your Clerk Dashboard settings under "Domains" and "Paths" to ensure they align with your app handling these routes directly.
        2.  **If NOT using Proxy (Clerk Hosted UI on subdomain):** If you intend for Clerk to host UI on `accounts.yourdomain.com`, then you *do* need a CNAME record for `accounts` (or whatever subdomain Clerk specifies) pointing to Clerk's servers. This is less common for Next.js apps that embed Clerk components.
        3.  **DNS Propagation:** DNS changes can take time to propagate (up to 48 hours, but usually much faster). Use a DNS checker tool to verify.

    *   **"accounts.trigo.live uses an unsupported protocol" or similar protocol errors:**
        This error strongly suggests that Clerk is attempting to connect to a URL using `http` when `https` is expected, or the URL is malformed.
        1.  **Check `CLERK_PROXY_URL`:** Ensure this environment variable includes the `https://` prefix for your production URL (e.g., `CLERK_PROXY_URL=https://app.trigo.live`, NOT `CLERK_PROXY_URL=app.trigo.live`).
        2.  **Check `NEXT_PUBLIC_CLERK_DOMAIN`:** Ensure this is the correct hostname (e.g., `app.trigo.live`).
        3.  **Clerk Dashboard Settings:** Double-check any URLs configured in your Clerk dashboard (e.g., under "Paths" or "Domains"). Ensure they also use `https://` where appropriate and align with your proxy setup. If `accounts.trigo.live` is appearing in error messages, it indicates that Clerk is still attempting to use that subdomain, which might be due to misconfiguration in the dashboard or environment variables not correctly enforcing the proxy behavior.
        4.  **Mixed Content:** Ensure your entire application is served over HTTPS in production.

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


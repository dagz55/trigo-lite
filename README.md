
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
    NEXT_PUBLIC_CLERK_DOMAIN=
    CLERK_PROXY_URL=


    # Mapbox Configuration
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

    # Genkit/AI Configuration (if used)
    # Example for Google AI Studio API Key
    # GOOGLE_API_KEY=your_google_ai_studio_api_key
    ```

    **Notes on Clerk `NEXT_PUBLIC_CLERK_DOMAIN` and `CLERK_PROXY_URL`:**
    *   **Development:**
        *   If your app runs on `http://localhost:9002`, you might not need to set `NEXT_PUBLIC_CLERK_DOMAIN` and `CLERK_PROXY_URL` explicitly if Clerk's default development setup works for you.
        *   However, if you encounter issues or want to prepare for production, set them:
            *   `NEXT_PUBLIC_CLERK_DOMAIN=localhost` (or your specific local hostname if not just 'localhost')
            *   `CLERK_PROXY_URL=http://localhost:9002`
    *   **Production (e.g., `app.trigo.live`):**
        *   `NEXT_PUBLIC_CLERK_DOMAIN=app.trigo.live`
        *   `CLERK_PROXY_URL=https://app.trigo.live`
        *   This tells Clerk that authentication requests originating from your frontend at `app.trigo.live` are legitimate and should be handled by your backend also at `app.trigo.live`.

4.  **Configure Clerk DNS for Production (Custom Domain):**
    If you are using a custom domain for your application (e.g., `app.trigo.live`) and want Clerk to operate seamlessly under this domain (e.g., handling sign-in at `app.trigo.live/sign-in`), you need to ensure your DNS is correctly set up for your hosting provider.

    Clerk's JWT tokens are typically issued for the domain specified in your Clerk dashboard settings (Frontend API URL). For custom domains, you'll typically use the "Proxy URL" or similar settings in Clerk to make your application itself act as the authentication frontend.

    **DNS Setup (General Guidance):**
    *   Your primary application domain (e.g., `app.trigo.live`) should have an `A` record or `CNAME` record pointing to your hosting provider (e.g., Vercel, Netlify, your server IP).
    *   **Clerk's recommended setup for custom domains involves setting the `CLERK_PROXY_URL` environment variable to your application's public URL.** This makes your application backend proxy requests to Clerk, allowing authentication to happen under your domain.
    *   If you were using Clerk's hosted pages (e.g., `clerk.yourdomain.com`), you would set up a `CNAME` record for `clerk` pointing to Clerk's servers. However, this project uses Clerk components embedded within the Next.js app, making the proxy URL setup more relevant.

    **Example DNS `CNAME` for `app.trigo.live` (if hosting on Vercel):**
    *   Type: `CNAME`
    *   Name: `app` (or `www` if `www.trigo.live`)
    *   Value: `cname.vercel-dns.com.` (or your specific hosting provider's CNAME target)

    **Key Clerk Environment Variables for Custom Domain (`app.trigo.live`):**
    ```env
    NEXT_PUBLIC_CLERK_FRONTEND_API=your_clerk_frontend_api_from_dashboard 
    # Typically starts with clerk. and your domain, e.g., clerk.happy.panda-12.lcl.dev
    # Or if you use a custom CNAME for Clerk itself (less common with this setup):
    # NEXT_PUBLIC_CLERK_FRONTEND_API=clerk.app.trigo.live 

    # This is the important one for making your app handle auth routes like /sign-in
    CLERK_PROXY_URL=https://app.trigo.live 
    NEXT_PUBLIC_CLERK_DOMAIN=app.trigo.live # The domain your users access for Clerk UI
    ```
    *   **Consult your hosting provider's documentation** for specific instructions on adding DNS records.
    *   **Verify your domain setup in the Clerk Dashboard** under your application's settings (Paths, Domain & URLs). Ensure the Frontend API URL and other paths match your application's structure.

    **Troubleshooting "Server IP address could not be found" for `accounts.yourdomain.com`:**
    This error usually means that a `CNAME` record for `accounts.yourdomain.com` (or whatever subdomain Clerk is trying to use, often derived from your Frontend API URL in Clerk settings) is either missing or misconfigured in your DNS settings.
    1.  **Check Clerk Dashboard:** Go to your Clerk application -> Domains. Note the "Frontend API URL". If it's `clerk.something.your-domain.com`, ensure there's a CNAME for `clerk.something` pointing to the value Clerk provides.
    2.  **If using Proxy:** Ensure `CLERK_PROXY_URL` is set to your main app URL (e.g., `https://app.trigo.live`) and `NEXT_PUBLIC_CLERK_SIGN_IN_URL` points to a path on your app (e.g., `/sign-in`). With proxy, Clerk doesn't need a separate `accounts.` subdomain.
    3.  **DNS Propagation:** DNS changes can take time to propagate (up to 48 hours, but usually much faster). Use a DNS checker tool to verify.

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

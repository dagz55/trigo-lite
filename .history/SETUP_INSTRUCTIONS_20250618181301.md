# TriGo Lite Setup Instructions

## Environment Variables

To run this application, you need to set up the following environment variables in a `.env.local` file in the root directory:

### Required Environment Variables

1. **Clerk Authentication** (Required)
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_here
   CLERK_SECRET_KEY=your_secret_key_here
   ```
   - Sign up for a free account at https://clerk.com
   - Create a new application
   - Go to the API Keys section in your dashboard
   - Copy both the Publishable Key and Secret Key

2. **Clerk URLs** (Optional - these have defaults)
   ```
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
   ```

### Optional Environment Variables

3. **Supabase Configuration** (if using database features)
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **PayMongo Configuration** (if using payment features)
   ```
   PAYMONGO_SECRET_KEY=your_paymongo_secret_key_here
   NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=your_paymongo_public_key_here
   ```

5. **Mapbox Configuration** (if using map features)
   ```
   NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
   ```

6. **Firebase Configuration** (if using Firebase features)
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
   ```

## Quick Start

1. Copy the environment variables template:
   ```bash
   cp .env.example .env.local
   ```
   (If .env.example doesn't exist, create .env.local manually)

2. Fill in at least the required Clerk environment variables

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## Build Issues Fixed

The following issues have been addressed:
- ✅ Updated middleware from deprecated `authMiddleware` to `clerkMiddleware`
- ✅ Fixed Google Fonts import errors by using system fonts
- ✅ Updated font CSS variables to match the new setup

## Notes

- The application uses Clerk for authentication, so you must have valid Clerk API keys to run the application
- The middleware is configured to allow public access to certain routes (/, /sign-in, /sign-up, /dispatcher, /trider)
- Protected routes will require authentication 
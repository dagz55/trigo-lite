# Clerk Authentication Setup for TriGo Passenger

This guide explains how to complete the Clerk authentication setup for the TriGo Passenger UI.

## What Has Been Done

1. **Installed Clerk SDK**: `@clerk/nextjs` has been installed
2. **Updated Layout**: ClerkProvider wraps the entire application in `src/app/layout.tsx`
3. **Updated Middleware**: Authentication middleware protects the `/passenger` routes
4. **Sign In/Up Pages**: Clerk components are integrated at `/sign-in` and `/sign-up`
5. **Passenger UI Header**: Login button shows for signed-out users, user profile for signed-in users

## Required Setup Steps

### 1. Create a Clerk Account
1. Go to [https://clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose "Next.js" as your framework

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory with your Clerk keys:

```env
# Clerk Authentication Configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/passenger
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/passenger

# Your existing Mapbox token
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

### 3. Get Your Clerk Keys
1. In your Clerk Dashboard, go to "API Keys"
2. Copy the "Publishable key" and "Secret key"
3. Replace the placeholder values in `.env.local`

### 4. Configure Authentication Methods (Optional)
In the Clerk Dashboard:
1. Go to "User & Authentication" → "Email, Phone, Username"
2. Enable your preferred authentication methods
3. Configure social login providers if desired

### 5. Customize Appearance (Optional)
The current implementation uses TriGo's red theme (#EE0000). To further customize:
1. Go to Clerk Dashboard → "Customization"
2. Adjust colors, fonts, and layout to match your brand

## How It Works

1. **Unauthenticated Users**: When users visit `/passenger`, they'll see a "Log In" button in the header
2. **Sign In Flow**: Clicking "Log In" opens a modal with Clerk's sign-in form
3. **Protected Routes**: The middleware automatically redirects unauthenticated users to sign in
4. **User Profile**: Signed-in users see their profile button with options to manage account or sign out

## Testing

1. Start your development server: `npm run dev`
2. Navigate to `/passenger`
3. Click the "Log In" button
4. Create an account or sign in
5. You'll be redirected back to the passenger interface

## Troubleshooting

- **"Missing publishable key"**: Ensure your `.env.local` file has the correct Clerk keys
- **Redirect loops**: Check that your middleware configuration matches the routes in `.env.local`
- **Styling issues**: The Clerk components use the TriGo red theme (#EE0000) by default

## Next Steps

- Consider adding role-based access control for passengers vs. dispatchers
- Implement user metadata to store passenger preferences
- Add webhook handlers for user events
- Set up production environment variables for deployment 
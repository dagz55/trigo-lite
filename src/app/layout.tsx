<<<<<<< HEAD
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
||||||| parent of 1c0fdf2 (latest-jun182025)

import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import 'mapbox-gl/dist/mapbox-gl.css';
=======
>>>>>>> 1c0fdf2 (latest-jun182025)
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from '@/contexts/SettingsContext';
<<<<<<< HEAD
import { UserProvider } from '@/contexts/UserContext';
||||||| parent of 1c0fdf2 (latest-jun182025)

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});
=======
import { ClerkProvider } from '@clerk/nextjs';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Metadata } from 'next';
import './globals.css';
>>>>>>> 1c0fdf2 (latest-jun182025)

export const metadata: Metadata = {
  title: 'TriGo Official',
  description: 'Real-time trider monitoring and dispatching.',
  icons: {
    icon: '/trigo_icon.svg', // Path to your SVG icon in the public folder
    // You can also add other icon types if needed:
    // apple: '/apple-icon.png',
    // shortcut: '/shortcut-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
<<<<<<< HEAD
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <SettingsProvider>
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </SettingsProvider>
      </body>
    </html>
||||||| parent of 1c0fdf2 (latest-jun182025)
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SettingsProvider>
          {children}
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
=======
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
          <SettingsProvider>
            {children}
            <Toaster />
          </SettingsProvider>
        </body>
      </html>
    </ClerkProvider>
>>>>>>> 1c0fdf2 (latest-jun182025)
  );
}

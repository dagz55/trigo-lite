
import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from '@/contexts/SettingsContext';
import { UserProvider } from '@/contexts/UserContext';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TriGo Dispatch Lite',
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SettingsProvider>
          <UserProvider>
            {children}
            <Toaster />
          </UserProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}

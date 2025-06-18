import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ClerkProvider } from '@clerk/nextjs';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Metadata } from 'next';
import './globals.css';

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
  );
}

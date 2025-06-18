import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ClerkProvider } from '@clerk/nextjs';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Load Inter font as it's more commonly available
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'TriGo Dispatch Lite',
  description: 'Real-time trider monitoring and dispatching.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} antialiased font-sans`}>
          <SettingsProvider>
            {children}
            <Toaster />
          </SettingsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

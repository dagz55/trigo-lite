import { Toaster } from "@/components/ui/toaster";
import { SettingsProvider } from '@/contexts/SettingsContext';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Metadata } from 'next';
import './globals.css';

// Try to load Google Fonts with fallback
let geistSans: any;
let geistMono: any;

try {
  const { Geist, Geist_Mono } = require('next/font/google');
  
  geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
    display: 'swap',
    fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
  });

  geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
    display: 'swap',
    fallback: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
  });
} catch (error) {
  console.warn('Failed to load Google Fonts, using system fonts as fallback');
  // Fallback font configuration
  geistSans = {
    variable: '--font-geist-sans',
    className: '',
  };
  geistMono = {
    variable: '--font-geist-mono',
    className: '',
  };
}

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans?.variable || ''} ${geistMono?.variable || ''} antialiased font-sans`}>
        <SettingsProvider>
          {children}
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}

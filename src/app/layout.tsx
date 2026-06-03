import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';

import './globals.css';
import DevSessionCleanup from '@/components/DevSessionCleanup';

/**
 * Day 2 — Google Fonts
 * Body:    Inter        (clean, legible sans-serif for UI copy)
 * Display: Playfair Display (editorial serif for headings)
 *
 * Both loaded via next/font/google for automatic self-hosting
 * and zero layout shift (font-display: swap handled by Next.js).
 */
const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Elevanda Ventures — CHMS',
  description: 'Church management system for growing congregations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <DevSessionCleanup />
        {children}
      </body>
    </html>
  );
}

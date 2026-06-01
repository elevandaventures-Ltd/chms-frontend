import type { Metadata } from 'next';
import { IBM_Plex_Sans, Space_Grotesk } from 'next/font/google';

import './globals.css';
import DevSessionCleanup from '@/components/DevSessionCleanup';

// Keep the shared typography in one place so the app uses the same visual system everywhere.
const bodyFont = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600'],
});

const displayFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '700'],
});

// Metadata here defines the default document title and description for the whole app.
export const metadata: Metadata = {
  title: 'Elevanda Ventures',
  description: 'Next.js 14 frontend foundation for the Elevanda Ventures workspace.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
        <DevSessionCleanup />
        {children}
      </body>
    </html>
  );
}
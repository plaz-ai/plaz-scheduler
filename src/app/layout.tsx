import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#0A1628' },
    { media: '(prefers-color-scheme: light)', color: '#F5F2EC' },
  ],
};

export const metadata: Metadata = {
  title: 'Agenda tu cita | Plaz',
  description: 'Reserva una cita con el equipo de Plaz.',
  icons: {
    icon: [
      { url: '/plaz-scheduler/favicon.ico', sizes: 'any' },
      { url: '/plaz-scheduler/icon.svg',    type: 'image/svg+xml' },
    ],
    apple: '/plaz-scheduler/icon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} ${geistMono.variable} ${plusJakarta.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

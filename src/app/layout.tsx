import type { Metadata } from 'next';
import { Fraunces } from 'next/font/google';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Agenda tu cita | Plaz',
  description: 'Reserva una cita con nuestro equipo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${plusJakarta.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgilMsg - WhatsApp Tech Provider',
  description: 'Plataforma multi-tenant para WhatsApp Business API',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

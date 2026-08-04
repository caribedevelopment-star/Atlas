import 'leaflet/dist/leaflet.css';
import './globals.css';
import AppShell from '@/components/app-shell';

export const metadata = {
  title: 'Atlas — Cartografía Personal',
  description: 'Un espacio personal de exploración y recuerdos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full">
      <body className="bg-zinc-950 text-zinc-100 antialiased h-full overflow-x-hidden selection:bg-zinc-800">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}


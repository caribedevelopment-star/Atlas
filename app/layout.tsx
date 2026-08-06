import './globals.css';
import AppShell from '@/components/app-shell';
import { PwaRegister } from '@/components/pwa-register';

export const metadata = {
  title: 'Atlas — Cartografía Personal',
  description: 'Un espacio personal de exploración y recuerdos',
  manifest: '/manifest.webmanifest',
  themeColor: '#09090b',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Atlas' },
  icons: { icon: [{ url:'/icons/atlas.svg',type:'image/svg+xml' }], apple:'/images/avatar.png' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark h-full">
      <body className="bg-zinc-950 text-zinc-100 antialiased h-full overflow-x-hidden selection:bg-zinc-800">
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

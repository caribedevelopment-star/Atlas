// app/layout.tsx
import './globals.css';
import BottomNav from '@/components/bottom-nav';

export const metadata = {
  title: 'Atlas',
  description: 'Un espacio personal de exploración y recuerdos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-zinc-800 pb-28">
        <main className="min-h-screen">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

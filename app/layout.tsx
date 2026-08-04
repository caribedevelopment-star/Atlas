// app/layout.tsx
import './globals.css';
import 'leaflet/dist/leaflet.css'; // Importante para que Leaflet no salga en gris

export const metadata = {
  title: 'Atlas',
  description: 'A personal memory journal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-amber-500/30">
        {children}
      </body>
    </html>
  );
}
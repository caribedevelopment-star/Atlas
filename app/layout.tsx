import './globals.css';

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
      <body className="bg-zinc-950 text-zinc-100 min-h-screen antialiased selection:bg-zinc-800">
        {children}
      </body>
    </html>
  );
}


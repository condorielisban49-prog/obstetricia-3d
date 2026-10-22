import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0b1a2a',
};

export const metadata = {
  title: 'Obstetricia: Vínculo y Vida',
  description: 'Aventura educativa 3D de obstetricia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

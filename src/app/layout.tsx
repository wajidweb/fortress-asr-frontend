import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Fortress ASR Security Operations Management System',
  description: 'SOMS Enterprise Dashboard and Client Web Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}

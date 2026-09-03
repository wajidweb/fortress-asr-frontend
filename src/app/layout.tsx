import type { Metadata } from 'next';
import './globals.css';
import Toaster from '@/components/ui/Toaster';

// Premium SEO Optimization Metadata with zero dashes and logo.png mapped as favicon
export const metadata: Metadata = {
  metadataBase: new URL('https://app.frtressasrsecurity.co.uk'),
  title: {
    default: 'Fortress ASR Security | Elite Guarding Services',
    template: '%s | Fortress ASR Security',
  },
  description: 'Fortress ASR delivers professional security guarding services. We protect your commercial properties and corporate locations through geofence validated officer presence and uncompromised compliance audits.',
  keywords: [
    'Fortress ASR',
    'Private Security UK',
    'Licensed Security Guards',
    'Corporate Property Protection',
    'Geofenced Guard Tracking',
    'SIA Certified Officers'
  ],
  icons: {
    icon: '/logo.png', // Main favicon icon
    shortcut: '/logo.png',
    apple: '/logo.png', // Apple touch icon
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://app.frtressasrsecurity.co.uk',
    title: 'Fortress ASR Security Operations',
    description: 'Elite physical protection and SIA certified guarding services for corporate and commercial locations.',
    siteName: 'Fortress ASR',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'Fortress ASR Security Emblem',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fortress ASR Security Operations',
    description: 'Elite physical protection and SIA certified guarding services for corporate and commercial locations.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <Toaster />
        {children}
      </body>
    </html>
  );
}

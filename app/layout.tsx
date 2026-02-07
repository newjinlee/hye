import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'cometui_🌻',
  description: '졸업을 축하하며',
  keywords: ['타임라인', '졸업', '2019-2026', '혜승'],
  authors: [{ name: 'cometui' }],
  icons: {
    icon: '/sunflower.ico',
  },
  openGraph: {
    title: 'cometui_🌻',
    description: '졸업을 축하하며',
    images: [
      {
        url: '/images/background.jpg',
        width: 3360,
        height: 2240,
        alt: '혜승의 타임라인',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'cometui_🌻',
    description: '졸업을 축하하며',
    images: ['/images/background.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
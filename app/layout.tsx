import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'cometui_🌻',
  description: '졸업을 축하하며-혜승의 타임라인',
  icons: {
    icon: '/sunflower.ico',
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
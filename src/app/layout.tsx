import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DeFinite1 - DeFi Treasury Dashboard',
  description: 'Non-custodial multi-chain treasury management for DAOs and power users',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
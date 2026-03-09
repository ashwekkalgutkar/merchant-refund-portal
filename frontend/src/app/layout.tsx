import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import NetworkLoader from '@/components/NetworkLoader';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'APOGEE Pay | Merchant Hub',
  description: 'Premium merchant transaction & refund management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body suppressHydrationWarning className={`${outfit.className} bg-[#09090b] text-zinc-100 min-h-screen antialiased selection:bg-brand-500/30 selection:text-brand-100`}>
        <NetworkLoader />
        {/* Abstract Ambient Gradients */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute -top-[40%] -left-[20%] w-[70vw] h-[70vw] rounded-full bg-brand-900/20 blur-[120px]" />
          <div className="absolute top-[60%] -right-[20%] w-[60vw] h-[60vw] rounded-full bg-zinc-800/20 blur-[100px]" />
        </div>
        
        {children}
        
        <Toaster 
          position="top-center" 
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid #27272a',
            },
            className: 'glass-panel text-sm font-medium tracking-wide shadow-2xl rounded-xl',
          }} 
        />
      </body>
    </html>
  );
}

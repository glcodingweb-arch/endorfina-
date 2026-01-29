import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { CartProvider } from '@/contexts/cart-context';
import { Toaster } from '@/components/ui/toaster';
import { WhatsappButton } from '@/components/whatsapp-button';
import { FirebaseProvider } from '@/firebase/provider';
import { Suspense } from 'react';
import { AppLayout } from '@/components/layout/app-layout';
import type { Metadata } from 'next';

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Endorfina Esportes',
  description: 'Sua plataforma de corridas. Encontre eventos, inscreva-se e supere seus limites.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="pt-BR" className="scroll-smooth h-full">
      <body
        className={cn(
          'min-h-screen bg-white font-sans antialiased',
          inter.variable
        )}
      >
        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
          <FirebaseProvider>
              <CartProvider>
                <AppLayout>
                  {children}
                </AppLayout>
                <Toaster />
                <WhatsappButton />
              </CartProvider>
          </FirebaseProvider>
        </Suspense>
      </body>
    </html>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';
import { Header } from './header';
import { ScrollRestoration } from './scroll-restoration';
import { CookieConsentBanner } from '../cookie-consent-banner';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noLayoutRoutes = ['/login', '/register', '/admin', '/delivery', '/staff'];
  const isDashboard = pathname.startsWith('/dashboard');
  const isAdminDashboard = pathname.startsWith('/admin');
  const showLayout = !noLayoutRoutes.some(route => pathname.startsWith(route)) && !isDashboard;
  const showCookieBanner = pathname !== '/privacy';
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      const bgMesh = document.querySelector('.bg-mesh');
      if (bgMesh instanceof HTMLElement) {
        bgMesh.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(107, 70, 193, 0.2) 0%, transparent 50%)`;
      }
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
}, []);


  return (
    <>
      <div className="bg-mesh"></div>
      <ScrollRestoration />
      {showLayout && <Header />}
      <main className={cn(!showLayout && 'h-full')}>{children}</main>
      {showLayout && <Footer />}
      {showCookieBanner && <CookieConsentBanner />}
    </>
  );
}

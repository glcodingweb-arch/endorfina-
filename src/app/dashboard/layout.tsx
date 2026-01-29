'use client';

import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Loader2 } from 'lucide-react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!auth) {
        // This can happen on initial render. The provider will re-render this component.
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email === 'adm@gmail.com') {
          router.replace('/admin');
        } else if (user.email === 'entregador@gmail.com') {
          router.replace('/delivery');
        } else if (user.email === 'staff@gmail.com') {
          router.replace('/staff');
        } else {
          // Regular user, allow access
          setIsAllowed(true);
          setVerifying(false);
        }
      } else {
        // No user, redirect to login
        router.replace('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (verifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAllowed) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <Sidebar />
        <div className="flex flex-1 flex-col md:ml-64">
            <DashboardHeader />
            <main className="flex-1 p-4 sm:p-8">
              {children}
            </main>
        </div>
      </div>
    );
  }

  // Render nothing while redirecting
  return null;
}

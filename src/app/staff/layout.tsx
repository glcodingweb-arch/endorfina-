
'use client';

import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, LogOut, PackageCheck } from 'lucide-react';
import { onAuthStateChanged, type User, signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (!auth) {
        setVerifying(false);
        return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === 'staff@gmail.com') {
        setUser(user);
      } else {
        router.push('/login');
      }
      setVerifying(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  if (verifying) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen flex-col bg-muted/40">
        <header className="sticky top-0 z-40 border-b bg-background">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/staff" className="flex items-center gap-4">
                    <PackageCheck className="h-6 w-6 text-primary" />
                    <h1 className="text-lg font-bold">Painel de Staff</h1>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </header>
        <main className="flex-1 p-4 sm:p-8">
          {children}
        </main>
      </div>
    );
  }

  return null;
}

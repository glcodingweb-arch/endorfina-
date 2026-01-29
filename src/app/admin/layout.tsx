
'use client';

import AdminLayout from "@/components/admin/AdminLayout";
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [verifying, setVerifying] = useState(true);

    useEffect(() => {
        if (!auth) {
            // Auth service is not yet available, wait.
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user && user.email === 'adm@gmail.com') {
                setIsAuthorized(true);
            } else {
                // User is not an admin or is not logged in, redirect to login
                router.replace('/login');
            }
            setVerifying(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [auth, router]);

    if (verifying) {
        return (
            <div className="flex h-screen items-center justify-center bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (isAuthorized) {
        return <AdminLayout>{children}</AdminLayout>;
    }

    // Render nothing while redirecting or if not authorized
    return null;
}

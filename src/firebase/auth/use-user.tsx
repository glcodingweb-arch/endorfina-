'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useAuth } from '@/firebase/provider';

interface UseUserResult {
    user: User | null;
    loading: boolean;
}

export function useUser(): UseUserResult {
    const auth = useAuth();
    const [user, setUser] = useState<User | null>(auth?.currentUser || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                setUser(user);
                setLoading(false);
            },
            (error) => {
                console.error('Auth state change error:', error);
                setUser(null);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [auth]);

    return { user, loading };
}

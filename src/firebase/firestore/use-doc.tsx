'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, DocumentReference, DocumentData, DocumentSnapshot } from 'firebase/firestore';

interface UseDocResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export function useDoc<T extends DocumentData>(ref: DocumentReference<T> | null): UseDocResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!ref) {
            setLoading(false);
            return;
        }

        setLoading(true);

        const unsubscribe = onSnapshot(ref,
            (snapshot: DocumentSnapshot<T>) => {
                if (snapshot.exists()) {
                    setData({ ...snapshot.data(), id: snapshot.id });
                } else {
                    setData(null);
                }
                setLoading(false);
            },
            (err: Error) => {
                console.error("Error fetching document: ", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [ref]);

    return { data, loading, error };
}

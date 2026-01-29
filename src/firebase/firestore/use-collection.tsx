'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, Query, DocumentData, QuerySnapshot } from 'firebase/firestore';
import type { Race } from '@/lib/types';

interface UseCollectionResult<T> {
    data: T[] | null;
    loading: boolean;
    error: Error | null;
}

export function useCollection<T extends DocumentData>(query: Query<T> | null): UseCollectionResult<T> {
    const [data, setData] = useState<T[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!query) {
            // When query is not yet available (e.g., firestore is initializing),
            // we should be in a loading state and ensure no stale data is shown.
            setLoading(true);
            setData(null);
            return;
        }

        const unsubscribe = onSnapshot(query, 
            (snapshot: QuerySnapshot<T>) => {
                const result: T[] = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                setData(result);
                setError(null); // Clear previous errors on new data
                setLoading(false);
            }, 
            (err: Error) => {
                console.error("Error fetching collection: ", err);
                setError(err);
                setData(null); // Clear data on error
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [query]);

    return { data, loading, error };
}

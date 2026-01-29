'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserTable } from '@/components/admin/user-table';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Skeleton } from '@/components/ui/skeleton';


export default function AdminUsersPage() {
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'));
  }, [firestore]);

  const { data: users, loading } = useCollection<UserProfile>(usersQuery);

  return (
    <>
      <Card>
          <CardHeader>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>
                  Gerencie os usuários da plataforma.
              </CardDescription>
          </CardHeader>
          <CardContent>
              {loading && (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}
              {!loading && users && <UserTable users={users} />}
          </CardContent>
      </Card>
    </>
  );
}

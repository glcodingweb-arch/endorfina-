
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc, writeBatch } from 'firebase/firestore';
import type { Notification } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

function timeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " anos atrás";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " meses atrás";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d atrás";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h atrás";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m atrás";
    return Math.floor(seconds) + "s atrás";
}

export default function AdminNotificationsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const notificationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'notifications'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: notifications, loading } = useCollection<Notification>(notificationsQuery);

    const toggleRead = async (id: string, currentStatus: boolean) => {
        if (!firestore) return;
        const notifRef = doc(firestore, 'notifications', id);
        try {
            await updateDoc(notifRef, { read: !currentStatus });
        } catch (error) {
            console.error("Erro ao atualizar notificação: ", error);
            toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
        }
    }
    
    const markAllAsRead = async () => {
        if (!firestore || !notifications) return;
        
        const unreadNotifications = notifications.filter(n => !n.read);
        if (unreadNotifications.length === 0) {
            toast({ title: 'Nenhuma notificação nova para marcar.' });
            return;
        }

        const batch = writeBatch(firestore);
        unreadNotifications.forEach(notif => {
            const notifRef = doc(firestore, 'notifications', notif.id);
            batch.update(notifRef, { read: true });
        });

        try {
            await batch.commit();
            toast({ title: 'Todas as notificações foram marcadas como lidas.' });
        } catch (error) {
             console.error("Erro ao marcar todas como lidas: ", error);
             toast({ title: 'Erro ao marcar notificações', variant: 'destructive' });
        }
    }


  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>Veja todas as atividades recentes da plataforma.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={loading}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {loading && Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg border">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                           <Skeleton className="h-4 w-1/3" />
                           <Skeleton className="h-4 w-2/3" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
                {!loading && notifications?.map((notification) => (
                    <div 
                        key={notification.id}
                        className={cn(
                            "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                            notification.read ? 'bg-background' : 'bg-muted/50 hover:bg-muted/80'
                        )}
                    >
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", notification.read ? 'bg-muted' : 'bg-primary')}>
                            <Bell className={cn("h-4 w-4", notification.read ? 'text-muted-foreground' : 'text-primary-foreground')} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">{notification.title}</p>
                            <p className="text-sm text-muted-foreground">{notification.description}</p>
                        </div>
                        <div className="text-xs text-muted-foreground self-center">
                            {notification.createdAt ? timeAgo(notification.createdAt.toDate()) : '...'}
                        </div>
                        
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Marcar como lida" onClick={() => toggleRead(notification.id, notification.read)}>
                            <Check className={cn("h-4 w-4", notification.read && "text-primary")} />
                        </Button>
                    </div>
                ))}
            </div>
             {!loading && (!notifications || notifications.length === 0) && (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Nenhuma notificação por aqui</h3>
                    <p className="text-muted-foreground mt-2">Quando algo acontecer na plataforma, você verá aqui.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </>
  );
}

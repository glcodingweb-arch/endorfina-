'use client';

import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Order, Race } from '@/lib/types';
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Truck, CheckCircle, Package } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function DeliveryDashboardPage() {
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), where('deliveryMethod', '==', 'home'));
    }, [firestore]);

    const { data: orders, loading: loadingOrders } = useCollection<Order>(ordersQuery);
    
    const raceIds = useMemo(() => {
        if (!orders) return [];
        return [...new Set(orders.map(o => o.raceId).filter(Boolean))];
    }, [orders]);
    
    const racesQuery = useMemoFirebase(() => {
        if (!firestore || raceIds.length === 0) return null;
        return query(collection(firestore, 'races'), where('__name__', 'in', raceIds));
    }, [firestore, raceIds]);

    const { data: races, loading: loadingRaces } = useCollection<Race>(racesQuery);
    
    const eventsWithStats = useMemo(() => {
        if (!orders || !races) return [];
        
        const racesMap = new Map(races.map(r => [r.id, r]));

        const statsByEvent = orders.reduce((acc, order) => {
            const raceId = order.raceId;
            if (!raceId || !racesMap.has(raceId)) return acc;
            
            if (!acc[raceId]) {
                acc[raceId] = { total: 0, delivered: 0 };
            }

            acc[raceId].total++;
            if (order.kitDeliveryStatus === 'Entregue') {
                acc[raceId].delivered++;
            }
            
            return acc;
        }, {} as Record<string, { total: number; delivered: number }>);

        return Object.entries(statsByEvent).map(([raceId, stats]) => {
            return {
                race: racesMap.get(raceId)!,
                ...stats
            };
        }).filter(item => item.race);

    }, [orders, races]);

    const loading = loadingOrders || loadingRaces;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Eventos com Entrega</h1>
                <p className="text-muted-foreground">Selecione um evento para gerenciar as entregas de kits.</p>
            </header>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                    <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
            )}
            
            {!loading && eventsWithStats.length === 0 && (
                 <Card>
                    <CardContent className="text-center py-16">
                        <h3 className="text-xl font-semibold">Nenhum evento com entrega</h3>
                        <p className="text-muted-foreground mt-2">Não há eventos com pedidos de entrega em domicílio no momento.</p>
                    </CardContent>
                 </Card>
            )}

            {!loading && eventsWithStats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {eventsWithStats.map(({ race, total, delivered }) => {
                        const progress = total > 0 ? (delivered / total) * 100 : 0;
                        return (
                            <Card key={race.id}>
                                <CardHeader>
                                    <CardTitle>{race.name}</CardTitle>
                                    <CardDescription>{new Date(race.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground"><Package className="w-4 h-4"/> Pedidos Totais:</div>
                                        <span className="font-bold">{total}</span>
                                    </div>
                                     <div className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2 text-green-600"><CheckCircle className="w-4 h-4"/> Entregues:</div>
                                        <span className="font-bold">{delivered}</span>
                                    </div>
                                    <div>
                                        <Progress value={progress} className="h-2" />
                                        <p className="text-xs text-muted-foreground text-right mt-1">{progress.toFixed(0)}% concluído</p>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild className="w-full">
                                        <Link href={`/delivery/${race.id}`}>
                                            <Truck className="mr-2 h-4 w-4"/> Gerenciar Entregas
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}

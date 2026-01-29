'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Users,
  Activity,
  ShoppingCart,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import type { Order, Participant, AbandonedCart } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboardPage: React.FC = () => {
    const firestore = useFirestore();

    // Data queries
    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return query(
            collection(firestore, 'orders'),
            where('orderDate', '>=', startOfMonth)
        );
    }, [firestore]);

    const participantsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'participants') : null, [firestore]);
    const abandonedCartsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'abandonedCarts') : null, [firestore]);

    const { data: monthlyOrders, loading: loadingOrders } = useCollection<Order>(ordersQuery);
    const { data: participants, loading: loadingParticipants } = useCollection<Participant>(participantsQuery);
    const { data: abandonedCarts, loading: loadingCarts } = useCollection<AbandonedCart>(abandonedCartsQuery);

    const stats = useMemo(() => {
        const monthlyRevenue = monthlyOrders?.reduce((acc, order) => acc + order.totalAmount, 0) ?? 0;
        const activeRegistrations = participants?.length ?? 0;
        const cartsToRecover = abandonedCarts?.length ?? 0;
        const totalOpportunities = activeRegistrations + cartsToRecover;
        const conversionRate = totalOpportunities > 0 ? (activeRegistrations / totalOpportunities) * 100 : 0;
        
        return {
            monthlyRevenue: monthlyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            activeRegistrations: activeRegistrations.toString(),
            cartsToRecover: cartsToRecover.toString(),
            conversionRate: `${conversionRate.toFixed(1)}%`,
        };
    }, [monthlyOrders, participants, abandonedCarts]);
    
    const loading = loadingOrders || loadingParticipants || loadingCarts;

    const statsCards = [
      { label: 'Faturamento Mensal', value: stats.monthlyRevenue, trend: '+12.4%', Icon: TrendingUp, loading: loadingOrders },
      { label: 'Inscrições Ativas', value: stats.activeRegistrations, trend: '+5.2%', Icon: Users, loading: loadingParticipants },
      { label: 'Taxa de Conversão', value: stats.conversionRate, trend: '+1.5%', Icon: Activity, loading: loadingParticipants || loadingCarts },
      { label: 'Carrinhos p/ Recuperar', value: stats.cartsToRecover, Icon: ShoppingCart, loading: loadingCarts },
    ];


  return (
    <motion.div 
        className="space-y-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter uppercase">Painel <span className="text-primary">Geral</span></h1>
        <p className="text-muted-foreground font-bold mt-2">Visão consolidada da sua organização hoje.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsCards.map((s: any, i: number) => (
          <div key={i} className="bg-card border p-8 rounded-[2.5rem] hover:border-primary/30 transition-all group">
             <s.Icon className="h-6 w-6 text-muted-foreground mb-4 transition-colors group-hover:text-primary" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
            <div className="flex flex-col">
                {s.loading ? (
                    <Skeleton className="h-8 w-3/4 mt-1" />
                ) : (
                    <h4 className="text-2xl font-black">{s.value}</h4>
                )}
                {!s.loading && s.trend && (
                    <span className={cn('text-[10px] font-black mt-1', s.trend.startsWith('+') ? 'text-green-500' : 'text-red-500')}>{s.trend}</span>
                )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default AdminDashboardPage;

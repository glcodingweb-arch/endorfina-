'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Send, ShoppingCart, Activity, RefreshCw, Search, MailWarning, Loader2, Trash2 } from 'lucide-react';
import { StatsCard } from '@/components/stats-card';
import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, doc, deleteDoc } from 'firebase/firestore';
import type { AbandonedCart } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const timeAgo = (date: any) => {
    if (!date) return 'N/A';
    let d: Date;

    // Handle Firestore Timestamp, serialized object, or ISO string
    if (typeof date.toDate === 'function') {
        d = date.toDate();
    } else if (date.seconds) {
        d = new Date(date.seconds * 1000);
    } else {
        d = new Date(date);
    }

    if (isNaN(d.getTime())) return 'Data inválida';

    return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
};

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    'ABANDONED': { label: 'Abandonado', variant: 'outline' },
    'ACTIVE': { label: 'Ativo', variant: 'secondary' },
    'CONVERTED': { label: 'Convertido', variant: 'default' },
};

export default function AbandonedCartsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSendingAll, setIsSendingAll] = useState(false);
    const [cartToDelete, setCartToDelete] = useState<AbandonedCart | null>(null);

    const cartsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'abandonedCarts'));
    }, [firestore]);

    const { data: unsortedCarts, loading } = useCollection<AbandonedCart>(cartsQuery);

    const carts = useMemo(() => {
        if (!unsortedCarts) return [];
        return [...unsortedCarts].sort((a, b) => {
            const toDate = (val: any) => {
                if (!val) return new Date(0);
                if (typeof val.toDate === 'function') return val.toDate(); // Firestore Timestamp
                if (val.seconds) return new Date(val.seconds * 1000);     // Serialized Timestamp
                if (typeof val === 'string') return new Date(val);       // ISO String
                return new Date(0); // Fallback
            };
            const dateA = toDate(a.lastActivityAt);
            const dateB = toDate(b.lastActivityAt);
            return dateB.getTime() - dateA.getTime();
        });
    }, [unsortedCarts]);


    const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'CONVERTED'>('PENDING');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCarts = useMemo(() => {
        if (!carts) return [];
        return carts.filter(cart => {
            if (cart.status === 'ARCHIVED') return false; // Explicitly exclude archived carts

            let matchesStatus = false;
            if (statusFilter === 'all') {
                matchesStatus = true;
            } else if (statusFilter === 'PENDING') {
                matchesStatus = (cart.status === 'ABANDONED' || cart.status === 'ACTIVE');
            } else { // Handles 'CONVERTED'
                matchesStatus = cart.status === statusFilter;
            }

            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                cart.customerEmail.toLowerCase().includes(searchLower) ||
                (cart.customerName && cart.customerName.toLowerCase().includes(searchLower)) ||
                cart.items.some(item => item.raceName.toLowerCase().includes(searchLower));
            return matchesStatus && matchesSearch;
        });
    }, [carts, statusFilter, searchTerm]);

    const stats = useMemo(() => {
        if (!carts) return { totalAbandonedValue: 0, abandonedCount: 0, recoveryRate: 0 };
        
        const pending = carts.filter(c => c.status === 'ABANDONED' || c.status === 'ACTIVE');
        const converted = carts.filter(c => c.status === 'CONVERTED');
        
        const totalAbandonedValue = pending.reduce((sum, cart) => sum + cart.totalAmount, 0);
        
        const totalForRate = pending.length + converted.length;
        const recoveryRate = totalForRate > 0 
            ? (converted.length / totalForRate) * 100 
            : 0;

        return {
            totalAbandonedValue,
            abandonedCount: pending.length,
            recoveryRate
        }
    }, [carts]);

    const handleSendRecoveryEmail = async (cart: AbandonedCart) => {
        if (cart.items.length === 0) {
            toast({ variant: 'destructive', title: "Carrinho vazio", description: "Não é possível enviar e-mail para um carrinho vazio."});
            return;
        }

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: cart.customerEmail,
                    type: 'abandonedCart',
                    data: {
                        customerName: cart.customerName || 'Atleta',
                        raceName: cart.items.length > 1 ? 'múltiplos eventos' : cart.items[0].raceName,
                        checkoutUrl: `${window.location.origin}/cart`
                    }
                }),
            });

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || 'Failed to send email');
            }
            
            toast({
                title: "E-mail de recuperação enviado!",
                description: `Um e-mail foi enviado para ${cart.customerEmail}.`
            });

        } catch (error: any) {
            console.error("Error sending recovery email:", error);
            toast({
                variant: 'destructive',
                title: "Erro ao enviar e-mail",
                description: error.message
            });
        }
    };
    
    const handleSendToAllPending = async () => {
        if (!carts) {
            toast({ variant: 'destructive', title: 'Nenhum carrinho para processar.' });
            return;
        }

        const pendingCarts = carts.filter(cart => (cart.status === 'ACTIVE' || cart.status === 'ABANDONED') && cart.items.length > 0);

        if (pendingCarts.length === 0) {
            toast({ title: 'Nenhum carrinho pendente para notificar.' });
            return;
        }

        setIsSendingAll(true);
        toast({
            title: 'Iniciando envio em massa...',
            description: `Enviando lembretes para ${pendingCarts.length} carrinhos.`,
        });

        const results = await Promise.allSettled(
            pendingCarts.map(cart => {
                return fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: cart.customerEmail,
                        type: 'abandonedCart',
                        data: {
                            customerName: cart.customerName || 'Atleta',
                            raceName: cart.items.length > 1 ? 'múltiplos eventos' : cart.items[0].raceName,
                            checkoutUrl: `${window.location.origin}/cart`
                        }
                    }),
                }).then(response => {
                    if (!response.ok) {
                        return response.json().then(err => Promise.reject(err));
                    }
                    return response.json();
                });
            })
        );

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        toast({
            title: 'Envio em massa concluído!',
            description: `${successful} e-mails enviados com sucesso. ${failed > 0 ? `${failed} falharam.` : ''}`,
        });

        setIsSendingAll(false);
    };
    
    const handleDelete = async () => {
        if (!cartToDelete || !firestore) return;
        try {
          await deleteDoc(doc(firestore, 'abandonedCarts', cartToDelete.id));
          toast({
              title: 'Carrinho Excluído!',
              description: `O carrinho de ${cartToDelete.customerEmail} foi removido permanentemente.`,
          });
        } catch (error) {
          console.error(error);
          toast({ title: "Erro ao excluir", variant: "destructive" });
        }
        setCartToDelete(null);
    }


  return (
    <>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            title="Receita Abandonada"
            value={formatCurrency(stats.totalAbandonedValue)}
            icon={ShoppingCart}
            description="Valor potencial a ser recuperado"
          />
           <StatsCard 
            title="Carrinhos Pendentes"
            value={stats.abandonedCount.toString()}
            icon={Activity}
            description="Total de carrinhos não convertidos"
          />
           <StatsCard 
            title="Taxa de Recuperação"
            value={`${stats.recoveryRate.toFixed(1)}%`}
            icon={RefreshCw}
            description="Carrinhos convertidos após abandono"
          />
       </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Carrinhos Abandonados</CardTitle>
            <CardDescription>Visualize e gerencie as inscrições não finalizadas.</CardDescription>
          </div>
           <Button onClick={handleSendToAllPending} disabled={isSendingAll || loading}>
            {isSendingAll ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MailWarning className="mr-2 h-4 w-4" />}
            Lembrar Pendentes
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Buscar por nome, email ou evento..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="PENDING">Pendentes</TabsTrigger>
                    <TabsTrigger value="CONVERTED">Convertidos</TabsTrigger>
                </TabsList>
                </Tabs>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atividade</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-10 w-full" /></TableCell>
                </TableRow>
              ))}
              {!loading && filteredCarts.map((cart) => (
                <TableRow key={cart.id}>
                  <TableCell>
                      <div className="font-medium">{cart.customerName || 'Convidado'}</div>
                      <div className="text-xs text-muted-foreground">{cart.customerEmail}</div>
                  </TableCell>
                  <TableCell>
                    {cart.items.map(item => (
                        <div key={item.raceId + item.option.distance} className="text-xs">
                           {item.quantity}x {item.raceName} ({item.option.distance})
                        </div>
                    ))}
                  </TableCell>
                  <TableCell>
                      <Badge variant={statusConfig[cart.status]?.variant ?? 'secondary'}>
                          {statusConfig[cart.status]?.label ?? cart.status}
                      </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{timeAgo(cart.lastActivityAt)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(cart.totalAmount)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendRecoveryEmail(cart)} disabled={cart.status === 'CONVERTED'}>
                           <Send className="mr-2 h-4 w-4" /> Enviar Lembrete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setCartToDelete(cart)} className="text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {!loading && (!filteredCarts || filteredCarts.length === 0) && (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Nenhum carrinho encontrado para os filtros selecionados.
                    </TableCell>
                </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AlertDialog open={!!cartToDelete} onOpenChange={(open) => !open && setCartToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                   Esta ação não pode ser desfeita. Isso excluirá permanentemente o carrinho de <strong className="font-medium">{cartToDelete?.customerEmail}</strong>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Excluir Permanentemente
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

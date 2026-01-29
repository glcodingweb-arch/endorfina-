
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus } from 'lucide-react';
import Link from 'next/link';
import type { Coupon } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { addDoc, collection, deleteDoc, doc, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminCouponsPage() {
    const firestore = useFirestore();
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

    const couponsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return query(collection(firestore, 'coupons'));
    }, [firestore]);

    const { data: coupons, loading } = useCollection<Coupon>(couponsQuery);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const handleDuplicate = async (couponToDuplicate: Coupon) => {
      if (!firestore) return;
      
      const { id, createdAt, ...couponData } = couponToDuplicate;

      try {
        await addDoc(collection(firestore, 'coupons'), {
          ...couponData,
          code: `${couponData.code}-COPY`,
          title: `${couponData.title} (Cópia)`,
          isActive: false,
          currentUses: 0,
          createdAt: serverTimestamp(),
        });

        toast({
          title: 'Cupom Duplicado!',
          description: `O cupom "${couponToDuplicate.title} (Cópia)" foi criado como um rascunho.`,
        });
      } catch (error) {
        console.error(error);
        toast({ title: "Erro ao duplicar", variant: "destructive" });
      }
    };

    const handleDelete = async () => {
        if (!couponToDelete || !firestore) return;
        try {
          await deleteDoc(doc(firestore, 'coupons', couponToDelete.id));
          toast({
              title: 'Cupom Excluído!',
              description: `O cupom "${couponToDelete.title}" foi removido.`,
          });
        } catch (error) {
          console.error(error);
          toast({ title: "Erro ao excluir", variant: "destructive" });
        }
        setCouponToDelete(null);
    }

    const toggleCouponStatus = async (coupon: Coupon) => {
        if (!firestore) return;

        try {
          const couponRef = doc(firestore, 'coupons', coupon.id);
          await updateDoc(couponRef, { isActive: !coupon.isActive });
          toast({
              title: `Cupom ${!coupon.isActive ? 'Ativado' : 'Desativado'}`,
              description: `O cupom "${coupon.title}" foi atualizado.`,
          });
        } catch (error) {
           console.error(error);
           toast({ title: "Erro ao atualizar status", variant: "destructive" });
        }
    };
  
    const formatValue = (coupon: Coupon) => {
      return coupon.discountType === 'percentage'
        ? `${coupon.discountValue}%`
        : `R$ ${coupon.discountValue.toFixed(2)}`;
    };

    const formatDate = (date: any) => {
        if (!isClient || !date) return 'Sem validade';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('pt-BR');
    }

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Gestão de Cupons</CardTitle>
            <CardDescription>Crie e gerencie os cupons de desconto da plataforma.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/coupons/create">
              <Plus className="mr-2 h-4 w-4" />
              Criar Cupom
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && Array.from({length: 3}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}><Skeleton className="h-8 w-full" /></TableCell>
                </TableRow>
              ))}
              {!loading && coupons?.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{coupon.code}</Badge>
                  </TableCell>
                  <TableCell>{formatValue(coupon)}</TableCell>
                  <TableCell>{`${coupon.currentUses}/${coupon.maxUses ?? '∞'}`}</TableCell>
                  <TableCell>{isClient ? `${formatDate(coupon.startDate)} - ${formatDate(coupon.endDate)}` : '...'}</TableCell>
                  <TableCell>
                     <Switch
                        checked={coupon.isActive}
                        onCheckedChange={() => toggleCouponStatus(coupon)}
                        aria-label={`Ativar ou desativar o cupom ${coupon.title}`}
                     />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/coupons/edit/${coupon.id}`)}>
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(coupon)}>Duplicar</DropdownMenuItem>
                        <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setCouponToDelete(coupon)}
                        >
                            Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
               {!loading && (!coupons || coupons.length === 0) && (
                 <TableRow>
                   <TableCell colSpan={7} className="text-center py-10">
                     Nenhum cupom encontrado.
                   </TableCell>
                 </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
     <AlertDialog open={!!couponToDelete} onOpenChange={(open) => !open && setCouponToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o cupom
                    e removerá seus dados de nossos servidores.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

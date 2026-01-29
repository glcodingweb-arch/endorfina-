
'use client';

import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Combo } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CombosPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const combosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'combos'), where('active', '==', true));
  }, [firestore]);

  const { data: combos, loading } = useCollection<Combo>(combosQuery);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);


  return (
    <>
      <Header />
      <div className="container py-24 sm:py-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            COMBOS <span className="text-primary">ESPECIAIS</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Pacotes exclusivos para você que busca múltiplos desafios. Mais performance, mais economia.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[350px] w-full rounded-[2.5rem]" />
            ))}
          </div>
        )}

        {!loading && combos && combos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {combos.map((combo) => (
              <Card key={combo.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:shadow-purple-100/50 transition-all flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{combo.name}</CardTitle>
                  <CardDescription>{combo.description || 'Um pacote de desafios para você.'}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Este combo inclui:</p>
                    <ul className="mt-2 space-y-1">
                      {combo.items.map((item, index) => (
                        <li key={index} className="text-xs font-bold text-slate-600">
                          - {item.quantity}x Inscrição para {item.modality}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="p-6 bg-slate-50/50 border-t border-slate-100 flex-col items-start gap-4">
                    <div className="w-full flex justify-between items-end">
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Combo</p>
                          <p className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(combo.price)}</p>
                       </div>
                    </div>
                    <Button className="w-full py-5 h-auto text-xs font-black uppercase tracking-widest rounded-2xl group-hover:bg-slate-900 transition-colors">
                        Adicionar ao Carrinho <ShoppingBag className="ml-2 w-4 h-4" />
                    </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        {!loading && (!combos || combos.length === 0) && (
            <div className="text-center py-24 border-2 border-dashed rounded-[2rem]">
                <h3 className="text-2xl font-bold tracking-tight">Nenhum combo disponível</h3>
                <p className="text-muted-foreground mt-2">Fique de olho! Novas ofertas especiais em breve.</p>
            </div>
        )}
      </div>
    </>
  );
}

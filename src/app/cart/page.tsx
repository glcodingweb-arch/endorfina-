'use client';

import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { EmptyCartIllustration } from '@/components/cart/empty-cart-illustration';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, totalPrice, totalItems, bonusApplied, freeItem } = useCart();
  const router = useRouter();
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (totalItems === 0) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-24 text-center flex flex-col items-center">
          <EmptyCartIllustration />
          <h1 className="mt-8 text-4xl font-black text-slate-900 tracking-tighter">Seu carrinho está vazio</h1>
          <p className="mt-2 text-lg text-muted-foreground max-w-md">Parece que você ainda não adicionou nenhuma corrida.</p>
          <Button onClick={() => router.push('/races')} className="mt-8 py-5 h-auto text-xs font-black uppercase tracking-widest rounded-2xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Explorar Corridas
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-slate-50 min-h-screen">
        <div className="container mx-auto px-4 py-32">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-10">Meu Carrinho</h1>
            <div className="space-y-6">
              {cart.map(item => {
                const raceImage = item.raceImage?.startsWith('http') ? item.raceImage : PlaceHolderImages.find(p => p.id === item.raceImage)?.imageUrl || `https://picsum.photos/seed/${item.raceId}/128/128`;
                const isFree = freeItem?.raceId === item.raceId && freeItem?.option.distance === item.option.distance;

                return (
                  <div key={item.raceId + item.option.distance} className="flex flex-col sm:flex-row items-center gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <Image src={raceImage} alt={item.raceName} width={128} height={128} className="rounded-2xl w-full sm:w-32 h-32 object-cover" />
                    <div className="flex-1 text-center sm:text-left">
                      <p className="font-bold text-lg text-slate-900">{item.raceName}</p>
                      <p className="text-sm text-muted-foreground">{item.option.distance}</p>
                      <p className="text-sm font-bold text-primary">{formatCurrency(item.option.lots[0].price)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <Button type="button" onClick={() => updateQuantity(item.option.distance, item.quantity - 1)} variant="outline" size="icon" className="w-10 h-10 rounded-xl"><Minus className="w-4 h-4"/></Button>
                       <span className="font-black text-lg text-slate-900 w-8 text-center">{item.quantity}</span>
                       <Button type="button" onClick={() => updateQuantity(item.option.distance, item.quantity + 1)} variant="outline" size="icon" className="w-10 h-10 rounded-xl"><Plus className="w-4 h-4"/></Button>
                    </div>
                     <div className="font-bold text-lg text-slate-900 w-28 text-center">
                        {formatCurrency(item.option.lots[0].price * item.quantity)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.option.distance)} className="text-slate-400 hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                )
              })}
            </div>

            {bonusApplied && (
                 <div className="mt-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-center text-sm font-semibold">
                    🎉 Parabéns! Você ganhou uma inscrição de cortesia na promoção 10+1. O item de menor valor é por nossa conta!
                </div>
            )}

            <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6">
                <Button variant="link" asChild className="text-primary font-bold">
                  <Link href="/races">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Continuar Comprando
                  </Link>
                </Button>
                <div className="w-full max-w-sm bg-white p-8 rounded-3xl border border-slate-200 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-muted-foreground font-semibold">Subtotal ({totalItems} itens)</span>
                        <span className="font-bold text-slate-900">{formatCurrency(subtotal)}</span>
                    </div>
                     {bonusApplied && freeItem && (
                         <div className="flex justify-between items-center mb-4 text-emerald-600">
                             <span className="font-semibold">Bônus 10+1</span>
                             <span className="font-bold">- {formatCurrency(freeItem.option.lots[0].price)}</span>
                         </div>
                     )}
                    <div className="border-t border-slate-100 my-4"></div>
                    <div className="flex justify-between items-center font-black text-xl mb-6">
                        <span>Total</span>
                        <span className="text-primary">{formatCurrency(totalPrice)}</span>
                    </div>
                    <Button onClick={() => router.push('/checkout')} className="w-full py-5 h-auto text-xs font-black uppercase tracking-widest rounded-2xl">
                      Finalizar Compra <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

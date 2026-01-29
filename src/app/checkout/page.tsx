
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, CreditCard, Loader2, QrCode, Shield, TicketPercent, CheckCircle, Package, Home, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';
import { CardPaymentForm, type PayerData } from '@/components/checkout/mercado-pago/card-payment-form';
import { PixPaymentDisplay } from '@/components/checkout/mercado-pago/pix-payment-display';
import { initMercadoPago } from '@mercadopago/sdk-react';
import { mercadopagoConfig } from '@/lib/mercadopago-config';
import { createOrderAndSubscriptions } from '@/actions/order';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, doc, setDoc, updateDoc, serverTimestamp, writeBatch, limit, getDoc } from 'firebase/firestore';
import type { Coupon, Race } from '@/lib/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Checkbox } from '@/components/ui/checkbox';


type CheckoutStep = 'identification' | 'delivery' | 'payment' | 'confirmation';
type PaymentMethod = 'credit' | 'pix';

// Inicializa o SDK do Mercado Pago
initMercadoPago(mercadopagoConfig.publicKey, { locale: 'pt-BR' });

const ConfirmationStep = ({ confirmedOrderDetails }: { confirmedOrderDetails: { totalInscriptions: number; orderDisplayId: string | number } | null }) => {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            router.push('/dashboard/subscriptions');
        }
    }, [countdown, router]);
    
    if (!confirmedOrderDetails) {
        return (
             <div className="animate-in zoom-in-95 duration-700 flex flex-col items-center justify-center text-center py-10">
                <Loader2 className="w-16 h-16 animate-spin text-primary mb-8"/>
                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Carregando detalhes...</h2>
            </div>
        );
    }

    return (
        <div className="animate-in zoom-in-95 duration-700 flex flex-col items-center justify-center text-center py-10">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-emerald-100/50">
                <Check className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">PAGAMENTO APROVADO!</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">
                Sua compra de <strong>{confirmedOrderDetails.totalInscriptions} inscrições</strong> foi confirmada com o ID{' '}
                <span className='font-bold text-primary'>#{confirmedOrderDetails.orderDisplayId}</span>.
            </p>
            <div className="p-4 bg-primary/10 rounded-2xl w-full max-w-md">
                 <p className="text-primary font-bold">
                    Redirecionando para a identificação dos atletas em <span className="font-black text-2xl">{countdown}</span>...
                 </p>
            </div>
            <div className="grid grid-cols-1 gap-4 w-full max-w-sm mt-8">
                <Button onClick={() => router.push('/dashboard/subscriptions')} className="py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-primary transition-all text-xs uppercase tracking-widest shadow-xl h-auto">
                    Ir para Minhas Inscrições
                </Button>
            </div>
        </div>
    );
};


export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, totalItems, abandonedCartId } = useCart();
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [step, setStep] = useState<CheckoutStep>('identification');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'home'>('pickup');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [paymentResult, setPaymentResult] = useState<{status: string, id: number} | null>(null);
  const [payerData, setPayerData] = useState<PayerData | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string | null>(null);
  const [confirmedOrderDetails, setConfirmedOrderDetails] = useState<{ totalInscriptions: number; orderDisplayId: string | number } | null>(null);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const firstRaceId = cart.length > 0 ? cart[0].raceId : null;
  const raceRef = useMemoFirebase(() => (firestore && firstRaceId) ? doc(firestore, 'races', firstRaceId) : null, [firestore, firstRaceId]);
  const { data: raceData, loading: loadingRace } = useDoc<Race>(raceRef);
  
  const isPrivilegedUser = useMemo(() => {
    if (!user) return false;
    const privilegedEmails = ['adm@gmail.com', 'staff@gmail.com', 'entregador@gmail.com'];
    return privilegedEmails.includes(user.email || '');
  }, [user]);

  const deliveryOptions = useMemo(() => {
    if (!raceData) return null;
    return {
        pickup: raceData.kitPickup,
        delivery: raceData.kitDelivery
    }
  }, [raceData]);
  
  useEffect(() => {
    if (deliveryOptions) {
        if (deliveryOptions.pickup?.enabled) {
            setDeliveryMethod('pickup');
        } else if (deliveryOptions.delivery?.enabled) {
            setDeliveryMethod('home');
        }
    }
  }, [deliveryOptions]);

  const deliveryFee = useMemo(() => {
    if (deliveryMethod === 'home' && deliveryOptions?.delivery?.enabled) {
        return deliveryOptions.delivery.price;
    }
    return 0;
  }, [deliveryMethod, deliveryOptions]);

  const { totalPrice, discountAmount, subtotal } = useMemo(() => {
    const sub = cart.reduce((acc, item) => acc + (item.option.lots[0].price * item.quantity), 0);
    const discount = appliedCoupon 
      ? (appliedCoupon.discountType === 'percentage' 
          ? (sub + deliveryFee) * (appliedCoupon.discountValue / 100) 
          : appliedCoupon.discountValue)
      : 0;
    const total = Math.max(0, sub + deliveryFee - discount);
    return { totalPrice: total, discountAmount: discount, subtotal: sub };
  }, [cart, appliedCoupon, deliveryFee]);

  // Update abandoned cart on step change
  useEffect(() => {
    const updateStep = async () => {
        if (abandonedCartId && firestore && step !== 'confirmation') {
            const cartRef = doc(firestore, 'abandonedCarts', abandonedCartId);
            await updateDoc(cartRef, {
                lastStep: step,
                lastActivityAt: serverTimestamp()
            });
        }
    };
    updateStep();
  }, [step, abandonedCartId, firestore]);
  
  const handleApplyCoupon = async () => {
      if (!couponCode.trim() || !firestore) return;
      setCouponLoading(true);
      setCouponError('');
      setAppliedCoupon(null);
      try {
          const q = query(collection(firestore, 'coupons'), where('code', '==', couponCode.toUpperCase()), limit(1));
          const querySnapshot = await getDocs(q);

          if (querySnapshot.empty) {
              setCouponError('Cupom inválido ou expirado.');
              toast({ variant: 'destructive', title: 'Cupom inválido.' });
              return;
          }

          const coupon = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Coupon;

          if (!coupon.isActive) {
              setCouponError('Este cupom não está mais ativo.');
              toast({ variant: 'destructive', title: 'Cupom inativo.' });
              return;
          }

          const now = new Date();
          if (coupon.startDate && (coupon.startDate as any).toDate() > now) {
              setCouponError('Este cupom ainda não é válido.');
              toast({ variant: 'destructive', title: 'Cupom ainda não válido.' });
              return;
          }

          if (coupon.endDate && (coupon.endDate as any).toDate() < now) {
              setCouponError('Este cupom expirou.');
              toast({ variant: 'destructive', title: 'Cupom expirado.' });
              return;
          }

          if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
              setCouponError('Este cupom atingiu o limite de usos.');
              toast({ variant: 'destructive', title: 'Cupom esgotado.' });
              return;
          }

          setAppliedCoupon(coupon);
          toast({ title: 'Cupom aplicado com sucesso!' });
      } catch (error) {
           setCouponError('Erro ao validar o cupom.');
           toast({ variant: 'destructive', title: 'Erro ao validar cupom.' });
      } finally {
          setCouponLoading(false);
      }
  }

  const handlePaymentSuccess = async (result: {status: string, id: number}, newPayerData?: PayerData) => {
    const finalPayerData = newPayerData || payerData;
    if (!user || !finalPayerData) {
      toast({ variant: 'destructive', title: 'Usuário ou dados do pagador não encontrados.' });
      return;
    }
    
    setIsProcessingPayment(false);
    setIsCreatingOrder(true);

    const raceName = cart.length > 0 ? cart[0].raceName : 'sua corrida';

    try {
        const { orderNumber } = await createOrderAndSubscriptions({
            userId: user.uid,
            cartItems: cart,
            payerData: finalPayerData,
            totalAmount: totalPrice,
            deliveryMethod,
            deliveryFee,
            deliveryAddress,
            appliedCoupon: appliedCoupon ? {
                id: appliedCoupon.id,
                code: appliedCoupon.code,
                discountAmount: discountAmount
            } : null
        });

        if (abandonedCartId && firestore) {
            const abandonedCartRef = doc(firestore, 'abandonedCarts', abandonedCartId);
            await updateDoc(abandonedCartRef, {
                status: 'CONVERTIDO',
                lastStep: 'confirmation',
                lastActivityAt: serverTimestamp(),
            });
        }

        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: finalPayerData.email,
                    type: 'orderConfirmation',
                    data: {
                        customerName: `${finalPayerData.first_name} ${finalPayerData.last_name}`,
                        raceName: raceName,
                        orderNumber: orderNumber,
                        totalInscriptions: totalItems,
                    }
                })
            });
        } catch (emailError) {
             console.error("Failed to send order confirmation email:", emailError);
        }

        setConfirmedOrderDetails({
            totalInscriptions: totalItems,
            orderDisplayId: orderNumber
        });

        setPaymentResult(result);
        clearCart();
        setStep('confirmation');

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro ao criar pedido', description: 'Seu pagamento foi processado, mas houve um erro ao registrar sua inscrição. Por favor, entre em contato com o suporte.'});
    } finally {
        setIsCreatingOrder(false);
    }
  };

  const handleFreeOrder = async (payerInfo: PayerData, address: string | null) => {
    if (!user || userLoading) {
        toast({ variant: 'destructive', title: 'Sessão de usuário não carregada. Tente novamente.' });
        return;
    }
    setIsCreatingOrder(true);
    
    const raceName = cart.length > 0 ? cart[0].raceName : 'sua corrida';

     try {
        const { orderNumber } = await createOrderAndSubscriptions({
            userId: user.uid,
            cartItems: cart,
            payerData: payerInfo,
            totalAmount: totalPrice,
            deliveryMethod,
            deliveryFee,
            deliveryAddress: address,
            appliedCoupon: appliedCoupon ? {
                id: appliedCoupon.id,
                code: appliedCoupon.code,
                discountAmount: discountAmount
            } : null
        });

        if (abandonedCartId && firestore) {
            const abandonedCartRef = doc(firestore, 'abandonedCarts', abandonedCartId);
            await updateDoc(abandonedCartRef, {
                status: 'CONVERTIDO',
                lastStep: 'confirmation',
                lastActivityAt: serverTimestamp(),
            });
        }

        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: payerInfo.email,
                    type: 'orderConfirmation',
                    data: {
                        customerName: `${payerInfo.first_name} ${payerInfo.last_name}`,
                        raceName: raceName,
                        orderNumber: orderNumber,
                        totalInscriptions: totalItems,
                    }
                })
            });
        } catch (emailError) {
             console.error("Failed to send free order confirmation email:", emailError);
        }

        setConfirmedOrderDetails({
            totalInscriptions: totalItems,
            orderDisplayId: orderNumber
        });

        setPaymentResult({ status: 'approved', id: 0 }); // Mock payment result for free orders
        clearCart();
        setStep('confirmation');

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Erro ao criar pedido', description: 'Houve um erro ao registrar sua inscrição. Por favor, entre em contato com o suporte.'});
    } finally {
        setIsCreatingOrder(false);
    }
  }

  const handleIdentificationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (userLoading) {
      toast({ title: 'Aguarde um momento...', description: 'Verificando sua sessão antes de continuar.'});
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data: PayerData = {
        email: formData.get('payerEmail') as string,
        first_name: formData.get('payerFirstName') as string,
        last_name: formData.get('payerLastName') as string,
        phone: formData.get('payerPhone') as string,
        identification: {
            type: formData.get('docType') as string,
            number: formData.get('docNumber') as string,
        },
    };
    setPayerData(data);
    setStep('delivery');
  };

  const handleDeliverySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let fullAddress: string | null = null;
    if (deliveryMethod === 'home') {
        const formData = new FormData(e.currentTarget);
        const addressData = {
            address: formData.get('address') as string,
            number: formData.get('addressNumber') as string,
            complement: formData.get('addressComplement') as string,
            neighborhood: formData.get('addressNeighborhood') as string,
            city: formData.get('addressCity') as string,
            state: formData.get('addressState') as string,
            zipCode: formData.get('addressZipCode') as string,
        };

        if (!addressData.address || !addressData.number || !addressData.neighborhood || !addressData.city || !addressData.state || !addressData.zipCode) {
             toast({
                variant: "destructive",
                title: "Endereço incompleto",
                description: "Por favor, preencha todos os campos obrigatórios do endereço.",
            });
            return;
        }

        fullAddress = `${addressData.address}, ${addressData.number}${addressData.complement ? ` - ${addressData.complement}` : ''}, ${addressData.neighborhood}, ${addressData.city} - ${addressData.state}, ${addressData.zipCode}`;
        setDeliveryAddress(fullAddress);
    } else {
        setDeliveryAddress(null);
    }
    
    if (!payerData) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Dados do pagador não encontrados. Volte para o passo anterior.'});
        return;
    }

    if (totalPrice === 0) {
        handleFreeOrder(payerData, fullAddress);
    } else {
        setStep('payment');
    }
  };

  const handlePaymentError = () => {
    setIsProcessingPayment(false);
  }
  
  const raceNameForForm = cart.length > 0 ? cart[0].raceName : 'sua corrida';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 py-6 px-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Button onClick={() => router.push('/')} variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                 <ArrowLeft className="w-6 h-6" />
              </Button>
               <div className="h-6 w-px bg-slate-200"></div>
                <Logo />
           </div>
           <div className="flex gap-2">
              {['Identificação', 'Entrega', 'Pagamento', 'Concluir'].map((s, idx) => (
                <div key={s} className="flex items-center gap-2">
                   <div className={`w-2.5 h-2.5 rounded-full ${(['identification', 'delivery', 'payment', 'confirmation'].indexOf(step) >= idx) ? 'bg-primary' : 'bg-slate-200'}`}></div>
                   <span className={`text-[9px] font-black uppercase tracking-widest hidden sm:block ${(['identification', 'delivery', 'payment', 'confirmation'].indexOf(step) >= idx) ? 'text-slate-900' : 'text-slate-300'}`}>{s}</span>
                </div>
              ))}
           </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 min-h-[500px] flex flex-col">
               
               {step === 'identification' && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-3xl font-black tracking-tight">1. Identificação do Responsável</h2>
                        <p className="text-slate-400 text-sm mt-1">Preencha os dados de quem está realizando a compra.</p>
                      </div>
                    </div>
                    <form id="identification-form" onSubmit={handleIdentificationSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome</Label>
                                <Input required id="payerFirstName" name="payerFirstName" type="text" placeholder="Seu primeiro nome" className="w-full px-6 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none font-bold h-auto" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Sobrenome</Label>
                                <Input required id="payerLastName" name="payerLastName" type="text" placeholder="Seu sobrenome" className="w-full px-6 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none font-bold h-auto" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">E-mail</Label>
                                <Input required id="payerEmail" name="payerEmail" type="email" placeholder="seuemail@exemplo.com" className="w-full px-6 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none font-bold h-auto" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Celular (WhatsApp)</Label>
                                <Input required id="payerPhone" name="payerPhone" type="tel" placeholder="(00) 90000-0000" className="w-full px-6 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none font-bold h-auto" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tipo de Documento</Label>
                                <Input required id="docType" name="docType" defaultValue="CPF" readOnly className="w-full px-6 py-4 bg-slate-100 border-slate-200 rounded-2xl font-bold h-auto" />
                            </div>
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">CPF</Label>
                                <Input required id="docNumber" name="docNumber" type="text" placeholder="000.000.000-00" className="w-full px-6 py-4 bg-slate-50 border-slate-100 rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none font-bold h-auto" />
                            </div>
                        </div>
                        {isPrivilegedUser ? (
                            <div className="text-center mt-12 p-6 bg-amber-100/50 border-2 border-dashed border-amber-300 rounded-2xl flex flex-col items-center gap-3">
                                <Shield className="w-6 h-6 text-amber-600"/>
                                <div>
                                    <p className="font-bold text-amber-800">Acesso Administrativo</p>
                                    <p className="text-sm text-amber-700">Sua conta não pode finalizar compras.</p>
                                </div>
                            </div>
                        ) : (
                            <Button type="submit" disabled={userLoading} className="mt-12 w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-primary transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs h-auto">
                                {userLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {userLoading ? 'Verificando sessão...' : 'Continuar para Entrega'}
                            </Button>
                        )}
                    </form>
                 </div>
               )}
               
               {step === 'delivery' && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <h2 className="text-3xl font-black tracking-tight">2. Entrega do Kit</h2>
                    <p className="text-slate-400 text-sm mt-1">Como você prefere receber seu kit?</p>
                    
                    <form id="delivery-form" onSubmit={handleDeliverySubmit} className="space-y-6 mt-6">
                        <RadioGroup value={deliveryMethod} onValueChange={(val) => setDeliveryMethod(val as 'pickup' | 'home')} className="space-y-4">
                            {deliveryOptions?.pickup?.enabled && (
                                <Label htmlFor="pickup" className={cn("p-6 border-2 rounded-[2rem] flex items-center justify-between group cursor-pointer transition-all", deliveryMethod === 'pickup' ? "border-primary bg-primary/10" : "border-slate-100 hover:border-slate-200")}>
                                    <div className="flex items-center gap-4">
                                        <RadioGroupItem value="pickup" id="pickup" />
                                        <div className='flex items-center gap-2'><Package className='w-5 h-5 text-muted-foreground'/> <p className="font-black text-slate-900">Retirar no Local</p></div>
                                    </div>
                                    <span className="font-bold text-sm text-primary">GRÁTIS</span>
                                </Label>
                            )}
                            {deliveryOptions?.delivery?.enabled && (
                                <Label htmlFor="home" className={cn("p-6 border-2 rounded-[2rem] flex flex-col items-start group cursor-pointer transition-all", deliveryMethod === 'home' ? "border-primary bg-primary/10" : "border-slate-100 hover:border-slate-200")}>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center gap-4">
                                            <RadioGroupItem value="home" id="home" />
                                            <div className='flex items-center gap-2'><Home className='w-5 h-5 text-muted-foreground'/> <p className="font-black text-slate-900">Receber em Casa</p></div>
                                        </div>
                                        <span className="font-bold text-sm text-primary">{deliveryOptions.delivery.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </div>
                                    
                                    {deliveryMethod === 'home' && (
                                        <div className="w-full pl-10 mt-6 space-y-4 animate-in fade-in duration-300">
                                            <p className="text-xs font-bold text-slate-500">Preencha o endereço de entrega do líder da equipe:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="md:col-span-3"><Input required name="address" placeholder="Rua / Avenida" className="bg-white"/></div>
                                                <div className=""><Input required name="addressNumber" placeholder="Número" className="bg-white"/></div>
                                                <div className="md:col-span-2"><Input name="addressComplement" placeholder="Complemento (Opcional)" className="bg-white"/></div>
                                                <div className="md:col-span-3"><Input required name="addressNeighborhood" placeholder="Bairro" className="bg-white"/></div>
                                                <div className="md:col-span-2"><Input required name="addressCity" placeholder="Cidade" className="bg-white"/></div>
                                                <div className=""><Input required name="addressState" placeholder="UF" className="bg-white"/></div>
                                                <div className="md:col-span-3"><Input required name="addressZipCode" placeholder="CEP" className="bg-white"/></div>
                                            </div>
                                            <div className="flex items-start space-x-3 mt-4">
                                                <Checkbox id="terms" required />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        Declaro estar ciente de que somente eu, o líder da equipe, receberei todos os kits, e que os demais membros deverão retirá-los diretamente comigo.
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </Label>
                            )}
                        </RadioGroup>
                        
                        <div className="flex justify-between mt-12">
                            <Button onClick={() => setStep('identification')} variant="outline" type="button" className="flex-1 mt-auto py-5 h-auto border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs">Voltar</Button>
                            <Button type="submit" className="ml-4 flex-1 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-primary transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs h-auto">
                                Continuar para Pagamento
                            </Button>
                        </div>
                    </form>
                 </div>
               )}

               {step === 'payment' && (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-8">
                    <div>
                      <h2 className="text-3xl font-black mb-8 tracking-tight">3. Pagamento</h2>
                      <div className="space-y-4">
                        <div onClick={() => setPaymentMethod('credit')} className={cn("p-6 border-2 rounded-[2rem] flex items-center justify-between group cursor-pointer transition-all", paymentMethod === 'credit' ? "border-primary bg-primary/10" : "border-slate-100 hover:border-slate-200")}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><CreditCard className={cn("w-6 h-6", paymentMethod === 'credit' ? 'text-primary' : 'text-muted-foreground')}/></div>
                              <div>
                                  <p className="font-black text-slate-900">Cartão de Crédito</p>
                                  <p className="text-xs text-slate-500">Pague em até 12x</p>
                              </div>
                            </div>
                            <div className={cn("w-6 h-6 rounded-full border-2 bg-white transition-all", paymentMethod === 'credit' ? 'border-primary border-4' : 'border-slate-200')}></div>
                        </div>
                        <div onClick={() => setPaymentMethod('pix')} className={cn("p-6 border-2 rounded-[2rem] flex items-center justify-between group cursor-pointer transition-all", paymentMethod === 'pix' ? "border-primary bg-primary/10" : "border-slate-100 hover:border-slate-200")}>
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm"><QrCode className={cn("w-6 h-6", paymentMethod === 'pix' ? 'text-primary' : 'text-muted-foreground')}/></div>
                              <div>
                                  <p className="font-black text-slate-900">PIX Instantâneo</p>
                                  <p className="text-xs text-slate-500">Aprovação na hora</p>
                              </div>
                            </div>
                            <div className={cn("w-6 h-6 rounded-full border-2 bg-white transition-all", paymentMethod === 'pix' ? 'border-primary border-4' : 'border-slate-200')}></div>
                        </div>
                      </div>
                      <div className="mt-8">
                        {paymentMethod === 'credit' && payerData && (
                            <CardPaymentForm 
                              payerData={payerData} 
                              amount={totalPrice} 
                              raceName={raceNameForForm}
                              onPaymentSuccess={handlePaymentSuccess} 
                              onPaymentError={handlePaymentError}
                              setIsLoading={setIsProcessingPayment}
                              disabled={userLoading || isProcessingPayment}
                            />
                        )}
                        {paymentMethod === 'pix' && payerData && <PixPaymentDisplay payerData={payerData} amount={totalPrice} onPaymentSuccess={handlePaymentSuccess} />}
                      </div>
                    </div>
                    <Button onClick={() => setStep('delivery')} variant="outline" className="flex-1 mt-auto py-5 h-auto border-2 border-slate-100 text-slate-400 font-black rounded-2xl hover:bg-slate-100 transition-all uppercase tracking-widest text-xs">Voltar</Button>
                 </div>
               )}

                {step === 'confirmation' && !isCreatingOrder && (
                    <ConfirmationStep confirmedOrderDetails={confirmedOrderDetails} />
                )}

                {step === 'confirmation' && isCreatingOrder && (
                    <div className="animate-in zoom-in-95 duration-700 flex flex-col items-center justify-center text-center py-10">
                        <Loader2 className="w-16 h-16 animate-spin text-primary mb-8"/>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">FINALIZANDO INSCRIÇÃO...</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed">Seu pagamento foi aprovado! Estamos registrando suas vagas. Por favor, aguarde.</p>
                    </div>
                )}
            </div>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-slate-900 rounded-[3rem] p-10 text-white sticky top-32 shadow-2xl shadow-primary/20">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Resumo do Pedido</h3>
                <div className="space-y-6 mb-6">
                   {cart.map(item => (
                       <div key={item.raceId + item.option.distance} className="flex justify-between items-start">
                          <div>
                             <p className="font-bold">{item.raceName}</p>
                             <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{item.quantity}x Inscrição {item.option.distance}</p>
                          </div>
                          <span className="font-bold whitespace-nowrap">{(item.option.lots[0].price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                       </div>
                   ))}
                    {deliveryFee > 0 && (
                       <div className="flex justify-between items-start">
                          <div>
                             <p className="font-bold">Taxa de Entrega</p>
                          </div>
                          <span className="font-bold whitespace-nowrap">{deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                       </div>
                   )}
                   {appliedCoupon && (
                       <div className="flex justify-between items-start text-emerald-400">
                          <div>
                             <p className="font-bold">Cupom: {appliedCoupon.code}</p>
                          </div>
                          <span className="font-bold whitespace-nowrap">- {discountAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                       </div>
                   )}
                </div>
                 <div className="space-y-3 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="CUPOM DE DESCONTO"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            disabled={!!appliedCoupon}
                            className="h-11 bg-white/5 border-white/10 text-white text-xs font-bold tracking-widest placeholder:text-slate-400 rounded-lg"
                        />
                        <Button onClick={handleApplyCoupon} disabled={couponLoading || !!appliedCoupon} className="h-11 bg-white/20 hover:bg-white/30 text-white rounded-lg">
                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : (appliedCoupon ? <CheckCircle className="w-4 h-4"/> : 'OK')}
                        </Button>
                    </div>
                     {couponError && <p className="text-xs text-red-400">{couponError}</p>}
                </div>
                <div className="flex justify-between items-end pt-6">
                   <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Valor Total</p>
                   <p className="text-3xl font-black text-primary tracking-tighter">{totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className='flex items-center gap-2 mt-8 p-3 bg-white/5 rounded-xl border border-white/10'>
                    <Shield className="w-4 h-4 text-green-400"/>
                    <p className="text-xs text-slate-400">Pagamento seguro via Mercado Pago</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

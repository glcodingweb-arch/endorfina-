
'use client';

import React from 'react';
import { CardNumber, SecurityCode, ExpirationDate, CardPayment } from '@mercadopago/sdk-react';
import { createCardPayment } from '@/actions/payment';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export interface PayerData {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    identification: {
        type: string;
        number: string;
    };
}

interface CardPaymentFormProps {
  amount: number;
  payerData: PayerData;
  raceName: string;
  onPaymentSuccess: (result: { status: string; id: number }) => void;
  onPaymentError: (error: any) => void;
  setIsLoading: (isLoading: boolean) => void;
  disabled?: boolean;
}

export function CardPaymentForm({ amount, payerData, raceName, onPaymentSuccess, onPaymentError, setIsLoading, disabled }: CardPaymentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [cardholderName, setCardholderName] = React.useState('');

  const onSubmit = async (formData: any) => {
    if (!payerData) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Dados do pagador não encontrados.' });
      return;
    }

    if (!cardholderName.trim()) {
        toast({ variant: 'destructive', title: 'Erro de Validação', description: 'Por favor, insira o nome do titular do cartão.'});
        return;
    }

    setIsLoading(true);
    setIsSubmitting(true);
    
    const paymentData = {
        ...formData,
        payer: {
            ...payerData,
        },
    };
    
    try {
        const result = await createCardPayment(paymentData);
        if (result.id && (result.status === 'approved' || result.status === 'in_process')) {
            onPaymentSuccess({ status: result.status, id: result.id });
        } else {
            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: payerData.email,
                        type: 'paymentFailed',
                        data: {
                            customerName: `${payerData.first_name} ${payerData.last_name}`,
                            orderNumber: `MP-${Date.now()}`,
                            raceName: raceName
                        }
                    })
                });
            } catch (emailError) {
                console.error("Failed to send payment failed email:", emailError);
            }
            throw new Error(result.error || 'Pagamento recusado.');
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Erro no pagamento', description: error.message });
        onPaymentError(error);
    } finally {
        setIsLoading(false);
        setIsSubmitting(false);
    }
  };

  return (
    <CardPayment
      initialization={{ amount }}
      onSubmit={onSubmit}
      onError={(error) => {
        console.error('MercadoPago Brick Error:', error);
        toast({ variant: 'destructive', title: 'Erro no formulário', description: 'Por favor, verifique os dados do cartão.'});
        onPaymentError(error);
      }}
    >
      <form id="card-payment-form" className="space-y-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="cardNumber">Número do Cartão</Label>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mt-1">
              <CardNumber placeholder="0000 0000 0000 0000" />
            </div>
          </div>
          <div>
            <Label htmlFor="cardholderName">Nome do Titular</Label>
             <Input 
                id="form-card-cardholderName"
                value={cardholderName} 
                onChange={(e) => setCardholderName(e.target.value)}
                placeholder="Como está no cartão" 
                className="mt-1 h-11 bg-slate-50 border-slate-100 rounded-xl"
            />
          </div>
          <div>
            <Label htmlFor="expirationDate">Validade</Label>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mt-1">
              <ExpirationDate placeholder="MM/AA" />
            </div>
          </div>
          <div>
            <Label htmlFor="securityCode">CVC</Label>
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mt-1">
              <SecurityCode placeholder="123" />
            </div>
          </div>
           <div>
            <Label htmlFor="installments">Parcelas</Label>
            <div id="installments" className="mt-1 h-11 bg-slate-50 border border-slate-100 rounded-xl" />
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting || disabled} className="w-full py-5 h-auto bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs">
          {isSubmitting && <Loader2 className="animate-spin mr-2" />}
          {disabled ? 'Aguardando...' : isSubmitting ? 'Processando...' : `Pagar ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
        </Button>
      </form>
    </CardPayment>
  );
}

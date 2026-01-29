'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPixPayment, getPaymentStatus } from '@/actions/payment';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Copy, Loader2, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { PayerData } from './card-payment-form';
import { Input } from '@/components/ui/input';

interface PixPaymentDisplayProps {
  amount: number;
  payerData: PayerData;
  onPaymentSuccess: (result: { status: string; id: number }) => void;
}

export function PixPaymentDisplay({ amount, payerData, onPaymentSuccess }: PixPaymentDisplayProps) {
  const { toast } = useToast();
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_base64: string, id: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generatePix = useCallback(async () => {
    if (!payerData) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Dados do pagador não encontrados.' });
      return;
    }

    setIsLoading(true);
    
    const data = {
      transaction_amount: amount,
      payer: payerData,
    };
    
    try {
      const result = await createPixPayment(data as any);
      if (result.id && result.qr_code) {
        setPixData({ ...result, id: result.id });
        
        // Envia e-mail de pagamento pendente
        try {
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: payerData.email,
                    type: 'paymentPending',
                    data: {
                        customerName: `${payerData.first_name} ${payerData.last_name}`,
                        orderNumber: `PIX-${result.id}`,
                        pixCode: result.qr_code,
                    }
                })
            });
        } catch (emailError) {
            console.error("Failed to send payment pending email:", emailError);
        }

      } else {
        throw new Error(result.error || 'Não foi possível gerar o código PIX.');
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao Gerar PIX', description: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [amount, payerData, toast]);

  useEffect(() => {
    generatePix();
  }, [generatePix]);

   useEffect(() => {
    if (!pixData?.id) return;

    const interval = setInterval(async () => {
      try {
        const { status } = await getPaymentStatus(pixData.id);
        if (status === 'approved') {
          clearInterval(interval);
          onPaymentSuccess({ status, id: pixData.id });
        }
      } catch (error) {
        console.error("Polling for PIX payment status failed:", error);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [pixData, onPaymentSuccess]);

  const copyToClipboard = () => {
    if (!pixData) return;
    navigator.clipboard.writeText(pixData.qr_code);
    toast({ title: 'Código PIX copiado com sucesso!' });
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
        <p className="text-muted-foreground">Gerando código PIX...</p>
      </div>
    );
  }

  if (!pixData) {
    return (
      <div className="text-center p-8 bg-destructive/10 rounded-2xl">
        <p className="text-destructive font-bold">Não foi possível gerar o PIX.</p>
        <Button onClick={generatePix} variant="destructive" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-slate-50 rounded-2xl border">
      <h3 className="font-bold mb-4">Pague com PIX para finalizar</h3>
      <div className="p-4 bg-white rounded-lg border shadow-sm">
        <QRCode value={pixData.qr_code} size={200} />
      </div>
      <p className="text-sm text-muted-foreground mt-4">Ou copie o código abaixo:</p>
      <div className="flex items-center gap-2 w-full max-w-sm mt-2">
        <Input readOnly value={pixData.qr_code} className="text-xs bg-white truncate" />
        <Button size="icon" variant="outline" onClick={copyToClipboard}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
        <div className='flex items-center gap-2 mt-6 p-3 bg-blue-50 text-blue-700 rounded-lg border border-blue-200'>
            <Loader2 className='animate-spin h-4 w-4'/>
            <p className='text-xs font-bold'>Aguardando confirmação do pagamento...</p>
        </div>
    </div>
  );
}

'use server';

import { mercadopagoClient } from '@/lib/mercadopago-config';
import { Payment } from 'mercadopago';
import type {
  PaymentCreateData,
  PaymentResponse,
} from 'mercadopago/dist/clients/payment/commonTypes';
import { z } from 'zod';

// Zod Schemas para validação de entrada
const CardPaymentSchema = z.object({
  token: z.string(),
  issuer_id: z.string(),
  payment_method_id: z.string(),
  transaction_amount: z.number().positive(),
  installments: z.number().int().min(1),
  payer: z.object({
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    identification: z.object({
      type: z.string(),
      number: z.string(),
    }),
  }),
});

const PixPaymentSchema = z.object({
    transaction_amount: z.number().positive(),
    payer: z.object({
        email: z.string().email(),
        first_name: z.string(),
        last_name: z.string(),
        identification: z.object({
            type: z.string(),
            number: z.string(),
        }),
    }),
});

// Tipos inferidos a partir dos schemas
type CardPaymentData = z.infer<typeof CardPaymentSchema>;
type PixPaymentData = z.infer<typeof PixPaymentSchema>;

const formatPhoneForMP = (payer: any) => {
    if (payer?.phone && typeof payer.phone === 'string') {
        const phoneDigits = payer.phone.replace(/\D/g, '');
        if (phoneDigits.length >= 10) {
            return {
                ...payer,
                phone: {
                    area_code: phoneDigits.substring(0, 2),
                    number: phoneDigits.substring(2),
                }
            };
        }
    }
    // If phone is invalid or not present, return payer without it to avoid API errors.
    const { phone, ...rest } = payer || {};
    return rest;
}


export async function createCardPayment(data: CardPaymentData): Promise<{ status: string, id: number | undefined, error?: string }> {
  try {
    // Validação dos dados de entrada
    CardPaymentSchema.parse(data);

    const paymentPayload = { ...data } as any;
    paymentPayload.payer = formatPhoneForMP(paymentPayload.payer);

    const payment = new Payment(mercadopagoClient);
    
    // Arredonda para 2 casas decimais para garantir o formato correto
    const finalAmount = parseFloat(data.transaction_amount.toFixed(2));

    const paymentData: PaymentCreateData = {
      body: {
        ...paymentPayload,
        transaction_amount: finalAmount,
        description: 'Inscrição para corrida - Endorfina Esportes',
        notification_url: 'https://seusite.com/api/payment-webhook', // TODO: Implementar webhook
      },
    };

    const result: PaymentResponse = await payment.create(paymentData);
    
    if (result.id) {
        return { status: result.status!, id: result.id };
    } else {
        console.error('MercadoPago API Error:', result);
        throw new Error(result.cause?.[0]?.description || 'Falha ao processar o pagamento com cartão.');
    }
  } catch (error: any) {
    console.error('Error creating card payment:', error);
    return { status: 'error', id: undefined, error: error.message || 'Erro desconhecido' };
  }
}


export async function createPixPayment(data: PixPaymentData): Promise<{ qr_code: string, qr_code_base64: string, id: number | undefined, error?: string }> {
    try {
        // Validação dos dados de entrada
        PixPaymentSchema.parse(data);

        const paymentPayload = { ...data } as any;
        paymentPayload.payer = formatPhoneForMP(paymentPayload.payer);

        const payment = new Payment(mercadopagoClient);
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 30); // PIX expira em 30 minutos

        // Arredonda para 2 casas decimais para garantir o formato correto
        const finalAmount = parseFloat(data.transaction_amount.toFixed(2));

        const paymentData: PaymentCreateData = {
          body: {
            ...paymentPayload,
            transaction_amount: finalAmount,
            description: 'Inscrição para corrida via PIX - Endorfina Esportes',
            payment_method_id: 'pix',
            date_of_expiration: expirationDate.toISOString(),
          },
        };

        const result: PaymentResponse = await payment.create(paymentData);

        const qrCode = result.point_of_interaction?.transaction_data?.qr_code;
        const qrCodeBase64 = result.point_of_interaction?.transaction_data?.qr_code_base64;

        if (result.id && qrCode && qrCodeBase64) {
            return {
                id: result.id,
                qr_code: qrCode,
                qr_code_base64: qrCodeBase64,
            };
        } else {
            console.error('MercadoPago PIX Error:', result);
            const errorMessage = result.cause?.[0]?.description || 'Falha ao gerar o pagamento PIX.';
            if (errorMessage.includes('collector user without key enabled')) {
                 throw new Error('A conta do vendedor não possui uma chave PIX cadastrada no Mercado Pago. Por favor, configure uma chave PIX para continuar.');
            }
            throw new Error(errorMessage);
        }

    } catch (error: any) {
        console.error('Error creating PIX payment:', error);
        return { qr_code: '', qr_code_base64: '', id: undefined, error: error.message || 'Erro desconhecido' };
    }
}

export async function getPaymentStatus(paymentId: number): Promise<{ status: string | undefined }> {
    try {
        const payment = new Payment(mercadopagoClient);
        const result: PaymentResponse = await payment.get({ id: paymentId });
        return { status: result.status };
    } catch (error: any) {
        console.error(`Error getting payment status for ID ${paymentId}:`, error);
        return { status: 'error' };
    }
}

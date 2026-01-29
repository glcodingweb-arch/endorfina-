'use server';

import { getFirestore, collection, writeBatch, serverTimestamp, doc, increment } from 'firebase/firestore';
import { initializeFirebaseApp } from '@/firebase/server-init';
import type { CartItem, Order } from '@/lib/types';
import type { PayerData } from '@/components/checkout/mercado-pago/card-payment-form';
import { nanoid } from 'nanoid';

interface CreateOrderPayload {
    userId: string;
    cartItems: CartItem[];
    payerData: PayerData;
    totalAmount: number;
    deliveryMethod: 'pickup' | 'home';
    deliveryFee: number;
    deliveryAddress: string | null;
    appliedCoupon?: {
        id: string;
        code: string;
        discountAmount: number;
    } | null;
}

export async function createOrderAndSubscriptions({ userId, cartItems, payerData, totalAmount, deliveryMethod, deliveryFee, deliveryAddress, appliedCoupon }: CreateOrderPayload) {
    const app = initializeFirebaseApp();
    const db = getFirestore(app);
    const batch = writeBatch(db);

    // Assume all items in cart are for the same race, as per checkout logic
    const raceId = cartItems.length > 0 ? cartItems[0].raceId : null;
    if (!raceId) {
        throw new Error('ID do evento não pôde ser determinado para este pedido.');
    }

    // 1. Create the Order document
    const orderRef = doc(collection(db, 'orders'));
    const participantIds: string[] = [];
    const orderNumber = nanoid(10).toUpperCase();

    // 2. Create Participant documents for each item in cart
    for (const item of cartItems) {
        for (let i = 0; i < item.quantity; i++) {
            const participantRef = doc(collection(db, 'participants'));
            participantIds.push(participantRef.id);
            
            batch.set(participantRef, {
                userId: userId,
                raceId: item.raceId,
                orderId: orderRef.id,
                modality: item.option.distance,
                status: 'PENDENTE_IDENTIFICACAO', // Initial status
                kitStatus: deliveryMethod === 'home' ? 'aguardando_envio' : 'pendente',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }
    }

    const orderData: Partial<Order> = {
        orderNumber: orderNumber,
        userId: userId,
        raceId: raceId,
        participantIds,
        orderDate: serverTimestamp(),
        orderStatus: 'PAGO',
        orderStatusDetail: 'Pagamento confirmado',
        responsibleName: `${payerData.first_name} ${payerData.last_name}`,
        responsibleEmail: payerData.email,
        responsiblePhone: payerData.phone,
        totalAmount: totalAmount,
        deliveryMethod: deliveryMethod,
        deliveryFee: deliveryFee,
    };

    if (deliveryMethod === 'home') {
        orderData.kitDeliveryStatus = 'Pendente';
        orderData.deliveryAddress = deliveryAddress || undefined;
    }
    
    if (appliedCoupon) {
        orderData.couponId = appliedCoupon.id;
        orderData.couponCode = appliedCoupon.code;
        orderData.discountAmount = appliedCoupon.discountAmount;
    }

    batch.set(orderRef, orderData);

    // 4. Update coupon usage if applicable
    if (appliedCoupon) {
        const couponRef = doc(db, 'coupons', appliedCoupon.id);
        batch.update(couponRef, {
            currentUses: increment(1)
        });
    }
    
    // 3. Commit the batch
    await batch.commit();

    return { orderId: orderRef.id, participantIds, orderNumber };
}

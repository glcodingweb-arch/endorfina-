'use client';

import type { CartItem, RaceOption } from '@/lib/types';
import type { Race } from '@/lib/types';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, doc, setDoc, deleteDoc, serverTimestamp, where, getDocs, getDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';

interface CartContextType {
  cart: CartItem[];
  addToCart: (raceId: string, option: RaceOption, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  totalPrice: number;
  bonusApplied: boolean;
  freeItem: CartItem | null;
  loading: boolean;
  abandonedCartId: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const [guestCart, setGuestCart] = useState<CartItem[]>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [abandonedCartId, setAbandonedCartId] = useState<string | null>(null);

  const cartRef = useMemoFirebase(() => {
    return user && firestore ? doc(firestore, 'carts', user.uid) : null;
  }, [user, firestore]);

  const { data: remoteCartDoc, loading: remoteCartLoading } = useDoc<{ items: CartItem[] }>(cartRef);

  useEffect(() => {
    if (!user && !userLoading) {
      const storedCart = localStorage.getItem('maratonaFacilCart');
      if (storedCart) {
        try {
          const parsedCart = JSON.parse(storedCart);
          if (Array.isArray(parsedCart)) {
            setGuestCart(parsedCart);
          }
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
        }
      }
      setLocalLoading(false);
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (!user && !userLoading) {
      localStorage.setItem('maratonaFacilCart', JSON.stringify(guestCart));
    }
  }, [guestCart, user, userLoading]);

  useEffect(() => {
    const findOrCreateCartId = async () => {
      if (!firestore || userLoading) return;
  
      if (user) {
        // Usuário logado. Verificar se há um carrinho de convidado para migrar.
        const guestAbandonedCartId = sessionStorage.getItem('abandonedCartId');
        if (guestAbandonedCartId) {
          const guestRef = doc(firestore, 'abandonedCarts', guestAbandonedCartId);
          const userRef = doc(firestore, 'abandonedCarts', user.uid);
          
          const guestSnap = await getDoc(guestRef);
          if (guestSnap.exists()) {
            // O carrinho abandonado do convidado existe, vamos movê-lo.
            const guestData = guestSnap.data();
            
            // Faremos o merge com qualquer carrinho abandonado pré-existente do usuário.
            await setDoc(userRef, {
              ...guestData, // Pega todos os dados do carrinho de convidado
              userId: user.uid, // E atribui ao usuário
              customerEmail: user.email,
              customerName: user.displayName,
            }, { merge: true });
            
            // Apaga o documento do carrinho de convidado antigo
            await deleteDoc(guestRef);
          }
          // Limpa o session storage
          sessionStorage.removeItem('abandonedCartId');
        }
        // O ID para o usuário logado é sempre seu UID
        setAbandonedCartId(user.uid);
      } else {
        // Usuário é um convidado. Usar ou criar um ID no sessionStorage.
        let guestCartId = sessionStorage.getItem('abandonedCartId');
        if (!guestCartId) {
          guestCartId = doc(collection(firestore, 'abandonedCarts')).id;
          sessionStorage.setItem('abandonedCartId', guestCartId);
        }
        setAbandonedCartId(guestCartId);
      }
    };
    
    findOrCreateCartId();
  
  }, [user, firestore, userLoading]);

  useEffect(() => {
    if (user && firestore && guestCart.length > 0 && !remoteCartLoading) {
      const mergeAndClearGuestCart = async () => {
        const currentRemoteItems = remoteCartDoc?.items || [];
        const mergedItems = [...currentRemoteItems];

        guestCart.forEach(localItem => {
          const existingIndex = mergedItems.findIndex(
            remoteItem => remoteItem.raceId === localItem.raceId && remoteItem.option.distance === localItem.option.distance
          );
          if (existingIndex > -1) {
            mergedItems[existingIndex].quantity += localItem.quantity;
          } else {
            mergedItems.push(localItem);
          }
        });

        if (cartRef) {
          await setDoc(cartRef, { items: mergedItems });
        }
        
        setGuestCart([]);
        localStorage.removeItem('maratonaFacilCart');
      };
      
      mergeAndClearGuestCart();
    }
  }, [user, firestore, guestCart, cartRef, remoteCartDoc, remoteCartLoading]);

  const cart = user ? remoteCartDoc?.items || [] : guestCart;
  const loading = user ? userLoading || remoteCartLoading : localLoading;
  
  const racesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'races')) : null, [firestore]);
  const { data: races } = useCollection<Race>(racesQuery);

  const { totalItems, subtotal, totalPrice, bonusApplied, freeItem } = useMemo(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.option.lots[0].price * item.quantity), 0);
    
    let bonusApplied = false;
    let freeItem: CartItem | null = null;
    
    const itemsWithPrice = cart.map(item => ({
        ...item,
        price: item.option.lots[0]?.price ?? 0
    }));

    if (totalItems >= 11) {
        bonusApplied = true;
        let lowestPrice = Infinity;
        let freeItemCandidate: CartItem | null = null;

        itemsWithPrice.forEach(item => {
            if (item.price > 0 && item.price < lowestPrice) {
                lowestPrice = item.price;
                freeItemCandidate = item;
            }
        });
        
        freeItem = freeItemCandidate;
    }
    
    const totalPriceValue = itemsWithPrice.reduce((sum, item) => {
        if (freeItem && item.option.distance === freeItem.option.distance && item.raceId === freeItem.raceId) {
            if (item.quantity > 1) {
                return sum + item.price * (item.quantity - 1);
            }
            return sum;
        }
        return sum + item.price * item.quantity;
    }, 0);

    return { totalItems, subtotal, totalPrice: totalPriceValue, bonusApplied, freeItem };
  }, [cart]);

  useEffect(() => {
    const syncAbandonedCart = async () => {
      if (loading || !firestore || !abandonedCartId) {
        return;
      }
      
      const abandonedCartRef = doc(firestore, 'abandonedCarts', abandonedCartId);

      if (cart.length > 0) {
        const dataToSave = {
          userId: user?.uid ?? null,
          customerEmail: user?.email || '',
          customerName: user?.displayName || 'Convidado',
          items: cart,
          totalAmount: totalPrice,
          status: 'ACTIVE' as const,
          lastActivityAt: serverTimestamp(),
        };
        const docSnap = await getDoc(abandonedCartRef);
        if (!docSnap.exists()) {
             await setDoc(abandonedCartRef, { ...dataToSave, createdAt: serverTimestamp() });
        } else {
             await setDoc(abandonedCartRef, dataToSave, { merge: true });
        }
      } else {
        const docSnap = await getDoc(abandonedCartRef);
        if(docSnap.exists() && docSnap.data().status !== 'CONVERTED') {
            await deleteDoc(abandonedCartRef).catch(() => {});
        }
      }
    };
    syncAbandonedCart();
  }, [cart, totalPrice, abandonedCartId, firestore, user, loading]);

  const updateFirestoreCart = async (items: CartItem[]) => {
    if (cartRef) {
      if (items.length > 0) {
        await setDoc(cartRef, { items });
      } else {
        await deleteDoc(cartRef).catch(() => {});
      }
    }
  };

  const addToCart = (raceId: string, option: RaceOption, quantity: number) => {
    const race = races?.find((r) => r.id === raceId);
    if (!race) return;

    const currentCart = user ? remoteCartDoc?.items || [] : guestCart;
    const existingItemIndex = currentCart.findIndex(
      (item) => item.option.distance === option.distance && item.raceId === raceId
    );

    let updatedCart;
    if (existingItemIndex > -1) {
      updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity += quantity;
    } else {
      updatedCart = [...currentCart, { raceId, raceName: race.name, raceImage: race.image, option, quantity }];
    }

    if (user) {
      updateFirestoreCart(updatedCart);
    } else {
      setGuestCart(updatedCart);
    }
  };

  const removeFromCart = (itemId: string) => {
    const currentCart = user ? remoteCartDoc?.items || [] : guestCart;
    const updatedCart = currentCart.filter((item) => item.option.distance !== itemId);

    if (user) {
      updateFirestoreCart(updatedCart);
    } else {
      setGuestCart(updatedCart);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const currentCart = user ? [...(remoteCartDoc?.items || [])] : [...guestCart];
    let updatedCart;
  
    if (quantity < 1) {
      updatedCart = currentCart.filter((item) => item.option.distance !== itemId);
    } else {
      const itemIndex = currentCart.findIndex(item => item.option.distance === itemId);
      if (itemIndex > -1) {
        currentCart[itemIndex] = { ...currentCart[itemIndex], quantity };
        updatedCart = currentCart;
      } else {
        return; // Item not found, do nothing
      }
    }
  
    if (user) {
      updateFirestoreCart(updatedCart);
    } else {
      setGuestCart(updatedCart);
    }
  };
  

  const clearCart = () => {
    if (user) {
      updateFirestoreCart([]);
    } else {
      setGuestCart([]);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, totalPrice, bonusApplied, freeItem, loading, abandonedCartId }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

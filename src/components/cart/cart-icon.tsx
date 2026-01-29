'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/cart-context';
import { cn } from '@/lib/utils';

export function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative p-2" aria-label={`Carrinho com ${totalItems} itens`}>
      <ShoppingCart className="h-5 w-5" />
      {totalItems > 0 && (
        <span
          className={cn(
            'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground',
            'animate-in zoom-in-50'
          )}
        >
          {totalItems}
        </span>
      )}
    </Link>
  );
}

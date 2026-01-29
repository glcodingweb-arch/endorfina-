
'use client';
import { redirect } from 'next/navigation';

// This page is an alias. The actual logic is in /checkout/page.tsx
export default function IdentificationPage() {
    redirect('/checkout');
}

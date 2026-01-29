
'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import './print.css';

function PrintContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const race = searchParams.get('race');
  const code = searchParams.get('code');
  const bibNumber = searchParams.get('bib');
  const shirtSize = searchParams.get('shirt');

  useEffect(() => {
    // Atraso para garantir que o DOM esteja pronto antes de imprimir
    const timer = setTimeout(() => window.print(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-container bg-white text-black p-8">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <div className="flex items-center gap-3">
          <Logo />
        </div>
        <h1 className="text-2xl font-bold">Comprovante de Retirada de Kit</h1>
      </header>
      
      <main className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Corredor(a)</p>
            <p className="text-2xl font-semibold">{name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Corrida</p>
            <p className="text-xl font-medium">{race || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Nº de Peito (BIB)</p>
            <p className="text-2xl font-bold text-red-600">{bibNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Tamanho da Camiseta</p>
            <p className="text-xl font-medium">{shirtSize || 'N/A'}</p>
          </div>
           <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider">Data da Retirada</p>
            <p className="text-lg">{new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
        <div className="col-span-1 flex flex-col items-center justify-center">
            {code && (
                <Image
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`}
                    alt="QR Code de validação"
                    width={150}
                    height={150}
                    unoptimized
                />
            )}
             <p className="text-xs text-gray-500 mt-2 text-center">Este comprovante confirma a retirada do seu kit. Guarde-o com segurança.</p>
        </div>
      </main>

      <footer className="mt-12 text-center no-print">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Novamente
        </Button>
      </footer>
    </div>
  );
}


export default function PrintValidationPage() {
    return (
        <Suspense fallback={<div className="text-center p-8">Carregando comprovante...</div>}>
            <PrintContent />
        </Suspense>
    )
}

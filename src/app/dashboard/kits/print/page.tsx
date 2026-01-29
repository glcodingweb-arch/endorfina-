

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
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
  const kitType = searchParams.get('kit') || 'Padrão';
  const modality = searchParams.get('modality');

  useEffect(() => {
    // Small delay to ensure DOM is ready before printing
    const timer = setTimeout(() => window.print(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="print-container">
       <div className='ticket-card'>
        <div className='qr-sector'>
          <div className='qr-box'>
            {code && (
              <Image
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(code)}`}
                alt='QR Code de Validação'
                width={140}
                height={140}
                unoptimized
              />
            )}
          </div>
          <p className='text-white/60 text-[10px] mt-4 font-bold tracking-widest uppercase'>Escaneie para Validar</p>
        </div>
        <div className='main-content-area'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-4xl font-black text-slate-900 tracking-tighter italic'>{race ? race.substring(0, 3).toUpperCase() : 'EVT'}</h1>
              <p className='text-slate-500 font-bold text-sm tracking-wide'>SÃO PAULO EDITION</p>
            </div>
            {modality && <div className='badge-modality'>{modality}</div>}
          </div>
          <div className='mt-8 grid grid-cols-2 gap-y-6'>
            <div className='flex flex-col'>
              <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>Nº de Peito</span>
              <span className='text-2xl font-black text-slate-800'>#{bibNumber || 'N/A'}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>Status do Kit</span>
              <span className='inline-block w-fit px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[11px] font-bold mt-1'>AGUARDANDO</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>Nome do Atleta</span>
              <span className='text-lg font-bold text-slate-700 truncate'>{name || 'N/A'}</span>
            </div>
            <div className='flex flex-col'>
              <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>Camiseta / Kit</span>
              <span className='text-lg font-bold text-slate-700'>{shirtSize || 'N/A'} / {kitType}</span>
            </div>
          </div>
          <svg className='route-line' viewBox='0 0 100 40'>
            <path d='M0 35 Q 25 35, 30 20 T 60 20 T 100 5' stroke='#e2e8f0' strokeDasharray='4 2' fill='none' strokeWidth='2'/>
          </svg>
        </div>
      </div>

      <footer className="mt-8 text-center no-print">
        <Button onClick={() => window.print()} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Comprovante
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

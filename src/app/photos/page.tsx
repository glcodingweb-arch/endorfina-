'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import type { Race } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';


function EventPhotoCard({ event }: { event: Race }) {
    const imageUrl = event.image?.startsWith('http')
        ? event.image
        : PlaceHolderImages.find(p => p.id === event.image)?.imageUrl;

    const eventDate = new Date(event.date);
    eventDate.setMinutes(eventDate.getMinutes() + eventDate.getTimezoneOffset());

    return (
        <a 
            href={event.photoGalleryUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full max-w-sm mx-auto shadow-2xl shadow-black/40 transition-transform duration-500 ease-out hover:-translate-y-2"
        >
            <div className='relative bg-slate-950 rounded-sm overflow-hidden'>
                <div className='relative h-80 overflow-hidden'>
                    {imageUrl && (
                        <Image
                            src={imageUrl}
                            alt={event.name}
                            fill
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    )}
                    <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent'></div>
                </div>

                <div className='relative z-10 p-8 -mt-16'>
                    <span className='block text-primary text-xs font-bold uppercase tracking-[0.2em] mb-2'>
                        {event.location.split(',')[0].trim()} • {event.location.split(',')[1]?.trim()}
                    </span>
                    <h2 className='text-white text-4xl font-light leading-none tracking-tighter mb-3'>
                        {event.name.split(' ').slice(0, -1).join(' ')} <span className='font-black italic'>{event.name.split(' ').pop()}</span>
                    </h2>
                    
                    <div className='flex justify-between items-center border-t border-slate-800 pt-4 mb-8 text-xs text-slate-400'>
                        <span>Fotos por <strong>{event.organizerId || 'PROSHOT MEDIA'}</strong></span>
                        <span>1.2k Fotos</span>
                    </div>

                    <div className='group/button bg-white text-black flex items-center justify-between py-1 pl-6 pr-1 rounded-full font-bold text-sm transition-colors hover:bg-primary hover:text-white'>
                        <span>VER FOTOS DA CORRIDA</span>
                        <div className='w-11 h-11 bg-slate-800 rounded-full flex items-center justify-center text-xl text-white transition-colors group-hover/button:bg-white group-hover/button:text-black'>
                            →
                        </div>
                    </div>
                </div>
            </div>
        </a>
    );
}

export default function GalleryPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const firestore = useFirestore();

  const racesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'races'),
      where('photoGalleryUrl', '!=', null),
      orderBy('photoGalleryUrl'),
      orderBy('date', 'desc')
    );
  }, [firestore]);

  const { data: races, loading } = useCollection<Race>(racesQuery);

  const filteredEvents = useMemo(() => {
    if (!races) return [];
    return races.filter(event => 
        (event.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        event.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
        event.photoGalleryUrl
    );
  }, [races, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-20 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-2xl mb-12">
          <Button onClick={() => router.back()} variant="ghost" className="text-primary font-bold text-sm mb-6 flex items-center gap-2 group pl-0 hover:text-primary">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Button>
           <div className="flex items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
             </div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Galeria Oficial</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
            Encontre sua <span className="text-primary">Foto</span>
          </h1>
          <p className="text-slate-500 mt-4 text-lg font-medium leading-relaxed">
            Nossos fotógrafos capturaram cada gota de suor. Localize a prova que você participou e reviva o momento.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-xl shadow-purple-100/30 mb-12 flex flex-col md:flex-row gap-4 items-center sticky top-24 z-20">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input 
                type="text" 
                placeholder="Qual prova você correu?" 
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all font-bold text-slate-700 h-14"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>

        {/* Grid de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
           {loading && Array.from({length: 3}).map((_, i) => (
             <div key={i} className="w-full max-w-sm mx-auto">
                <Skeleton className="h-[520px] w-full rounded-sm" />
             </div>
           ))}
           {!loading && filteredEvents.map((event) => (
                <EventPhotoCard key={event.id} event={event} />
           ))}
        </div>

        {!loading && filteredEvents.length === 0 && (
           <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
              <p className="text-slate-400 font-bold text-lg">Nenhuma galeria de fotos encontrada.</p>
              <button onClick={() => setSearchTerm('')} className="mt-4 text-primary font-black text-xs uppercase tracking-widest hover:underline">Limpar busca</button>
           </div>
        )}
      </div>
    </div>
  );
};

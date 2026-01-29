'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import type { Race, RaceTag } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';

import { Header } from '@/components/layout/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function RacesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const firestore = useFirestore();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('city') || '');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const containerRef = useRef<HTMLDivElement>(null);

  const racesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'races'), orderBy('date', 'asc'));
  }, [firestore]);
  
  const tagsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'raceTags'), orderBy('name', 'asc'));
  }, [firestore]);

  const { data: races, loading: loadingRaces } = useCollection<Race>(racesQuery);
  const { data: tags, loading: loadingTags } = useCollection<RaceTag>(tagsQuery);
  
  const loading = loadingRaces || loadingTags;
  
  const categories = useMemo(() => {
      const allTags = tags?.map(t => ({ name: t.name, tip: t.description || t.name })) ?? [];
      return [{ name: 'Todos', tip: 'Todas as provas disponíveis' }, ...allTags];
  }, [tags]);

  const filteredRaces = useMemo(() => {
    if (!races) return [];
    return races.filter(race => {
      const matchesSearch = race.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           race.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = activeCategory === 'Todos' || race.tags?.includes(activeCategory);

      return matchesSearch && matchesCategory;
    });
  }, [races, searchTerm, activeCategory]);
  
  const uniqueLocations = useMemo(() => {
    if (!races) return 0;
    const locations = new Set(races.map(race => race.location.split(',')[0].trim()));
    return locations.size;
  }, [races]);

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 pt-24 sm:pt-28 pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={containerRef}>
          
          <div className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Button onClick={() => router.back()} variant="ghost" className="text-primary hover:text-primary-dark font-bold text-xs sm:text-sm flex items-center gap-1 pl-0">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Button>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter">
                Calendário <span className="text-primary">2025</span>
              </h1>
            </div>
            <div className="bg-white px-5 py-3 sm:px-6 sm:py-4 rounded-2xl sm:rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-6 sm:gap-8 self-start md:self-auto">
              <div className="text-center">
                 <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Eventos</p>
                 <p className="text-lg sm:text-xl font-black text-slate-900">{races?.length ?? 0}</p>
              </div>
              <div className="w-px h-6 bg-slate-100"></div>
              <div className="text-center">
                 <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Cidades</p>
                 <p className="text-lg sm:text-xl font-black text-slate-900">{uniqueLocations}</p>
              </div>
            </div>
          </div>

          <div className="mb-8 sm:mb-12 space-y-4">
            <div className="bg-white/90 backdrop-blur-xl p-3 sm:p-4 rounded-[2rem] sm:rounded-[2.5rem] border border-white shadow-2xl flex flex-col gap-4">
              <div className="relative w-full">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Procurar prova ou cidade..." 
                   className="w-full pl-12 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all font-bold text-slate-700 text-sm"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>

              <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 scrollbar-hide -mx-1 px-1">
                <TooltipProvider>
                    {categories.map(cat => (
                         <Tooltip key={cat.name}>
                            <TooltipTrigger asChild>
                                <button 
                                    key={cat.name}
                                    onClick={() => setActiveCategory(cat.name)}
                                    className={`px-4 py-2.5 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${activeCategory === cat.name ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                >
                                    {cat.name.toUpperCase()}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{cat.tip}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </TooltipProvider>
              </div>
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[420px] w-full rounded-[2.5rem]" />)}
            </div>
          )}

          {!loading && filteredRaces.length > 0 && (
            <div className="mx-auto w-fit grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {filteredRaces.map((race, index) => {
                  const raceDate = new Date(race.date);
                  raceDate.setMinutes(raceDate.getMinutes() + raceDate.getTimezoneOffset());
                  const price = race.options[0]?.lots[0]?.price ?? 0;
                  const imageUrl = race.image?.startsWith('http')
                    ? race.image
                    : PlaceHolderImages.find(p => p.id === race.image)?.imageUrl || `https://picsum.photos/seed/${race.id}/400/400`;

                  return (
                    <div 
                      key={race.id} 
                      className="group bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
                      onClick={() => router.push(`/races/${race.id}`)}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      <div className="relative h-48 sm:h-56 overflow-hidden">
                        <Image src={imageUrl} className="w-full h-full object-cover" alt={race.name} width={400} height={400} />
                        <div className="absolute top-4 left-4">
                          <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-xl text-[9px] sm:text-[10px] font-black text-primary shadow-lg uppercase tracking-tight">
                            {raceDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '')}
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 mb-3 leading-tight flex-1">{race.name}</h3>
                        <div className="flex flex-wrap gap-1 mb-6">
                          {race.distance.split(',').map(d => (
                            <span key={d} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-bold text-slate-400">{d.trim()}</span>
                          ))}
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                          <div>
                            <span className="block text-[8px] font-black text-slate-300 uppercase">Preço</span>
                            <span className="text-base sm:text-lg font-black text-slate-900">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)}</span>
                          </div>
                          <div className="w-10 h-10 bg-purple-50 text-primary rounded-xl flex items-center justify-center">
                            <ArrowRight className="w-5 h-5" strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
          
          {!loading && filteredRaces.length === 0 && (
             <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h2 className="text-2xl font-bold">Nenhuma corrida encontrada</h2>
              <p className="text-muted-foreground mt-2">
                Ajuste os filtros e tente novamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

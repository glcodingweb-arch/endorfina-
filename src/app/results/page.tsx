
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, ArrowLeft, Trophy, Crown, Medal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Race, RaceResult } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SkeletonRow = () => (
  <TableRow className="animate-pulse">
    <TableCell className="py-4 px-8"><Skeleton className="h-10 w-10 rounded-xl" /></TableCell>
    <TableCell className="py-4 px-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-32 rounded" />
      </div>
    </TableCell>
    <TableCell className="py-4 px-8"><Skeleton className="h-4 w-12 rounded" /></TableCell>
    <TableCell className="py-4 px-8"><Skeleton className="h-4 w-20 rounded" /></TableCell>
    <TableCell className="py-4 px-8"><Skeleton className="h-8 w-24 rounded-lg" /></TableCell>
    <TableCell className="py-4 px-8 text-right"><Skeleton className="h-6 w-24 rounded ml-auto" /></TableCell>
  </TableRow>
);

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-orange-500" />;
    return <span className="font-mono text-lg font-bold text-slate-500">{rank}</span>;
}

export default function ResultsPage() {
  const router = useRouter();
  const [selectedRace, setSelectedRace] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const firestore = useFirestore();

  const racesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'races'), orderBy('date', 'desc')) : null, [firestore]);
  const { data: races, loading: loadingRaces } = useCollection<Race>(racesQuery);

  useEffect(() => {
    if (races && races.length > 0 && !selectedRace) {
      setSelectedRace(races[0].id);
    }
  }, [races, selectedRace]);

  const resultsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedRace) return null;
    return query(collection(firestore, 'results'), where('raceId', '==', selectedRace), orderBy('overallPosition', 'asc'));
  }, [firestore, selectedRace]);

  const { data: results, loading: loadingResults } = useCollection<RaceResult>(resultsQuery);
  
  const leaderboard = useMemo(() => {
    if (!results) return [];
    if (!searchTerm) return results;
    return results.filter(a => a.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) || a.bibNumber.includes(searchTerm));
  }, [results, searchTerm]);
  
  const isLoading = loadingRaces || loadingResults;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50 pt-28 pb-20 animate-in fade-in duration-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="max-w-xl">
              <Button onClick={() => router.back()} variant="ghost" className="text-primary font-bold text-sm mb-4 flex items-center gap-2 group pl-0 hover:text-primary">
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Voltar
              </Button>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
                CENTRAL DE <span className="text-primary">RESULTADOS</span>
              </h1>
              <p className="text-slate-500 mt-3 text-lg font-medium">Consulte os tempos oficiais e classificações.</p>
            </div>
            <div className="w-full md:w-auto">
              {loadingRaces ? <Skeleton className="h-12 w-full md:w-72" /> : (
                <Select value={selectedRace ?? ''} onValueChange={(val) => setSelectedRace(val)}>
                    <SelectTrigger className="w-full md:w-72 h-12 bg-white text-base">
                        <SelectValue placeholder="Selecione uma corrida..." />
                    </SelectTrigger>
                    <SelectContent>
                        {races?.map(race => <SelectItem key={race.id} value={race.id}>{race.name}</SelectItem>)}
                    </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <Card className="mb-10 p-6 rounded-[2rem] shadow-2xl shadow-purple-100/20">
            <CardContent className="p-0 flex flex-col md:flex-row gap-6 items-center">
              <div className="relative flex-1 w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <Input 
                    type="text" 
                    placeholder="Buscar atleta pelo nome ou número de peito..." 
                    className="w-full pl-14 pr-6 py-5 h-auto bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-primary focus:outline-none transition-all font-bold text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
            </CardContent>
          </Card>

          <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                      <TableRow className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <TableHead className="py-6 px-8">Rank</TableHead>
                        <TableHead className="py-6 px-8">Atleta</TableHead>
                        <TableHead className="py-6 px-8">Nº Peito</TableHead>
                        <TableHead className="py-6 px-8">Categoria</TableHead>
                        <TableHead className="py-6 px-8 text-right">Tempo Líquido</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-50">
                      {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                      ) : (
                        leaderboard.map((athlete) => (
                          <TableRow key={athlete.id} className="group hover:bg-slate-50/50 transition-colors">
                            <TableCell className="py-4 px-8">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm`}>
                                  <RankIcon rank={athlete.overallPosition} />
                                </div>
                            </TableCell>
                            <TableCell className="py-4 px-8">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                                    {athlete.athleteName.charAt(0)}
                                  </div>
                                  <span className="font-black text-slate-900 group-hover:text-primary transition-colors">{athlete.athleteName}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-4 px-8 text-xs font-bold text-slate-400">#{athlete.bibNumber}</TableCell>
                            <TableCell className="py-4 px-8 text-sm font-bold text-slate-600">{athlete.categoryPosition}º {athlete.category}</TableCell>
                            <TableCell className="py-4 px-8 text-right font-black text-slate-900 tabular-nums">{athlete.netTime}</TableCell>
                          </TableRow>
                        ))
                      )}
                  </TableBody>
                </Table>
            </div>
            {!isLoading && leaderboard.length === 0 && (
              <div className="py-32 text-center text-slate-400 font-bold">Nenhum resultado encontrado para esta busca.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

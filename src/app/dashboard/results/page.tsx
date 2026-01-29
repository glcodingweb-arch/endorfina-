
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where } from 'firebase/firestore';
import type { RaceResult } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-orange-500" />;
    return <span className="font-mono text-lg font-bold text-slate-500">{rank}</span>;
}

// Client-side component to format date safely
const RaceDate = ({ date }: { date: string | undefined }) => {
    const [formattedDate, setFormattedDate] = useState('');
    useEffect(() => {
        if (date) {
            setFormattedDate(new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }));
        }
    }, [date]);
    return <>{formattedDate}</>;
}


export default function ResultsPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const userResultsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'results'), where('userId', '==', user.uid));
    }, [firestore, user]);

    const { data: userResults, loading: loadingResults } = useCollection<RaceResult>(userResultsQuery);
    
    const resultsByRace = useMemo(() => {
        if (!userResults) return new Map<string, RaceResult[]>();
        
        const grouped = new Map<string, RaceResult[]>();

        userResults.forEach(res => {
            if (!grouped.has(res.raceId)) {
                grouped.set(res.raceId, []);
            }
            grouped.get(res.raceId)!.push(res);
        });

        return grouped;
    }, [userResults]);
    
    const loading = loadingResults;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Meus Resultados</h1>
        <p className="text-muted-foreground">Confira seus tempos e classificações em todos os eventos.</p>
      </header>
       
       {loading && (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
       )}

       {!loading && resultsByRace.size === 0 && (
         <Card>
            <CardContent className="text-center py-16">
                <h3 className="text-xl font-semibold">Nenhum resultado encontrado</h3>
                <p className="text-muted-foreground mt-2">Os resultados aparecerão aqui após as corridas.</p>
            </CardContent>
         </Card>
       )}

       {!loading && Array.from(resultsByRace.entries()).map(([raceId, results]) => {
         const raceInfo = results[0];
         return (
            <Card key={raceId}>
                <CardHeader>
                    <CardTitle>{raceInfo?.raceName ?? 'Corrida'}</CardTitle>
                    <CardDescription>
                        <RaceDate date={raceInfo?.raceDate} />
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Pos. Geral</TableHead>
                            <TableHead>Atleta</TableHead>
                            <TableHead>Nº Peito</TableHead>
                            <TableHead>Pos. Cat.</TableHead>
                            <TableHead>Tempo Líquido</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                         {results.sort((a,b) => a.overallPosition - b.overallPosition).map(result => (
                            <TableRow key={result.id}>
                                <TableCell>
                                    <div className="w-10 h-10 flex items-center justify-center">
                                        <RankIcon rank={result.overallPosition} />
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{result.athleteName}</TableCell>
                                <TableCell>#{result.bibNumber}</TableCell>
                                <TableCell>{result.categoryPosition}º ({result.category})</TableCell>
                                <TableCell className="font-semibold tabular-nums">{result.netTime}</TableCell>
                            </TableRow>
                         ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        )})}
    </div>
  );
}

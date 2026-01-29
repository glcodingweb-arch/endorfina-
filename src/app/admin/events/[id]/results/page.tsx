
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { collection, doc, query, orderBy, where } from 'firebase/firestore';
import type { Race, RaceResult, Participant } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { EventAdminTabs } from '@/components/admin/event-admin-tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, BarChart2, Megaphone } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/stats-card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';

// Helper function to parse HH:MM:SS time string into seconds
const timeToSeconds = (time: string): number => {
    if (!time || !/^\d{2}:\d{2}:\d{2}$/.test(time)) return 0;
    const parts = time.split(':').map(Number);
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
};

// Helper function to format seconds into HH:MM:SS
const secondsToTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === 0) return '00:00:00';
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};


export default function EventResultsPage() {
    const router = useRouter();
    const params = useParams();
    const firestore = useFirestore();
    const raceId = params.id as string;

    const raceRef = useMemoFirebase(() => {
        if (!firestore || !raceId) return null;
        return doc(firestore, 'races', raceId);
    }, [firestore, raceId]);

    const { data: raceData, loading: loadingRace } = useDoc<Race>(raceRef);

    const resultsQuery = useMemoFirebase(() => {
        if (!firestore || !raceId) return null;
        return query(collection(firestore, 'results'), where('raceId', '==', raceId), orderBy('overallPosition'));
    }, [firestore, raceId]);
    
    const { data: results, loading: loadingResults } = useCollection<RaceResult>(resultsQuery);
    
    const participantsQuery = useMemoFirebase(() => {
        if (!firestore || !raceId) return null;
        return query(collection(firestore, 'participants'), where('raceId', '==', raceId));
    }, [firestore, raceId]);

    const { data: participants, loading: loadingParticipants } = useCollection<Participant>(participantsQuery);

    const { winnerTime, averageTime, totalFinishers, timeDistributionData, finisherPercentageDescription } = useMemo(() => {
        if (!results || !participants) {
            return { winnerTime: 'N/A', averageTime: 'N/A', totalFinishers: 0, timeDistributionData: [], finisherPercentageDescription: 'Calculando...' };
        }

        const totalFinishers = results.length;
        const totalParticipants = participants.length;
        const finisherPercentage = totalParticipants > 0 ? (totalFinishers / totalParticipants) * 100 : 0;
        const finisherPercentageDescription = totalParticipants > 0 ? `${finisherPercentage.toFixed(0)}% dos inscritos` : 'N/A';

        const winnerTime = results[0]?.netTime || 'N/A';

        const totalSeconds = results.reduce((acc, res) => acc + timeToSeconds(res.netTime), 0);
        const averageSeconds = totalFinishers > 0 ? totalSeconds / totalFinishers : 0;
        const averageTime = secondsToTime(averageSeconds);
        
        const timeGroups = {
            'sub 3h': 0,
            '3h-3h30': 0,
            '3h30-4h': 0,
            '4h+': 0,
        };

        results.forEach(res => {
            const seconds = timeToSeconds(res.netTime);
            if (seconds < 10800) timeGroups['sub 3h']++; // < 3h
            else if (seconds < 12600) timeGroups['3h-3h30']++; // < 3h30
            else if (seconds < 14400) timeGroups['3h30-4h']++; // < 4h
            else timeGroups['4h+']++;
        });

        const timeDistributionData = Object.entries(timeGroups).map(([timeRange, count]) => ({
            timeRange,
            count,
        }));

        return { winnerTime, averageTime, totalFinishers, timeDistributionData, finisherPercentageDescription };

    }, [results, participants]);

    const loading = loadingRace || loadingResults || loadingParticipants;

    if (loading) {
        return (
            <>
                <Skeleton className="h-10 w-1/3 mb-8" />
                <Skeleton className="h-12 w-full mb-4" />
                <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
            </>
        );
    }

    if (!raceData) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold">Corrida não encontrada.</h1>
                <Button onClick={() => router.push('/admin/events')} className="mt-4">
                    Voltar para Eventos
                </Button>
            </div>
        );
    }

    return (
        <>
             <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight">Gerenciar: {raceData.name}</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Análise de resultados e performance dos atletas.
                </p>
            </div>

            <EventAdminTabs raceId={raceId} />

             {(!results || results.length === 0) ? (
                 <Card className="mt-8">
                     <CardHeader>
                         <CardTitle>Resultados</CardTitle>
                     </CardHeader>
                     <CardContent className="text-center py-16">
                        <p className="text-muted-foreground">Nenhum resultado foi importado para este evento ainda.</p>
                     </CardContent>
                 </Card>
             ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                        <StatsCard title="Tempo do Vencedor" value={winnerTime} icon={Trophy} description={results[0]?.athleteName || ''} />
                        <StatsCard title="Tempo Médio Geral" value={averageTime} icon={Clock} description="Média de todos os concluintes" />
                        <StatsCard title="Total de Concluintes" value={totalFinishers.toString()} icon={BarChart2} description={finisherPercentageDescription} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                        <div className="lg:col-span-3 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Distribuição de Tempo</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={timeDistributionData}>
                                            <XAxis dataKey="timeRange" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip formatter={(value) => [`${value} atletas`, 'Contagem']} />
                                            <Legend />
                                            <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Atletas" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Comunicação com Atletas</CardTitle>
                                    <CardDescription>Envie notificações pós-prova.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col sm:flex-row gap-2">
                                    <Button className="flex-1">
                                        <Megaphone className="mr-2 h-4 w-4" /> Notificar sobre Resultados Disponíveis
                                    </Button>
                                    <Button variant="outline" className="flex-1">
                                        Anunciar Fotos e Certificados
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Top 3 - Geral</CardTitle>
                                <CardDescription>Os atletas mais rápidos da prova.</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Pos.</TableHead>
                                            <TableHead>Nome</TableHead>
                                            <TableHead className="text-right">Tempo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {results.slice(0, 3).map((res, index) => (
                                            <TableRow key={res.id}>
                                                <TableCell className="font-bold">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{res.athleteName}</TableCell>
                                                <TableCell className="text-right font-mono">{res.netTime}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                            </Table>
                            </CardContent>
                        </Card>
                    </div>
                </>
             )}
        </>
    );
}


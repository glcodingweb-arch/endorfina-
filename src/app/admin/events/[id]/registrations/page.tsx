
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { collection, doc, query, where } from 'firebase/firestore';
import type { Race, Participant } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { EventAdminTabs } from '@/components/admin/event-admin-tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, BarChart2, UserCheck, UserX } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StatsCard } from '@/components/stats-card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Link from 'next/link';
import { useMemo } from 'react';

const statusConfig: Record<Participant['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    'IDENTIFICADA': { label: 'Identificado', variant: 'default' },
    'PENDENTE_IDENTIFICACAO': { label: 'Pendente', variant: 'secondary' },
    'VALIDADA': { label: 'Validado', variant: 'default' },
    'BLOQUEADA': { label: 'Bloqueado', variant: 'destructive' },
};


export default function EventRegistrationsPage() {
    const router = useRouter();
    const params = useParams();
    const firestore = useFirestore();
    const raceId = params.id as string;

    const raceRef = useMemoFirebase(() => {
        if (!firestore || !raceId) return null;
        return doc(firestore, 'races', raceId);
    }, [firestore, raceId]);

    const { data: raceData, loading: loadingRace } = useDoc<Race>(raceRef);

    const registrationsQuery = useMemoFirebase(() => {
        if (!firestore || !raceId) return null;
        return query(collection(firestore, 'participants'), where('raceId', '==', raceId));
    }, [firestore, raceId]);

    const { data: registrations, loading: loadingRegistrations } = useCollection<Participant>(registrationsQuery);
    
    const recentRegistrations = useMemo(() => {
        if (!registrations) return [];
        // Sort by creation time if available, otherwise just slice
        return registrations.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 5);
    }, [registrations]);


    const { ageDistributionData, averageAge, paidRegistrations, pendingIdentification } = useMemo(() => {
        if (!registrations) {
            return { ageDistributionData: [], averageAge: 0, paidRegistrations: 0, pendingIdentification: 0 };
        }
        
        const ageGroups = { '18-24': 0, '25-29': 0, '30-39': 0, '40-49': 0, '50+': 0 };
        let totalAge = 0;

        registrations.forEach(reg => {
            if (reg.userProfile?.birthDate) {
              const birthDate = new Date(reg.userProfile.birthDate);
              const age = new Date().getFullYear() - birthDate.getFullYear();
              totalAge += age;
              if (age >= 18 && age <= 24) ageGroups['18-24']++;
              else if (age >= 25 && age <= 29) ageGroups['25-29']++;
              else if (age >= 30 && age <= 39) ageGroups['30-39']++;
              else if (age >= 40 && age <= 49) ageGroups['40-49']++;
              else if (age >= 50) ageGroups['50+']++;
            }
        });

        const ageDistributionData = Object.entries(ageGroups).map(([ageGroup, count]) => ({ ageGroup, count }));
        const identifiedCount = registrations.filter(r => r.userProfile?.birthDate).length;
        const averageAge = identifiedCount > 0 ? totalAge / identifiedCount : 0;
        const paidRegistrations = registrations.filter(r => r.status === 'IDENTIFICADA').length;
        const pendingIdentification = registrations.filter(r => r.status === 'PENDENTE_IDENTIFICACAO').length;

        return { ageDistributionData, averageAge, paidRegistrations, pendingIdentification };
    }, [registrations]);


    if (loadingRace || loadingRegistrations) {
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
                    Visualize o resumo das inscrições para este evento.
                </p>
            </div>

            <EventAdminTabs raceId={raceId} />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
                <StatsCard title="Total de Inscritos" value={registrations?.length.toString() ?? '0'} icon={Users} description={`${paidRegistrations} inscrições confirmadas`} />
                <StatsCard title="Média de Idade" value={`${averageAge.toFixed(1)} anos`} icon={BarChart2} description="Faixa etária dominante: 25-39" />
                <StatsCard title="Identificados" value={`${(registrations?.length ?? 0) - pendingIdentification}`} icon={UserCheck} description="Atletas com dados completos" />
                <StatsCard title="Pendentes" value={`${pendingIdentification}`} icon={UserX} description="Aguardando identificação" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição por Faixa Etária</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={ageDistributionData}>
                                <XAxis dataKey="ageGroup" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Inscritos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Inscrições Recentes</CardTitle>
                        <CardDescription>As últimas {recentRegistrations.length} inscrições recebidas.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Atleta</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentRegistrations?.map((reg) => {
                                    const statusInfo = statusConfig[reg.status] ?? {label: reg.status, variant: 'secondary'};
                                    return (
                                        <TableRow key={reg.id} className="cursor-pointer" onClick={() => router.push(`/admin/registrations/${reg.id}`)}>
                                            <TableCell className="font-medium">{reg.userProfile?.fullName ?? 'Pendente'}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                       </Table>
                    </CardContent>
                    <CardFooter>
                         <Button asChild className="w-full">
                            <Link href={`/admin/events/${raceId}/registrations/list`}>
                                <Users className="mr-2 h-4 w-4" /> Ver Lista Completa de Inscritos
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </>
    );
}

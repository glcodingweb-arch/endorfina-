

'use client';

import { Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { doc, collection, query, where, orderBy } from 'firebase/firestore';
import type { Race, Participant } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Printer } from 'lucide-react';
import './print-list.css';

function PrintContent() {
    const router = useRouter();
    const params = useParams();
    const firestore = useFirestore();
    const raceId = params.id as string;

    const raceRef = useMemoFirebase(() => {
        if (!firestore || !raceId) return null;
        return doc(firestore, 'races', raceId);
    }, [firestore, raceId]);

    const { data: raceData, loading: loadingRace } = useDoc<Race>(raceRef);

    const participantsQuery = useMemoFirebase(() => {
        if (!firestore || !raceId) return null;
        return query(
            collection(firestore, 'participants'), 
            where('raceId', '==', raceId),
            orderBy('userProfile.fullName', 'asc')
        );
    }, [firestore, raceId]);

    const { data: participants, loading: loadingParticipants } = useCollection<Participant>(participantsQuery);
    
    if (loadingRace || loadingParticipants) {
        return (
            <div className="print-container p-8">
                <Skeleton className="h-10 w-1/2 mb-4" />
                <Skeleton className="h-6 w-1/3 mb-8" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }

    if (!raceData) {
        return (
             <div className="print-container p-8 text-center">
                <h1 className="text-xl font-bold">Evento não encontrado</h1>
                <Button onClick={() => router.back()} className="mt-4 no-print">Voltar</Button>
            </div>
        )
    }

    const identifiedParticipants = participants?.filter(p => p.status === 'IDENTIFICADA') ?? [];
    
    return (
        <div className="print-container bg-white text-black p-8">
            <header className="mb-8">
                <div className="flex justify-between items-center border-b pb-4">
                    <Logo />
                    <div className="text-right">
                        <h1 className="text-2xl font-bold">Lista de Conferência</h1>
                        <p className="text-muted-foreground">{raceData.name}</p>
                    </div>
                </div>
                 <p className="text-sm text-muted-foreground mt-2">Gerado em: {new Date().toLocaleString('pt-BR')}</p>
            </header>

            <main>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Nº Peito</TableHead>
                            <TableHead>Atleta</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Modalidade</TableHead>
                            <TableHead>Kit</TableHead>
                            <TableHead>Camiseta</TableHead>
                            <TableHead className="w-[100px] text-center">Check</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {identifiedParticipants.map((reg) => (
                            <TableRow key={reg.id}>
                                <TableCell className="font-mono font-bold text-center">{reg.bibNumber || 'N/G'}</TableCell>
                                <TableCell className="font-medium">{reg.userProfile?.fullName}</TableCell>
                                <TableCell>{reg.userProfile?.documentNumber}</TableCell>
                                <TableCell>{reg.modality}</TableCell>
                                <TableCell>{reg.kitType}</TableCell>
                                <TableCell className="text-center">{reg.shirtSize}</TableCell>
                                <TableCell className="text-center">
                                    <div className="w-8 h-8 border-2 border-gray-400 rounded-sm mx-auto"></div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </main>

            <footer className="mt-12 text-center no-print">
                <Button onClick={() => window.print()}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir
                </Button>
            </footer>
        </div>
    );
}

export default function PrintListPage() {
     return (
        <Suspense fallback={<div className="text-center p-8">Carregando lista...</div>}>
            <PrintContent />
        </Suspense>
    )
}

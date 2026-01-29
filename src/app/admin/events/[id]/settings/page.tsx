'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { useDoc, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { doc } from 'firebase/firestore';
import type { Race } from '@/lib/types';
import { EventAdminTabs } from '@/components/admin/event-admin-tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function EventSettingsPage() {
    const router = useRouter();
    const params = useParams();
    const firestore = useFirestore();
    const raceId = params.id as string;

    const raceRef = useMemoFirebase(() => {
        if (!firestore || !raceId) return null;
        return doc(firestore, 'races', raceId);
    }, [firestore, raceId]);

    const { data: raceData, loading: loadingRace } = useDoc<Race>(raceRef);

     if (loadingRace) {
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
                    Ajustes avançados e ações perigosas para este evento.
                </p>
            </div>

            <EventAdminTabs raceId={raceId} />

            <div className="mt-8 max-w-4xl mx-auto">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle>Zona de Perigo</CardTitle>
                        <CardDescription>
                            As ações nesta seção são permanentes e não podem ser desfeitas.
                            Tenha certeza absoluta antes de prosseguir.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Excluir Evento Permanentemente
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento e todos os dados associados a ele, como inscrições e pagamentos.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                        className="bg-destructive hover:bg-destructive/90"
                                        onClick={() => console.log('Excluir evento', raceId)}
                                    >
                                        Sim, excluir este evento
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

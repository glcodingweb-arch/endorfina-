
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useDoc, useFirestore, useCollection } from '@/firebase';
import { collection, doc, query, where, writeBatch, getDoc, updateDoc } from 'firebase/firestore';
import type { Race, Participant } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Printer, Sparkles, AlertTriangle, Loader2, ArrowLeft, MailWarning } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
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

const statusConfig: Record<Participant['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    'IDENTIFICADA': { label: 'Identificado', variant: 'default' },
    'PENDENTE_IDENTIFICACAO': { label: 'Pendente', variant: 'secondary' },
    'VALIDADA': { label: 'Validado', variant: 'default' },
    'BLOQUEADA': { label: 'Bloqueado', variant: 'destructive' },
};


export default function EventRegistrationsListPage() {
    const router = useRouter();
    const params = useParams();
    const firestore = useFirestore();
    const { toast } = useToast();
    const raceId = params.id as string;
    const [isGenerating, setIsGenerating] = useState(false);
    const [isReminding, setIsReminding] = useState(false);

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
    
    const hasExistingBibNumbers = useMemo(() => 
        registrations?.some(p => !!p.bibNumber) ?? false,
    [registrations]);

    const canGenerateBibNumbers = useMemo(() => 
        !hasExistingBibNumbers && (registrations?.length ?? 0) > 0,
    [hasExistingBibNumbers, registrations]);
    
    const generationDisabledMessage = useMemo(() => {
        if (hasExistingBibNumbers) return 'Os números de peito já foram gerados para este evento.';
        if (!registrations || registrations.length === 0) return 'Não há inscritos para gerar números.';
        return '';
    }, [hasExistingBibNumbers, registrations]);

    const handleRemindPending = async () => {
        if (!firestore || !registrations || !raceData) {
            toast({ title: "Erro de sistema", description: "Dados não carregados.", variant: "destructive" });
            return;
        }
    
        setIsReminding(true);
        const pendingParticipants = registrations.filter(p => p.status === 'PENDENTE_IDENTIFICACAO');
        
        if (pendingParticipants.length === 0) {
            toast({ title: "Nenhuma pendência", description: "Não há atletas pendentes de identificação." });
            setIsReminding(false);
            return;
        }
    
        const pendingByOrder = new Map<string, { count: number; orderPromise: Promise<any> }>();
        pendingParticipants.forEach(p => {
            if (p.orderId) {
                if (!pendingByOrder.has(p.orderId)) {
                    const orderRef = doc(firestore, 'orders', p.orderId);
                    pendingByOrder.set(p.orderId, {
                        count: 0,
                        orderPromise: getDoc(orderRef)
                    });
                }
                pendingByOrder.get(p.orderId)!.count++;
            }
        });
    
        toast({ title: 'Enviando lembretes...', description: `Preparando para notificar ${pendingByOrder.size} responsáveis.` });
        
        let successCount = 0;
        let errorCount = 0;
    
        for (const [orderId, data] of pendingByOrder.entries()) {
            try {
                const orderSnap = await data.orderPromise;
                if (!orderSnap.exists()) {
                    console.warn(`Order ${orderId} not found.`);
                    errorCount++;
                    continue;
                }
                const orderData = orderSnap.data();
                
                const response = await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        to: orderData.responsibleEmail,
                        type: 'identificationPending',
                        data: {
                            customerName: orderData.responsibleName,
                            raceName: raceData.name,
                            pendingCount: data.count,
                            dashboardUrl: `${window.location.origin}/dashboard/subscriptions`
                        }
                    })
                });
    
                if (response.ok) {
                    successCount++;
                } else {
                    errorCount++;
                }
            } catch (error) {
                console.error(`Failed to process order ${orderId}:`, error);
                errorCount++;
            }
        }
    
        toast({ title: 'Envio Concluído!', description: `${successCount} e-mails de lembrete foram enviados. ${errorCount > 0 ? `${errorCount} falharam.` : ''}` });
        setIsReminding(false);
    };

    const handleGenerateBibNumbers = async () => {
        if (!firestore || !registrations || !raceData) {
            toast({ title: "Erro de sistema", description: "Dados não carregados.", variant: "destructive" });
            return;
        }

        if (!canGenerateBibNumbers) {
            toast({ title: "Ação bloqueada", description: generationDisabledMessage, variant: "destructive" });
            return;
        }
        
        const identifiedParticipants = registrations.filter(p => p.status === 'IDENTIFICADA');
        
        if (identifiedParticipants.length === 0) {
            toast({ title: "Nenhuma inscrição", description: "Não há atletas identificados para gerar números.", variant: "destructive" });
            return;
        }

        const modalityPrefixes = new Map<string, number>();
        let prefixConflict = false;
        
        for (const opt of raceData.options) {
            if (opt.bibPrefix === undefined || opt.bibPrefix === null) {
                toast({ title: "Configuração incompleta", description: `A modalidade "${opt.distance}" não tem um prefixo de número de peito definido. Edite o evento para continuar.`, variant: "destructive" });
                return;
            }
            
            if ([...modalityPrefixes.values()].includes(opt.bibPrefix)) {
                prefixConflict = true;
            }
            modalityPrefixes.set(opt.distance, opt.bibPrefix);
        }

        if (prefixConflict) {
             toast({ title: "Conflito de prefixos", description: `Múltiplas modalidades usam o mesmo prefixo. Verifique a configuração do evento.`, variant: "destructive" });
             return;
        }


        setIsGenerating(true);
        try {
            const batch = writeBatch(firestore);
            const participantsByModality: { [key: string]: Participant[] } = {};

            identifiedParticipants.forEach(p => {
                if (!participantsByModality[p.modality]) {
                    participantsByModality[p.modality] = [];
                }
                participantsByModality[p.modality].push(p);
            });

            let totalGenerated = 0;
            for (const modality in participantsByModality) {
                const prefix = modalityPrefixes.get(modality);
                if (prefix === undefined) {
                    throw new Error(`Prefixo não encontrado para a modalidade: ${modality}`);
                }
                
                const sortedParticipants = participantsByModality[modality].sort((a, b) => 
                    a.userProfile?.fullName?.localeCompare(b.userProfile?.fullName ?? '') ?? 0
                );

                sortedParticipants.forEach((participant, index) => {
                    const sequence = String(index + 1).padStart(3, '0');
                    const bibNumber = `${prefix}${sequence}`;
                    const participantRef = doc(firestore, 'participants', participant.id);
                    batch.update(participantRef, { bibNumber: bibNumber });
                    totalGenerated++;
                });
            }
            
            await batch.commit();
            toast({ title: "Numeração Gerada com Sucesso!", description: `${totalGenerated} números de peito foram atribuídos.` });
        } catch (error: any) {
            console.error("Error generating bib numbers: ", error);
            toast({ title: "Erro ao gerar numeração", description: error.message, variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };


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
                <Button variant="ghost" onClick={() => router.push(`/admin/events/${raceId}/registrations`)} className="mb-4 -ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar ao Resumo
                </Button>
                <h1 className="text-4xl font-extrabold tracking-tight">Lista de Inscritos: {raceData.name}</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    Gerencie e exporte todas as inscrições para este evento.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Total de {registrations?.length ?? 0} inscrições encontradas.</CardTitle>
                    <div className="flex flex-wrap justify-end items-center gap-2 pt-2">
                        <Button variant="outline" onClick={handleRemindPending} disabled={isReminding}>
                            {isReminding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MailWarning className="mr-2 h-4 w-4" />}
                            {isReminding ? 'Enviando...' : 'Lembrar Pendentes'}
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="default" disabled={!canGenerateBibNumbers || isGenerating}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    {isGenerating ? 'Gerando...' : 'Gerar Números de Peito'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="text-amber-500" />
                                        Confirmar Geração de Números?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação é irreversível e atribuirá números de peito a todos os inscritos confirmados, com base nos prefixos definidos. Você não poderá executar esta ação novamente. Deseja continuar?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleGenerateBibNumbers}>
                                        Sim, Gerar Números
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Button variant="outline" asChild>
                            <Link href={`/admin/events/${raceId}/registrations/print`} target="_blank">
                                <Printer className="mr-2 h-4 w-4" />
                                Imprimir Lista
                            </Link>
                        </Button>
                    </div>
                    {!canGenerateBibNumbers && generationDisabledMessage && (
                        <div className="pt-2 text-right">
                            <p className="text-xs text-muted-foreground">{generationDisabledMessage}</p>
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Atleta</TableHead>
                                <TableHead>Nº Peito</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations?.map((reg) => {
                                const statusInfo = statusConfig[reg.status] ?? {label: reg.status, variant: 'secondary'};
                                return (
                                    <TableRow key={reg.id} className="cursor-pointer" onClick={() => router.push(`/admin/registrations/${reg.id}`)}>
                                        <TableCell className="font-medium">{reg.userProfile?.fullName ?? 'Pendente'}</TableCell>
                                        <TableCell className="font-mono">
                                            {reg.bibNumber || 'N/G'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/admin/registrations/${reg.id}`)}}>Ver Detalhes</DropdownMenuItem>
                                                    <DropdownMenuItem>Identificar Atleta</DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">Cancelar Inscrição</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                             {!registrations || registrations.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">Nenhum inscrito encontrado para este evento.</TableCell>
                                </TableRow>
                             )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    );
}

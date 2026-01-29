
'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import type { Participant, Race, UserProfile as TeamMember } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, UserPlus, Loader2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

const statusConfig: Record<Participant['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
    'IDENTIFICADA': { label: 'Confirmada', variant: 'default' },
    'PENDENTE_IDENTIFICACAO': { label: 'Pendente', variant: 'secondary' },
    'VALIDADA': { label: 'Validada', variant: 'default' },
    'BLOQUEADA': { label: 'Bloqueada', variant: 'destructive' },
}

interface SubscriptionWithRace extends Participant {
    race?: Race;
}

const RaceDateCell = ({ date }: { date: string | undefined }) => {
    const [formattedDate, setFormattedDate] = useState<string | null>(null);

    useEffect(() => {
        if(date) {
            const raceDate = new Date(date);
            raceDate.setMinutes(raceDate.getMinutes() + raceDate.getTimezoneOffset());
            setFormattedDate(raceDate.toLocaleDateString('pt-BR'));
        } else {
            setFormattedDate('N/A');
        }
    }, [date]);
    
    return <TableCell>{formattedDate ?? '...'}</TableCell>;
}

const identifySchema = z.object({
  assignments: z.array(z.object({
    participantId: z.string(),
    teamMemberId: z.string(),
  }))
}).refine(data => {
    const memberIds = data.assignments.map(a => a.teamMemberId);
    const actualMemberIds = memberIds.filter(id => id);
    return new Set(actualMemberIds).size === actualMemberIds.length;
}, {
    message: "O mesmo atleta não pode ser atribuído a duas vagas.",
    path: ["assignments"],
});


export default function SubscriptionsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [identificationTarget, setIdentificationTarget] = useState<{ race: Race; participants: Participant[] } | null>(null);
    
    const subscriptionsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'participants'), where('userId', '==', user.uid));
    }, [firestore, user]);

    const racesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'races') : null, [firestore]);
    const teamMembersQuery = useMemoFirebase(() => firestore && user ? collection(firestore, `users/${user.uid}/teamMembers`) : null, [firestore, user]);
    
    const { data: subscriptions, loading: loadingSubscriptions } = useCollection<Participant>(subscriptionsQuery);
    const { data: races, loading: loadingRaces } = useCollection<Race>(racesQuery);
    const { data: teamMembers, loading: loadingTeamMembers } = useCollection<TeamMember>(teamMembersQuery);
    
    const hydratedSubscriptions: SubscriptionWithRace[] = useMemo(() => {
        if (!subscriptions || !races) return [];
        const racesMap = new Map(races.map(race => [race.id, race]));
        return subscriptions.map(sub => ({
            ...sub,
            race: sub.raceId ? racesMap.get(sub.raceId) : undefined,
        })).sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    }, [subscriptions, races]);
    
    const subscriptionsByRace = useMemo(() => {
        return hydratedSubscriptions.reduce((acc, sub) => {
            if (!sub.race) return acc;
            if (!acc[sub.race.id]) {
                acc[sub.race.id] = { race: sub.race, subscriptions: [] };
            }
            acc[sub.race.id].subscriptions.push(sub);
            return acc;
        }, {} as Record<string, { race: Race; subscriptions: SubscriptionWithRace[] }>);
    }, [hydratedSubscriptions]);

    const finalLoading = loadingSubscriptions || loadingRaces || loadingTeamMembers;

    const form = useForm<z.infer<typeof identifySchema>>({
        resolver: zodResolver(identifySchema),
        defaultValues: { assignments: [] }
    });

    useEffect(() => {
        if (identificationTarget) {
            const pending = identificationTarget.participants.filter(p => p.status === 'PENDENTE_IDENTIFICACAO');
            form.reset({
                assignments: pending.map(p => ({ participantId: p.id, teamMemberId: '' }))
            });
        }
    }, [identificationTarget, form]);
    
    const { fields } = useFieldArray({ control: form.control, name: 'assignments' });
    const assignments = form.watch('assignments');

    async function onIdentifySubmit(data: z.infer<typeof identifySchema>) {
        if (!firestore || !teamMembers) return;
        
        const batch = writeBatch(firestore);
        let assignmentsMade = 0;
        
        data.assignments.forEach(assignment => {
            if (assignment.teamMemberId) { // Only process if a member is selected
                assignmentsMade++;
                const participantRef = doc(firestore, 'participants', assignment.participantId);
                const teamMember = teamMembers.find(tm => tm.id === assignment.teamMemberId);
                
                if (teamMember) {
                    const { id, createdAt, ...userProfileData } = teamMember;
                    batch.update(participantRef, {
                        status: 'IDENTIFICADA',
                        userProfile: userProfileData,
                        shirtSize: teamMember.shirtSize, 
                        updatedAt: serverTimestamp()
                    });
                }
            }
        });

        if (assignmentsMade === 0) {
            setIdentificationTarget(null);
            return;
        }

        try {
            await batch.commit();
            toast({ title: `${assignmentsMade} atleta(s) identificado(s) com sucesso!` });
            setIdentificationTarget(null);
        } catch (error) {
            console.error(error);
            toast({ title: "Erro ao salvar", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Minhas Inscrições</h1>
                <p className="text-muted-foreground">Acompanhe todas as suas corridas confirmadas e pendentes.</p>
            </header>
            
            {finalLoading && Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}

            {!finalLoading && Object.values(subscriptionsByRace).map(({ race, subscriptions }) => {
                const pendingCount = subscriptions.filter(s => s.status === 'PENDENTE_IDENTIFICACAO').length;
                const isRaceClosed = race.status === 'closed' || new Date(race.date) < new Date();
                
                return (
                    <Card key={race.id}>
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle>{race.name}</CardTitle>
                                <CardDescription>{subscriptions.length} inscrição(ões) neste evento.</CardDescription>
                            </div>
                            {pendingCount > 0 && !isRaceClosed && (
                                <Button size="sm" onClick={() => setIdentificationTarget({ race, participants: subscriptions })}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Identificação Rápida ({pendingCount})
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Modalidade</TableHead><TableHead>Atleta</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {subscriptions.map(sub => {
                                        const status = statusConfig[sub.status] ?? {label: 'Desconhecido', variant: 'secondary'};
                                        return (
                                            <TableRow key={sub.id}>
                                                <TableCell>{sub.modality}</TableCell>
                                                <TableCell className="font-medium">{sub.userProfile?.fullName || '---'}</TableCell>
                                                <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    {sub.status === 'PENDENTE_IDENTIFICACAO' && !isRaceClosed && (
                                                        <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/subscriptions/${sub.id}/identify`)}>
                                                            Identificar <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {sub.status === 'IDENTIFICADA' && !isRaceClosed && (
                                                        <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/subscriptions/${sub.id}/identify`)}>
                                                            Editar <Edit className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )
            })}
             {!finalLoading && Object.keys(subscriptionsByRace).length === 0 && (
                <Card><CardContent className="h-24 text-center flex items-center justify-center">Nenhuma inscrição encontrada.</CardContent></Card>
            )}

            <Dialog open={!!identificationTarget} onOpenChange={(open) => !open && setIdentificationTarget(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Identificação Rápida: {identificationTarget?.race.name}</DialogTitle>
                        <CardDescription>Atribua os atletas da sua equipe às vagas pendentes.</CardDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onIdentifySubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                             {fields.map((field, index) => {
                                const participant = identificationTarget?.participants.find(p => p.id === field.participantId);
                                return (
                                <div key={field.id} className="grid grid-cols-5 items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                    <div className="col-span-2">
                                        <p className="font-semibold text-sm">{participant?.race?.name}</p>
                                        <p className="text-xs text-muted-foreground">{participant?.modality}</p>
                                    </div>
                                    <div className="col-span-3">
                                        <FormField
                                            control={form.control}
                                            name={`assignments.${index}.teamMemberId`}
                                            render={({ field: selectField }) => (
                                                <FormItem>
                                                    <Select onValueChange={selectField.onChange} value={selectField.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Selecione um membro da equipe..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {teamMembers?.map(member => {
                                                                const isSelectedElsewhere = assignments.some(
                                                                    (assignment, assignmentIndex) =>
                                                                    assignmentIndex !== index && assignment.teamMemberId === member.id && !!assignment.teamMemberId
                                                                );
                                                                return (
                                                                    <SelectItem
                                                                        key={member.id}
                                                                        value={member.id}
                                                                        disabled={isSelectedElsewhere}
                                                                    >
                                                                        {member.fullName}
                                                                    </SelectItem>
                                                                );
                                                            })}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )})}
                        </form>
                    </Form>
                     <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                        <Button type="submit" onClick={form.handleSubmit(onIdentifySubmit)} disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                            Salvar Identificações
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

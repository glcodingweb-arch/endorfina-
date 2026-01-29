'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import type { Race, Participant } from '@/lib/types';
import { collection, query, orderBy, deleteDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
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
} from "@/components/ui/alert-dialog"
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type RaceStatus = 'published' | 'draft' | 'closed';

const getStatus = (race: Race): RaceStatus => {
    // Se o status for 'draft', ele permanece como rascunho.
    if (race.status === 'draft') {
        return 'draft';
    }

    // Se o status for 'closed', ele permanece encerrado.
    if (race.status === 'closed') {
        return 'closed';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data

    const raceDate = new Date(race.date);
    // Adiciona um dia à data da corrida para determinar quando deve ser encerrada
    const dayAfterRace = new Date(raceDate);
    dayAfterRace.setDate(raceDate.getDate() + 1);

    // Se hoje for o dia seguinte à corrida ou depois, marca como encerrado.
    if (today >= dayAfterRace) {
        return 'closed';
    }

    // Caso contrário, é considerado publicado.
    return 'published';
}


const statusConfig: Record<RaceStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    published: { label: 'Publicado', variant: 'default' },
    draft: { label: 'Rascunho', variant: 'secondary' },
    closed: { label: 'Encerrado', variant: 'outline' },
}


export default function AdminEventsPage() {
    const firestore = useFirestore();
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<RaceStatus | 'all'>('all');
    const { toast } = useToast();
    const [raceToDelete, setRaceToDelete] = useState<Race | null>(null);

    const racesQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'races'), orderBy('date', 'desc'));
    }, [firestore]);

    const participantsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'participants'));
    }, [firestore]);


    const { data: races, loading: loadingRaces } = useCollection<Race>(racesQuery);
    const { data: participants, loading: loadingParticipants } = useCollection<Participant>(participantsQuery);
    
    const loading = loadingRaces || loadingParticipants;

    const participantCounts = useMemo(() => {
        if (!participants) return new Map<string, number>();
        return participants.reduce((acc, p) => {
            if (p.raceId) {
                acc.set(p.raceId, (acc.get(p.raceId) || 0) + 1);
            }
            return acc;
        }, new Map<string, number>());
    }, [participants]);

    const filteredRaces = useMemo(() => {
        if (!races) return [];
        return races.filter((race) => {
            const status = getStatus(race);

            const matchesSearch =
                race.name.toLowerCase().includes(search.toLowerCase()) ||
                race.location.toLowerCase().includes(search.toLowerCase());

            const matchesFilter =
                statusFilter === 'all' ? true : statusFilter === status;

            return matchesSearch && matchesFilter;
        });
    }, [search, statusFilter, races]);

    const handleDeleteRace = async () => {
        if (!raceToDelete || !firestore) return;

        try {
            await deleteDoc(doc(firestore, 'races', raceToDelete.id));
            toast({
                title: 'Evento Excluído!',
                description: `O evento "${raceToDelete.name}" foi removido com sucesso.`,
            });
        } catch (error) {
            console.error("Erro ao excluir evento: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Excluir',
                description: 'Ocorreu um problema ao tentar excluir o evento.',
            });
        } finally {
            setRaceToDelete(null);
        }
    };
    
    const handleDuplicateRace = async (raceToDuplicate: Race) => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Erro de Conexão' });
            return;
        }

        try {
            const { id, createdAt, updatedAt, ...raceData } = raceToDuplicate;
            
            const newRace = {
                ...raceData,
                name: `${raceData.name} (Cópia)`,
                status: 'draft' as const,
                featured: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };

            const docRef = await addDoc(collection(firestore, 'races'), newRace);

            toast({
                title: 'Evento Duplicado!',
                description: `"${newRace.name}" criado como rascunho.`,
                action: (
                    <Button variant="outline" size="sm" onClick={() => router.push(`/admin/events/${docRef.id}`)}>
                        Editar
                    </Button>
                ),
            });
        } catch (error) {
             console.error("Erro ao duplicar evento: ", error);
            toast({
                variant: 'destructive',
                title: 'Erro ao Duplicar',
                description: 'Ocorreu um problema ao tentar duplicar o evento.',
            });
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Gestão de Eventos</CardTitle>
                        <CardDescription>
                            Gerencie todos os eventos cadastrados na plataforma.
                        </CardDescription>
                    </div>

                    <Button asChild>
                        <Link href="/admin/events/create">
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Evento
                        </Link>
                    </Button>
                </CardHeader>

                <CardContent className="space-y-4">

                    {/* TOOLS */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                        <input
                            type="text"
                            placeholder="Buscar evento..."
                            className="border p-2 rounded-md w-full md:w-1/3"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div className="flex gap-2">
                            <Button
                                variant={statusFilter === 'all' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('all')}
                            >
                                Todos
                            </Button>
                             <Button
                                variant={statusFilter === 'published' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('published')}
                            >
                                Publicados
                            </Button>
                             <Button
                                variant={statusFilter === 'draft' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('draft')}
                            >
                                Rascunhos
                            </Button>
                            <Button
                                variant={statusFilter === 'closed' ? 'default' : 'outline'}
                                onClick={() => setStatusFilter('closed')}
                            >
                                Encerrados
                            </Button>
                        </div>
                    </div>

                    {/* TABLE */}
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">
                                    Evento
                                </TableHead>
                                <TableHead>Nome</TableHead>
                                <TableHead>Data</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Inscritos</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6">
                                        Carregando eventos...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && filteredRaces.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-6">
                                        Nenhum evento encontrado.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && filteredRaces.map((race) => {
                                const date = new Date(race.date);
                                const status = getStatus(race);
                                const statusInfo = statusConfig[status];
                                const count = participantCounts.get(race.id) || 0;
                                
                                const imageUrl = race.image?.startsWith('http')
                                    ? race.image
                                    : PlaceHolderImages.find(p => p.id === race.image)?.imageUrl || `https://picsum.photos/seed/${race.id}/64/64`;

                                return (
                                    <TableRow key={race.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Image
                                                alt={race.name}
                                                className="aspect-square rounded-md object-cover"
                                                height="64"
                                                width="64"
                                                src={imageUrl}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <div className="font-medium">{race.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {race.location}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {date.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                        </TableCell>

                                        <TableCell>
                                            <Badge variant={statusInfo.variant}>
                                                {statusInfo.label}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="hidden md:table-cell">
                                            {count} / {race.capacity ?? '∞'}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/events/${race.id}`}>Gerenciar</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDuplicateRace(race)}>Duplicar</DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => setRaceToDelete(race)}
                                                    >
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            
            <AlertDialog open={!!raceToDelete} onOpenChange={(open) => !open && setRaceToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento
                        e removerá seus dados de nossos servidores.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteRace} className="bg-destructive hover:bg-destructive/90">
                        Excluir
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Plus, Tag, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, serverTimestamp, addDoc, doc, updateDoc, deleteDoc, getDocs, where, orderBy } from 'firebase/firestore';
import type { RaceTag, Race } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


const tagSchema = z.object({
    name: z.string().min(2, 'O nome da tag é obrigatório.'),
    description: z.string().optional(),
});

type TagFormValues = z.infer<typeof tagSchema>;

export default function AdminTagsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<RaceTag | null>(null);
    const [tagToDelete, setTagToDelete] = useState<RaceTag | null>(null);
    const [isCheckingUsage, setIsCheckingUsage] = useState(false);

    const tagsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'raceTags'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const { data: tags, loading } = useCollection<RaceTag>(tagsQuery);
    
    const form = useForm<TagFormValues>({
        resolver: zodResolver(tagSchema),
        defaultValues: { name: '', description: '' },
    });
    
    const handleOpenDialog = (tag: RaceTag | null = null) => {
        setEditingTag(tag);
        if (tag) {
            form.reset({ name: tag.name, description: tag.description || '' });
        } else {
            form.reset({ name: '', description: '' });
        }
        setIsDialogOpen(true);
    };
    
    async function onSubmit(values: TagFormValues) {
        if (!firestore) return;
        
        try {
            if (editingTag) {
                const tagRef = doc(firestore, 'raceTags', editingTag.id);
                await updateDoc(tagRef, values);
                toast({ title: 'Tag Atualizada!' });
            } else {
                await addDoc(collection(firestore, 'raceTags'), { ...values, createdAt: serverTimestamp() });
                toast({ title: 'Tag Criada com Sucesso!' });
            }
            setIsDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro ao salvar tag', variant: 'destructive' });
        }
    }

    const checkTagUsageAndDelete = async (tag: RaceTag) => {
        if (!firestore) return;
        
        setIsCheckingUsage(true);

        const racesRef = collection(firestore, 'races');
        const q = query(racesRef, where('tags', 'array-contains', tag.name));
        const querySnapshot = await getDocs(q);

        setIsCheckingUsage(false);
        
        if (!querySnapshot.empty) {
            toast({
                variant: 'destructive',
                title: 'Não é possível excluir',
                description: `A tag "${tag.name}" está sendo usada por ${querySnapshot.size} evento(s).`,
            });
            setTagToDelete(null);
            return;
        }

        // If not in use, proceed with deletion
        try {
            await deleteDoc(doc(firestore, 'raceTags', tag.id));
            toast({ title: 'Tag excluída com sucesso!' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro ao excluir a tag', variant: 'destructive' });
        }
        setTagToDelete(null);
    }
    
    const formatDate = (date: any) => {
      if (!date) return 'N/A';
      return date.toDate().toLocaleDateString('pt-BR');
    };

    return (
        <>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                    <div>
                        <CardTitle>Gestão de Tags</CardTitle>
                        <CardDescription>Crie e gerencie as categorias dos seus eventos.</CardDescription>
                    </div>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Criar Tag
                        </Button>
                    </DialogTrigger>
                    </CardHeader>
                    <CardContent>
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Data de Criação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {loading && Array.from({length: 3}).map((_, i) => (
                            <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                        ))}
                        {!loading && tags?.map((tag) => (
                            <TableRow key={tag.id}>
                                <TableCell><Badge variant="outline" className="text-base"><Tag className="mr-2 h-3 w-3"/>{tag.name}</Badge></TableCell>
                                <TableCell>{tag.description || '-'}</TableCell>
                                <TableCell>{formatDate(tag.createdAt)}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenDialog(tag)}><Edit className="mr-2 h-4 w-4"/>Editar</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => setTagToDelete(tag)}><Trash2 className="mr-2 h-4 w-4"/>Excluir</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {!loading && tags?.length === 0 && (
                            <TableRow><TableCell colSpan={4} className="h-24 text-center">Nenhuma tag encontrada.</TableCell></TableRow>
                        )}
                        </TableBody>
                    </Table>
                    </CardContent>
                </Card>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingTag ? 'Editar Tag' : 'Criar Nova Tag'}</DialogTitle>
                        <DialogDescription>{editingTag ? 'Altere os detalhes da sua tag.' : 'Preencha os campos para adicionar uma nova tag.'}</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem><FormLabel>Descrição (Opcional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="ghost">Cancelar</Button></DialogClose>
                                <Button type="submit">{editingTag ? 'Salvar Alterações' : 'Criar Tag'}</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!tagToDelete} onOpenChange={() => setTagToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Você tem certeza que deseja excluir a tag "{tagToDelete?.name}"? Esta ação não pode ser desfeita. A tag só será excluída se não estiver em uso.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => checkTagUsageAndDelete(tagToDelete!)} disabled={isCheckingUsage}>
                            {isCheckingUsage ? 'Verificando...' : 'Sim, Excluir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

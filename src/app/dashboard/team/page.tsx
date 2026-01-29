'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MoreHorizontal, Edit, Trash2, User as UserIcon } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Função de validação de CPF (sem alterações)
function isValidCPF(cpf: string) {
  if (typeof cpf !== 'string') return false;
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  const cpfDigits = cpf.split('').map(el => +el);
  const calcVerifier = (digits: number[]): number => {
    const sum = digits.reduce((acc, digit, index) => acc + digit * (digits.length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  const firstVerifier = calcVerifier(cpfDigits.slice(0, 9));
  if (firstVerifier !== cpfDigits[9]) return false;
  const secondVerifier = calcVerifier(cpfDigits.slice(0, 10));
  if (secondVerifier !== cpfDigits[10]) return false;
  return true;
}

const teamMemberSchema = z.object({
  fullName: z.string().min(3, 'Nome completo é obrigatório.'),
  documentNumber: z.string().refine(isValidCPF, { message: "CPF inválido." }),
  birthDate: z.string().optional(),
  email: z.string().email({ message: "E-mail inválido." }),
  gender: z.enum(["Masculino", "Feminino", "Outro"], { required_error: "Selecione um gênero." }),
  mobilePhone: z.string().min(10, "Celular é obrigatório"),
  shirtSize: z.string().optional(),
});

type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;
type TeamMember = UserProfile & { id: string };

const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    .substring(0, 14);
};

export default function TeamPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const teamMembersCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/teamMembers`);
  }, [firestore, user]);

  const { data: teamMembers, loading } = useCollection<TeamMember>(teamMembersCollectionRef);

  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberSchema),
    defaultValues: { fullName: '', documentNumber: '', birthDate: '', email: '', mobilePhone: '', shirtSize: '' }
  });

  const onSubmit = async (data: TeamMemberFormValues) => {
    if (!teamMembersCollectionRef) return;
    
    const dataToSave = { ...data, documentType: 'CPF' };

    try {
      if (editingMember) {
        const memberDocRef = doc(firestore, `users/${user!.uid}/teamMembers`, editingMember.id);
        await updateDoc(memberDocRef, { ...dataToSave, updatedAt: serverTimestamp() });
        toast({ title: "Membro atualizado com sucesso!" });
      } else {
        await addDoc(teamMembersCollectionRef, { ...dataToSave, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        toast({ title: "Membro adicionado com sucesso!" });
      }
      closeDialog();
    } catch (error) {
      console.error(error);
      toast({ title: "Erro ao salvar membro.", variant: "destructive" });
    }
  };
  
  const handleEdit = (member: TeamMember) => {
      setEditingMember(member);
      form.reset({
        fullName: member.fullName || '',
        documentNumber: member.documentNumber || '',
        birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
        email: member.email || '',
        gender: member.gender || undefined,
        mobilePhone: member.mobilePhone || '',
        shirtSize: member.shirtSize || '',
      });
      setIsFormOpen(true);
  }

  const handleDelete = async (memberId: string) => {
      if (!firestore || !user) return;
      try {
        const memberDocRef = doc(firestore, `users/${user.uid}/teamMembers`, memberId);
        await deleteDoc(memberDocRef);
        toast({ title: "Membro excluído com sucesso." });
      } catch (error) {
        console.error(error);
        toast({ title: "Erro ao excluir membro.", variant: "destructive" });
      }
  }

  const closeDialog = () => {
    setIsFormOpen(false);
    setEditingMember(null);
    form.reset();
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Minha Equipe</h1>
        <p className="text-muted-foreground">Gerencie os membros da sua equipe para facilitar a inscrição em grupo.</p>
      </header>
      
       <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Membros Cadastrados</CardTitle>
            <CardDescription>Atletas da sua equipe ou grupo de corrida.</CardDescription>
          </div>
           <Dialog open={isFormOpen} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
            <DialogTrigger asChild>
                <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Membro
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{editingMember ? 'Editar Membro' : 'Adicionar Novo Membro'}</DialogTitle>
                </DialogHeader>
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="documentNumber" render={({ field }) => (
                            <FormItem>
                                <FormLabel>CPF</FormLabel>
                                <FormControl>
                                    <Input 
                                        {...field} 
                                        onChange={(e) => field.onChange(maskCPF(e.target.value))}
                                        maxLength={14}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="birthDate" render={({ field }) => (
                            <FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="gender" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gênero</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                        <SelectItem value="Feminino">Feminino</SelectItem>
                                        <SelectItem value="Outro">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="mobilePhone" render={({ field }) => (
                            <FormItem><FormLabel>Celular</FormLabel><FormControl><Input placeholder="(00) 00000-0000" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField
                            control={form.control}
                            name="shirtSize"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                <FormLabel>Tamanho da Camiseta</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o tamanho..." />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="PP">PP</SelectItem>
                                    <SelectItem value="P">P</SelectItem>
                                    <SelectItem value="M">M</SelectItem>
                                    <SelectItem value="G">G</SelectItem>
                                    <SelectItem value="GG">GG</SelectItem>
                                    <SelectItem value="XGG">XGG</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="md:col-span-2 mt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                              {form.formState.isSubmitting ? 'Salvando...' : (editingMember ? 'Salvar Alterações' : 'Adicionar Membro')}
                            </Button>
                        </DialogFooter>
                    </form>
                 </Form>
            </DialogContent>
           </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <>
                  <TableRow><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                  <TableRow><TableCell colSpan={3}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                </>
              )}
              {!loading && teamMembers?.map(member => (
                <TableRow key={member.id}>
                    <TableCell className="font-medium flex items-center gap-2"><UserIcon className="h-4 w-4 text-muted-foreground"/> {member.fullName}</TableCell>
                    <TableCell>{member.documentNumber}</TableCell>
                    <TableCell className="text-right">
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleEdit(member)}><Edit className="mr-2 h-4 w-4"/> Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(member.id)}><Trash2 className="mr-2 h-4 w-4"/> Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                       </DropdownMenu>
                    </TableCell>
                </TableRow>
              ))}
               {!loading && teamMembers?.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">Nenhum membro na equipe.</TableCell>
                 </TableRow>
               )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useDoc, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { doc, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import type { Participant, Race, UserProfile as TeamMember } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, UserPlus, FileSignature, Edit } from 'lucide-react';

const identificationSchema = z.object({
  // From TeamMember/UserProfile
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  birthDate: z.string().optional(),
  documentType: z.string(),
  documentNumber: z.string().min(5, "Número do documento é obrigatório"),
  gender: z.enum(["Masculino", "Feminino", "Outro"]),
  email: z.string().email("E-mail inválido"),
  mobilePhone: z.string().min(10, "Celular é obrigatório"),
  
  // Kit selection
  shirtSize: z.string().min(1, 'O tamanho da camiseta é obrigatório.'),
});

type IdentificationFormValues = z.infer<typeof identificationSchema>;

export default function IdentifySubscriptionPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const subscriptionId = params.id as string;

    // --- Data Fetching ---
    const subscriptionRef = useMemoFirebase(() => (firestore && subscriptionId) ? doc(firestore, 'participants', subscriptionId) : null, [firestore, subscriptionId]);
    const { data: subscription, loading: loadingSub } = useDoc<Participant>(subscriptionRef);

    const raceRef = useMemoFirebase(() => (firestore && subscription?.raceId) ? doc(firestore, 'races', subscription.raceId) : null, [firestore, subscription?.raceId]);
    const { data: race, loading: loadingRace } = useDoc<Race>(raceRef);
    
    const teamMembersRef = useMemoFirebase(() => (firestore && user) ? collection(firestore, `users/${user.uid}/teamMembers`) : null, [firestore, user]);
    const { data: teamMembers, loading: loadingTeam } = useCollection<TeamMember>(teamMembersRef);
    
    const loading = loadingSub || loadingRace || loadingTeam;

    const isEditing = subscription?.status === 'IDENTIFICADA';

    const form = useForm<IdentificationFormValues>({
        resolver: zodResolver(identificationSchema),
        defaultValues: {
            fullName: '',
            birthDate: '',
            documentType: 'CPF',
            documentNumber: '',
            gender: undefined,
            email: '',
            mobilePhone: '',
            shirtSize: '',
        },
    });

    // Effect to pre-fill form for editing
    useEffect(() => {
        if (isEditing && subscription?.userProfile) {
             form.reset({
                fullName: subscription.userProfile.fullName || '',
                birthDate: subscription.userProfile.birthDate ? new Date(subscription.userProfile.birthDate).toISOString().split('T')[0] : '',
                documentType: subscription.userProfile.documentType || 'CPF',
                documentNumber: subscription.userProfile.documentNumber || '',
                gender: subscription.userProfile.gender || undefined,
                email: subscription.userProfile.email || '',
                mobilePhone: subscription.userProfile.mobilePhone || '',
                shirtSize: subscription.shirtSize || '',
            });
        }
    }, [subscription, isEditing, form]);


    const handleSelectTeamMember = (memberId: string) => {
        const member = teamMembers?.find(m => m.id === memberId);
        if (member) {
            form.reset({
                fullName: member.fullName || '',
                birthDate: member.birthDate ? new Date(member.birthDate).toISOString().split('T')[0] : '',
                documentType: member.documentType || 'CPF',
                documentNumber: member.documentNumber || '',
                gender: member.gender || undefined,
                email: member.email || '',
                mobilePhone: member.mobilePhone || '',
                shirtSize: member.shirtSize || '',
            });
        }
    };
    
    const onSubmit = async (data: IdentificationFormValues) => {
        if (!subscriptionRef) return;
        
        const { shirtSize, ...userProfileData } = data;

        try {
            await updateDoc(subscriptionRef, {
                status: 'IDENTIFICADA',
                userProfile: userProfileData,
                shirtSize: shirtSize,
                kitType: 'Padrão',
                updatedAt: serverTimestamp(),
            });
            toast({
                title: isEditing ? 'Dados Atualizados!' : "Atleta Identificado!",
                description: `A inscrição foi atualizada com os dados de ${data.fullName}.`,
            });
            router.push('/dashboard/subscriptions');
        } catch (error) {
            console.error(error);
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível atualizar a inscrição.",
                variant: "destructive",
            });
        }
    };
    
    if (loading) {
        return (
             <div className="space-y-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-96 w-full" />
            </div>
        )
    }
    
    if (!subscription) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Inscrição não encontrada</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-8">
            <header>
                <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-primary pl-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para Minhas Inscrições
                </Button>
                <h1 className="text-3xl font-bold">{isEditing ? 'Editar Dados do Atleta' : 'Identificar Atleta'}</h1>
                <p className="text-muted-foreground">
                    {isEditing ? 'Atualize as informações do participante.' : `Vincule os dados do atleta a esta inscrição para o evento`} <strong className="text-foreground">{race?.name} ({subscription.modality})</strong>.
                </p>
            </header>
            
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="w-5 h-5" />
                                Selecionar da Equipe (Opcional)
                            </CardTitle>
                            <CardDescription>Facilite o preenchimento selecionando um membro da sua equipe.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Select onValueChange={handleSelectTeamMember}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um atleta da sua equipe..." />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {teamMembers?.map(member => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.fullName}{member.documentNumber ? ` (${member.documentNumber})` : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                    
                     <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                                {isEditing ? <Edit className="w-5 h-5"/> : <FileSignature className="w-5 h-5" />}
                                Dados do Atleta
                            </CardTitle>
                             <CardDescription>Preencha as informações do participante.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <FormField name="fullName" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Nome Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="email" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>E-mail</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="birthDate" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Data de Nascimento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="gender" control={form.control} render={({ field }) => (
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
                            )} />
                            <FormField name="documentType" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de Documento</FormLabel>
                                    <FormControl><Input {...field} readOnly /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="documentNumber" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>CPF</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="mobilePhone" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Celular</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                     </Card>
                     
                     <Card>
                        <CardHeader>
                            <CardTitle>Kit do Atleta</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-6">
                            <FormField name="shirtSize" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tamanho da Camiseta</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione o tamanho..." /></SelectTrigger></FormControl>
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
                            )} />
                        </CardContent>
                     </Card>
                     
                     <div className="flex justify-end">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isEditing ? 'Salvar Alterações' : 'Salvar Identificação'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}

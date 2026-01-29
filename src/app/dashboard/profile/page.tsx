'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';

const profileSchema = z.object({
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  birthDate: z.string().optional(),
  email: z.string().email(),
  documentType: z.string(),
  documentNumber: z.string().min(5, "Número do documento é obrigatório"),
  gender: z.enum(["Masculino", "Feminino", "Outro"]),
  mobilePhone: z.string().min(10, "Celular é obrigatório"),
  zipCode: z.string().min(8, "CEP é obrigatório"),
  address: z.string().min(3, "Endereço é obrigatório"),
  addressNumber: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(3, "Bairro é obrigatório"),
  city: z.string().min(3, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  country: z.string().min(3, "País é obrigatório"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading: loadingUser } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(() => (firestore && user) ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: userProfile, loading: loadingProfile } = useDoc<UserProfile>(userProfileRef);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      birthDate: '',
      email: user?.email || '',
      documentType: 'CPF',
      documentNumber: '',
      mobilePhone: '',
      zipCode: '',
      address: '',
      addressNumber: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      country: 'Brasil',
    },
  });

  useEffect(() => {
    if (userProfile) {
        form.reset({
            ...userProfile,
            documentType: userProfile.documentType || 'CPF',
            birthDate: userProfile.birthDate ? new Date(userProfile.birthDate).toISOString().split('T')[0] : '',
            complement: userProfile.complement || '',
        });
    }
  }, [userProfile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userProfileRef || !user?.email) return;
    try {
      await setDoc(userProfileRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Envia e-mail de notificação
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: user.email,
            type: 'profileUpdated',
            data: {
              customerName: data.fullName,
            },
          }),
        });
      } catch (emailError) {
        console.error("Failed to send profile update email:", emailError);
      }

      toast({
        title: "Perfil atualizado!",
        description: "Seus dados foram salvos com sucesso.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seus dados.",
      });
    }
  };
  
  if (loadingUser || loadingProfile) {
      return (
          <div>
              <Skeleton className="h-8 w-48 mb-6" />
              <Card><CardContent className="p-6 space-y-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
              </CardContent></Card>
          </div>
      )
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Meu Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e de contato.</p>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField name="fullName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl><Input {...field} readOnly disabled /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="birthDate" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="gender" control={form.control} render={({ field }) => (
                <FormItem>
                   <FormLabel>Gênero</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                        </FormControl>
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
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="mobilePhone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

           <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <FormField name="zipCode" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>CEP</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="address" control={form.control} render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Endereço</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="addressNumber" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField name="complement" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField name="neighborhood" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField name="city" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
                <FormField name="state" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado (UF)</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
                <FormField name="country" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>País</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

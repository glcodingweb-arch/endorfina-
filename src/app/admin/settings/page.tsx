'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import type { AutomationSettings } from '@/lib/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


const generalSettingsSchema = z.object({
  orgName: z.string().min(1, "Nome da organização é obrigatório."),
  supportEmail: z.string().email("E-mail inválido."),
});

const automationSettingsSchema = z.object({
  abandonedCart: z.object({
    minHoursSinceUpdate: z.coerce.number().min(1),
    minHoursBetweenEmails: z.coerce.number().min(1),
    maxEmailsPerDay: z.coerce.number().min(1).max(5),
  }),
  pendingRegistration: z.object({
    minHoursSinceCreation: z.coerce.number().min(1),
    minHoursBetweenEmails: z.coerce.number().min(1),
  }),
});

type GeneralFormValues = z.infer<typeof generalSettingsSchema>;
type AutomationFormValues = z.infer<typeof automationSettingsSchema>;


export default function AdminSettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const settingsDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    // Use a fixed ID for the settings document for simplicity
    return doc(firestore, 'automationSettings', 'emailConfig');
  }, [firestore]);

  const { data: automationSettings, loading: loadingSettings } = useDoc<AutomationSettings>(settingsDocRef);
  
  const generalForm = useForm<GeneralFormValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      orgName: "Endorfina Esportes",
      supportEmail: "contato@endorfinaesportes.com",
    },
  });

  const automationForm = useForm<AutomationFormValues>({
      resolver: zodResolver(automationSettingsSchema),
      defaultValues: {
          abandonedCart: {
              minHoursSinceUpdate: 2,
              minHoursBetweenEmails: 24,
              maxEmailsPerDay: 2,
          },
          pendingRegistration: {
              minHoursSinceCreation: 48,
              minHoursBetweenEmails: 48,
          },
      },
  });
  
  useEffect(() => {
    if (automationSettings) {
      automationForm.reset(automationSettings);
    }
  }, [automationSettings, automationForm]);

  const handleGeneralSave = (values: GeneralFormValues) => {
    toast({
      title: "Configurações Salvas!",
      description: "Suas alterações foram aplicadas com sucesso.",
    });
  };

  const handleAutomationSave = async (values: AutomationFormValues) => {
    if (!settingsDocRef) return;
    try {
      await setDoc(settingsDocRef, values, { merge: true });
       toast({
        title: "Automações Salvas!",
        description: "As regras de automação de e-mail foram atualizadas.",
      });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Erro ao salvar", description: "Não foi possível salvar as configurações de automação."})
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações gerais e automações da plataforma.</p>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="automations">Automações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="mt-6">
          <form onSubmit={generalForm.handleSubmit(handleGeneralSave)}>
            <Card>
              <CardHeader>
                <CardTitle>Informações da Organização</CardTitle>
                <CardDescription>Dados públicos que podem aparecer no site e em comunicações.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Nome da Organização</Label>
                  <Input id="org-name" {...generalForm.register('orgName')} />
                   {generalForm.formState.errors.orgName && <p className="text-sm text-destructive">{generalForm.formState.errors.orgName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-email">E-mail de Suporte</Label>
                  <Input id="support-email" type="email" {...generalForm.register('supportEmail')} />
                  {generalForm.formState.errors.supportEmail && <p className="text-sm text-destructive">{generalForm.formState.errors.supportEmail.message}</p>}
                </div>
              </CardContent>
            </Card>
            <div className="mt-8 flex justify-end">
              <Button type="submit">Salvar Gerais</Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="automations" className="mt-6">
           <Form {...automationForm}>
             <form onSubmit={automationForm.handleSubmit(handleAutomationSave)}>
              {loadingSettings ? (
                  <Skeleton className="h-96 w-full"/>
              ) : (
                  <div className="space-y-8">
                      <Card>
                          <CardHeader>
                              <CardTitle>Lembrete de Carrinho Abandonado</CardTitle>
                              <CardDescription>Configure as regras para enviar e-mails de recuperação de carrinho.</CardDescription>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <FormField
                                control={automationForm.control}
                                name="abandonedCart.minHoursSinceUpdate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ativação do Lembrete</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enviar primeiro lembrete após X horas de inatividade.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                               <FormField
                                control={automationForm.control}
                                name="abandonedCart.minHoursBetweenEmails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frequência</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Aguardar Y horas antes de enviar um novo lembrete.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                               <FormField
                                control={automationForm.control}
                                name="abandonedCart.maxEmailsPerDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Limite Diário por Usuário</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Máximo de e-mails (todos os tipos) por usuário em 24h.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                          </CardContent>
                      </Card>
                       <Card>
                          <CardHeader>
                              <CardTitle>Lembrete de Inscrição Pendente</CardTitle>
                              <CardDescription>Regras para notificar usuários sobre a necessidade de identificar atletas.</CardDescription>
                          </CardHeader>
                          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={automationForm.control}
                                name="pendingRegistration.minHoursSinceCreation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ativação do Lembrete</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            Enviar lembrete X horas após a compra.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                              <FormField
                                control={automationForm.control}
                                name="pendingRegistration.minHoursBetweenEmails"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Frequência</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                           Aguardar Y horas antes de enviar um novo lembrete.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                               />
                          </CardContent>
                      </Card>
                  </div>
              )}
               <div className="mt-8 flex justify-end">
                  <Button type="submit" disabled={automationForm.formState.isSubmitting}>
                     {automationForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                     Salvar Automações
                  </Button>
              </div>
             </form>
           </Form>
        </TabsContent>
      </Tabs>
    </>
  );
}

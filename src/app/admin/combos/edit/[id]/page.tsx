
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { updateDoc, collection, serverTimestamp, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import type { Race, Combo } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const comboItemSchema = z.object({
  modality: z.string().min(1, "Selecione a modalidade."),
  quantity: z.coerce.number().min(1, "A quantidade deve ser pelo menos 1."),
});

const comboSchema = z.object({
  name: z.string().min(3, 'O nome do combo é obrigatório.'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'O preço deve ser um valor positivo.'),
  eventId: z.string().min(1, "Você precisa selecionar um evento."),
  items: z.array(comboItemSchema).min(1, 'O combo deve ter pelo menos um item.'),
  active: z.boolean().default(true),
});

type ComboFormValues = z.infer<typeof comboSchema>;

export default function EditComboPage() {
  const router = useRouter();
  const params = useParams();
  const comboId = params.id as string;
  const { toast } = useToast();
  const firestore = useFirestore();

  const comboRef = useMemoFirebase(() => (firestore && comboId) ? doc(firestore, 'combos', comboId) : null, [firestore, comboId]);
  const { data: comboData, loading: loadingCombo } = useDoc<Combo>(comboRef);

  const racesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'races') : null, [firestore]);
  const { data: races, loading: loadingRaces } = useCollection<Race>(racesQuery);

  const form = useForm<ComboFormValues>({
    resolver: zodResolver(comboSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      eventId: '',
      items: [],
      active: true,
    },
  });

  useEffect(() => {
    if (comboData) {
      form.reset({
        name: comboData.name,
        description: comboData.description || '',
        price: comboData.price,
        eventId: comboData.eventId,
        items: comboData.items || [],
        active: comboData.active,
      });
    }
  }, [comboData, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const selectedEventId = form.watch('eventId');
  const selectedRace = races?.find(r => r.id === selectedEventId);
  const modalities = selectedRace?.options ?? [];
  
  async function onSubmit(values: ComboFormValues) {
    if (!firestore || !comboId) return;

    const comboItemsWithRaceId = values.items.map(item => ({
        ...item,
        raceId: values.eventId
    }));

    try {
      const comboDocRef = doc(firestore, 'combos', comboId);
      await updateDoc(comboDocRef, {
        name: values.name,
        description: values.description,
        price: values.price,
        eventId: values.eventId,
        items: comboItemsWithRaceId,
        active: values.active,
        updatedAt: serverTimestamp(),
      });
      toast({
        title: 'Combo Atualizado com Sucesso!',
        description: `O combo "${values.name}" foi salvo.`,
      });
      router.push('/admin/combos');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro ao atualizar combo',
        description: 'Ocorreu um erro ao salvar as alterações.',
        variant: 'destructive',
      });
    }
  }
  
  if (loadingCombo || loadingRaces) {
    return <Skeleton className="h-[500px] w-full" />
  }

  if (!comboData) {
    return <div>Combo não encontrado.</div>
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Editar Combo: {comboData.name}</h1>
        <p className="text-muted-foreground">Ajuste os detalhes e salve as alterações.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Combo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Combo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Desafio 10k + 21k" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Descreva os benefícios e detalhes deste combo." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço do Combo (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="250.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

           <Card>
              <CardHeader>
                  <CardTitle>Evento do Combo</CardTitle>
                  <CardDescription>Selecione o evento ao qual este combo se aplica.</CardDescription>
              </CardHeader>
              <CardContent>
                  <FormField
                    control={form.control}
                    name="eventId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Evento</FormLabel>
                            <Select 
                                onValueChange={(value) => {
                                    field.onChange(value);
                                    form.setValue('items', [{ modality: '', quantity: 1 }]);
                                }}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o evento para o combo" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {races?.map(race => (
                                        <SelectItem key={race.id} value={race.id}>{race.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </CardContent>
          </Card>

           <Card>
              <CardHeader>
                  <CardTitle>Itens do Combo</CardTitle>
                  <CardDescription>Defina quais inscrições (modalidades) fazem parte deste pacote.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {fields.map((field, index) => (
                      <div key={field.id} className="flex items-end gap-2 p-4 border rounded-lg relative">
                          <FormField
                              control={form.control}
                              name={`items.${index}.modality`}
                              render={({ field }) => (
                              <FormItem className="flex-1">
                                  <FormLabel>Modalidade</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value} disabled={!selectedEventId}>
                                      <FormControl>
                                          <SelectTrigger>
                                              <SelectValue placeholder="Selecione a modalidade" />
                                          </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                          {modalities.map(mod => (
                                              <SelectItem key={mod.distance} value={mod.distance}>{mod.distance}</SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                           <FormField
                              control={form.control}
                              name={`items.${index}.quantity`}
                              render={({ field }) => (
                              <FormItem className="w-24">
                                  <FormLabel>Qtde</FormLabel>
                                  <FormControl>
                                      <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                              )}
                          />
                          <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={() => remove(index)}
                              className="shrink-0"
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                  ))}
                  <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ modality: '', quantity: 1 })}
                      >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Item ao Combo
                  </Button>
              </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push('/admin/combos')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}

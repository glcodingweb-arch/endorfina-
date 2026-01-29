

'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { RaceTag } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Separator } from '@/components/ui/separator';
import { ImageUploader } from '@/components/admin/image-uploader';

const lotSchema = z.object({
  name: z.string().min(1, 'O nome do lote é obrigatório (ex: 1º Lote)'),
  price: z.coerce.number().min(0, 'O preço não pode ser negativo.'),
  startDate: z.string().min(1, 'A data inicial do lote é obrigatória'),
  endDate: z.string().min(1, 'A data final do lote é obrigatória'),
});

const raceOptionSchema = z.object({
  distance: z.string().min(1, 'A distância é obrigatória'),
  bibPrefix: z.coerce.number().int().optional().nullable(),
  lots: z.array(lotSchema).min(1, 'Adicione pelo menos um lote para a modalidade'),
});

const kitItemSchema = z.object({
    name: z.string().min(1, 'O nome do item é obrigatório'),
    brand: z.string().optional(),
});

const createRaceSchema = z.object({
  name: z.string().min(3, 'O nome da corrida é obrigatório'),
  date: z.string().min(1, 'A data é obrigatória'),
  location: z.string().min(3, 'O local é obrigatório'),
  distance: z.string().min(1, 'O resumo das distâncias é obrigatório (ex: 5k, 10k)'),
  description: z.string().min(10, 'A descrição curta é obrigatória'),
  longDescription: z.string().min(20, 'A descrição longa é obrigatória'),
  image: z.string().url({ message: "A URL da imagem é obrigatória e deve ser válida." }),
  featured: z.boolean().default(false),
  options: z.array(raceOptionSchema).min(1, 'Adicione pelo menos uma modalidade de inscrição'),
  capacity: z.coerce.number().int({ message: "A capacidade deve ser um número inteiro."}).min(0, "A capacidade não pode ser negativa.").optional().nullable(),
  status: z.enum(['draft', 'published', 'closed']).default('draft'),
  kitItems: z.array(kitItemSchema).optional(),
  showKitItems: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
  kitDelivery: z.object({
    enabled: z.boolean().default(false),
    price: z.coerce.number().min(0, "O preço não pode ser negativo.").default(0),
  }).optional(),
  kitPickup: z.object({
    enabled: z.boolean().default(true),
    location: z.string().optional(),
    details: z.string().optional(),
  }).optional(),
});

type CreateRaceFormValues = z.infer<typeof createRaceSchema>;

const mockRaceData: CreateRaceFormValues = {
  name: `Corrida de Teste #${Math.floor(Math.random() * 1000)}`,
  date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  location: 'Cidade Fictícia, SP',
  distance: '5k, 10k, 21k',
  description: 'Uma corrida de teste gerada automaticamente para facilitar a demonstração e o desenvolvimento.',
  longDescription: 'Este evento foi gerado com dados de exemplo. O percurso é desafiador e passa pelos principais pontos turísticos imaginários da nossa cidade fictícia. Ideal para todos os níveis de corredores que desejam testar a plataforma.',
  image: 'https://picsum.photos/seed/test-event/1280/720',
  featured: false,
  options: [
    {
      distance: '10km',
      bibPrefix: 1,
      lots: [
        {
          name: 'Lote Promocional',
          price: 99.9,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      ],
    },
    {
      distance: '21km',
      bibPrefix: 2,
      lots: [
        {
          name: '1º Lote',
          price: 149.5,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      ],
    },
  ],
  capacity: 1500,
  status: 'draft',
  kitItems: [
    { name: 'Camiseta Oficial do Evento', brand: 'Endorfina Wear' },
    { name: 'Medalha de Participação', brand: '' },
    { name: 'Chip de Cronometragem', brand: '' },
  ],
  showKitItems: true,
  tags: ['Temática'],
  kitDelivery: { enabled: true, price: 30 },
  kitPickup: { enabled: true, location: 'Shopping Internacional de Guarulhos', details: '2º Piso, em frente à loja da Nike' },
};


export default function CreateRacePage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const tagsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'raceTags') : null, [firestore]);
  const { data: tagsData } = useCollection<RaceTag>(tagsQuery);

  const form = useForm<CreateRaceFormValues>({
    resolver: zodResolver(createRaceSchema),
    defaultValues: {
      name: '',
      date: '',
      location: '',
      distance: '',
      description: '',
      longDescription: '',
      image: '',
      featured: false,
      options: [{ distance: '5km', bibPrefix: 5, lots: [{ name: '1º Lote', price: 100, startDate: '', endDate: '' }] }],
      capacity: 0,
      status: 'draft',
      kitItems: [],
      showKitItems: true,
      tags: [],
      kitDelivery: { enabled: false, price: 25 },
      kitPickup: { enabled: true, location: '', details: '' },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });
  
  const { fields: kitFields, append: appendKitItem, remove: removeKitItem } = useFieldArray({
    control: form.control,
    name: 'kitItems',
  });


  async function onSubmit(values: CreateRaceFormValues) {
    if (!firestore) {
        toast({
            variant: 'destructive',
            title: 'Erro de Conexão',
            description: 'Não foi possível conectar ao banco de dados. Tente novamente.',
        });
        return;
    }

    try {
        const racesCollection = collection(firestore, 'races');
        await addDoc(racesCollection, {
            ...values,
            capacity: values.capacity === undefined ? null : values.capacity,
            organizerId: 'default-organizer', // Em um app real, este ID viria do usuário autenticado
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        toast({
            title: 'Corrida Criada com Sucesso!',
            description: `${values.name} foi adicionada.`,
        });
        router.push('/admin/events');

    } catch (error) {
        console.error("Erro ao criar corrida: ", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Salvar',
            description: 'Ocorreu um problema ao tentar salvar a corrida. Tente novamente.',
        });
    }
  }

  const handleAutoFill = () => {
    form.reset(mockRaceData);
    toast({
      title: 'Formulário Preenchido!',
      description: 'Os dados de teste foram carregados.',
    });
  };

  return (
    <>
        <div className="flex justify-between items-start mb-8">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight">Criar Nova Corrida</h1>
                <p className="mt-4 text-lg text-muted-foreground">
                Preencha os detalhes abaixo para adicionar um novo evento.
                </p>
            </div>
            <Button variant="outline" onClick={handleAutoFill}>
                <Wand2 className="mr-2 h-4 w-4" />
                Gerar Evento de Teste
            </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Detalhes principais do evento.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome da Corrida</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Maratona de São Paulo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data do Evento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Local</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: São Paulo, SP" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Imagem Principal do Evento</FormLabel>
                      <FormControl>
                        <ImageUploader value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacidade Máxima</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" className="no-spinners" placeholder="1500" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                  control={form.control}
                  name="distance"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Resumo das Distâncias</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 5k, 10k, 21k" {...field} />
                      </FormControl>
                      <FormDescription>Texto que aparece nos cards de evento. Ex: 5k, 10k, 21k</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descrição Curta</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Uma breve descrição que aparecerá nos cards da corrida." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="longDescription"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Descrição Longa</FormLabel>
                      <FormControl>
                        <Textarea rows={5} placeholder="Descreva todos os detalhes sobre a corrida aqui." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status do evento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                              <SelectItem value="draft">Rascunho</SelectItem>
                              <SelectItem value="published">Publicado</SelectItem>
                              <SelectItem value="closed">Encerrado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Tags do Evento</FormLabel>
                            <Card className="p-4">
                                <div className="space-y-2">
                                {tagsData?.map((tag) => (
                                    <FormField
                                    key={tag.id}
                                    control={form.control}
                                    name="tags"
                                    render={({ field }) => {
                                        return (
                                        <FormItem
                                            key={tag.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                            <FormControl>
                                            <Checkbox
                                                checked={field.value?.includes(tag.name)}
                                                onCheckedChange={(checked) => {
                                                return checked
                                                    ? field.onChange([...(field.value || []), tag.name])
                                                    : field.onChange(
                                                        (field.value || []).filter(
                                                        (value) => value !== tag.name
                                                        )
                                                    )
                                                }}
                                            />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                              <FormLabel className="font-normal">{tag.name}</FormLabel>
                                              <FormDescription>{tag.description}</FormDescription>
                                            </div>
                                        </FormItem>
                                        )
                                    }}
                                    />
                                ))}
                                </div>
                            </Card>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                  control={form.control}
                  name="featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 md:col-span-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Destacar na Página Inicial
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Marque esta opção para exibir esta corrida na seção de destaques.
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Modalidades e Lotes</CardTitle>
                <CardDescription>Defina as distâncias e os lotes de preços para cada uma.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {fields.map((field, optionIndex) => (
                  <div key={field.id} className="space-y-4 p-4 border rounded-lg bg-muted/20">
                    <div className="flex items-end gap-4">
                      <FormField
                        control={form.control}
                        name={`options.${optionIndex}.distance`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Distância</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: 5km" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                          control={form.control}
                          name={`options.${optionIndex}.bibPrefix`}
                          render={({ field }) => (
                          <FormItem className="w-32">
                              <FormLabel>Prefixo Nº Peito</FormLabel>
                              <FormControl>
                              <Input type="number" placeholder="Ex: 5" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                          )}
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(optionIndex)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                    <LoteArray optionIndex={optionIndex} control={form.control} form={form} />
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ distance: '', bibPrefix: null, lots: [{ name: '1º Lote', price: 100, startDate: '', endDate: '' }] })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Modalidade
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Opções de Entrega do Kit</CardTitle>
                <CardDescription>Configure como os atletas podem receber seus kits.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="kitPickup.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Retirada Presencial</FormLabel>
                        <FormDescription>Permitir que os atletas retirem os kits em um local físico.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                {form.watch('kitPickup.enabled') && (
                  <div className="pl-4 space-y-4 border-l-2 ml-6">
                    <FormField
                      control={form.control}
                      name="kitPickup.location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local de Retirada</FormLabel>
                          <FormControl><Input {...field} value={field.value ?? ''} placeholder="Ex: Shopping Pátio Higienópolis" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kitPickup.details"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Datas e Horários (Opcional)</FormLabel>
                          <FormControl><Textarea {...field} value={field.value ?? ''} placeholder="Ex: De 20/10 a 22/10, das 10h às 20h" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                <Separator />
                <FormField
                  control={form.control}
                  name="kitDelivery.enabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Entrega em Domicílio</FormLabel>
                        <FormDescription>Oferecer envio do kit para o endereço do atleta.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                {form.watch('kitDelivery.enabled') && (
                  <div className="pl-4 border-l-2 ml-6">
                    <FormField
                      control={form.control}
                      name="kitDelivery.price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Fixo da Entrega (R$)</FormLabel>
                          <FormControl><Input type="number" {...field} value={field.value ?? 0} placeholder="25.00" /></FormControl>
                          <FormDescription>Valor único por pedido, não por kit.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Itens do Kit</CardTitle>
                    <CardDescription>Liste os itens que os atletas receberão. Serão exibidos na página da corrida.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="showKitItems"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-4">
                            <div className="space-y-0.5">
                                <FormLabel>Mostrar Itens do Kit na Página</FormLabel>
                                <FormDescription>
                                Se desativado, a seção de itens do kit não será visível para os clientes.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            </FormItem>
                        )}
                    />
                    {kitFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 p-4 border rounded-lg bg-muted/20">
                            <FormField
                                control={form.control}
                                name={`kitItems.${index}.name`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Nome do Item</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Camiseta Oficial" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`kitItems.${index}.brand`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Marca (Opcional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Nike" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeKitItem(index)}
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
                        onClick={() => appendKitItem({ name: '', brand: '' })}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Adicionar Item
                    </Button>
                </CardContent>
            </Card>
            
            <Button type="submit" size="lg" className="w-full">
              Salvar Corrida
            </Button>
          </form>
        </Form>
    </>
  );
}


function LoteArray({ optionIndex, control, form }: { optionIndex: number; control: any, form: any }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `options.${optionIndex}.lots`
  });

  return (
    <div className="pl-4 border-l-2 border-primary/50 space-y-4">
      <h4 className="font-semibold text-sm">Lotes de Inscrição</h4>
      {fields.map((lote, loteIndex) => {
        const pricePath = `options.${optionIndex}.lots.${loteIndex}.price`;
        const isFree = form.watch(pricePath) === 0;

        return (
          <div key={lote.id} className="flex flex-col md:flex-row md:items-end gap-3 p-3 border rounded-md bg-background">
            <FormField
              control={control}
              name={`options.${optionIndex}.lots.${loteIndex}.name`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Nome do Lote</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 1º Lote" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={pricePath}
              render={({ field }) => (
                <FormItem className="md:w-32">
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="120.00" {...field} value={field.value ?? ''} disabled={isFree} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2 pt-5">
                <Switch
                    id={`free-switch-${optionIndex}-${loteIndex}`}
                    checked={isFree}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        form.setValue(pricePath, 0);
                      } else {
                        form.setValue(pricePath, 100); // ou outro valor padrão
                      }
                    }}
                />
                <Label htmlFor={`free-switch-${optionIndex}-${loteIndex}`} className="text-xs font-medium">Grátis</Label>
            </div>
            <FormField
              control={control}
              name={`options.${optionIndex}.lots.${loteIndex}.startDate`}
              render={({ field }) => (
                <FormItem className="md:w-48">
                  <FormLabel>Data de Início</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`options.${optionIndex}.lots.${loteIndex}.endDate`}
              render={({ field }) => (
                <FormItem className="md:w-48">
                  <FormLabel>Data Final</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(loteIndex)}
              className='text-destructive hover:text-destructive hover:bg-destructive/10'
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append({ name: '', price: 100, startDate: '', endDate: '' })}
      >
        <Plus className="mr-2 h-4 w-4" />
        Adicionar Lote
      </Button>
    </div>
  );
}

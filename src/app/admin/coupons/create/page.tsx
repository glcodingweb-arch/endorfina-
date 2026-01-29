
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import { useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const couponSchema = z.object({
  title: z.string().min(3, 'O título é obrigatório.'),
  code: z.string().min(3, 'O código é obrigatório.').max(20, 'Máximo de 20 caracteres.'),
  discountType: z.enum(['percentage', 'fixed'], { required_error: 'Selecione o tipo de desconto.' }),
  discountValue: z.coerce.number().min(0.01, 'O valor do desconto deve ser maior que zero.'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxUses: z.coerce.number().optional(),
  isActive: z.boolean().default(true),
});

type CouponFormValues = z.infer<typeof couponSchema>;

export default function CreateCouponPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      title: '',
      code: nanoid(8).toUpperCase(),
      discountType: 'percentage',
      discountValue: 10,
      isActive: true,
      startDate: '',
      endDate: '',
      maxUses: undefined,
    },
  });

  const generateRandomCode = () => {
    form.setValue('code', nanoid(8).toUpperCase().replace(/_|-/g, ''));
  }

  async function onSubmit(values: CouponFormValues) {
    if (!firestore) return;
    
    const dataToSave = {
      ...values,
      startDate: values.startDate ? new Date(values.startDate) : null,
      endDate: values.endDate ? new Date(values.endDate) : null,
      maxUses: values.maxUses || null, // Convert undefined/0 to null
      currentUses: 0,
      createdAt: serverTimestamp(),
    };
    
    try {
      await addDoc(collection(firestore, 'coupons'), dataToSave);
      toast({
        title: 'Cupom Criado com Sucesso!',
        description: `O cupom "${values.code}" foi adicionado.`,
      });
      router.push('/admin/coupons');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Erro ao criar cupom',
        description: 'Ocorreu um erro ao salvar o cupom.',
        variant: 'destructive',
      });
    }
  }

  const discountType = form.watch('discountType');

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Criar Novo Cupom</h1>
        <p className="text-muted-foreground">Preencha os detalhes para criar um cupom de desconto.</p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Cupom</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título do Cupom</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Desconto de Lançamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código do Cupom</FormLabel>
                    <div className="flex gap-2">
                       <FormControl>
                        <Input placeholder="Ex: BEMVINDO10" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                      </FormControl>
                      <Button type="button" variant="outline" onClick={generateRandomCode}>Gerar</Button>
                    </div>
                     <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo de Desconto</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="percentage" />
                          </FormControl>
                          <FormLabel className="font-normal">Porcentagem (%)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="fixed" />
                          </FormControl>
                          <FormLabel className="font-normal">Valor Fixo (R$)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor do Desconto ({discountType === 'percentage' ? '%' : 'R$'})</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder={discountType === 'percentage' ? '10' : '20.00'} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Início (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Expiração (opcional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                  control={form.control}
                  name="maxUses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Usos Máximos (opcional)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Deixe em branco para usos ilimitados" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
                      <CardDescription>
                        O cupom pode ser usado assim que for salvo.
                      </CardDescription>
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
            </CardContent>
          </Card>
          <div className="flex justify-end">
            <Button type="submit">Salvar Cupom</Button>
          </div>
        </form>
      </Form>
    </>
  );
}

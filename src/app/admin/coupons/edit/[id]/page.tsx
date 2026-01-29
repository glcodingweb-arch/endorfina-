
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import type { Coupon } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDoc, useFirestore } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';

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

const formatDateForInput = (date: any | null): string => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const couponId = params.id as string;
  const firestore = useFirestore();

  const couponRef = useMemoFirebase(() => couponId && firestore ? doc(firestore, 'coupons', couponId) : null, [firestore, couponId]);
  const { data: couponData, loading } = useDoc<Coupon>(couponRef);

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      title: '',
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      isActive: true,
      startDate: '',
      endDate: '',
      maxUses: undefined,
    },
  });
  
  useEffect(() => {
    if (couponData) {
        form.reset({
            ...couponData,
            startDate: formatDateForInput(couponData.startDate),
            endDate: formatDateForInput(couponData.endDate),
        });
    }
  }, [couponData, form]);

  async function onSubmit(values: CouponFormValues) {
    if (!couponRef) return;
    try {
        await updateDoc(couponRef, {
            ...values,
            startDate: values.startDate ? new Date(values.startDate) : null,
            endDate: values.endDate ? new Date(values.endDate) : null,
        });
        toast({
          title: 'Cupom Atualizado!',
          description: `O cupom "${values.code}" foi salvo com sucesso.`,
        });
        router.push('/admin/coupons');
    } catch (e) {
        console.error(e);
        toast({ title: 'Erro ao atualizar cupom.', variant: 'destructive'});
    }
  }

  if (loading) {
    return <Skeleton className="h-96 w-full" />
  }

  if (!couponData) {
    return (
       <>
        <h1 className="text-2xl font-bold">Cupom não encontrado.</h1>
         <Button onClick={() => router.push('/admin/coupons')} className="mt-4 w-fit">Voltar para a lista</Button>
      </>
    )
  }

  const discountType = form.watch('discountType');

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Editar Cupom: {couponData.title}</h1>
        <p className="text-muted-foreground">Ajuste os detalhes e salve as alterações.</p>
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
                    <FormControl>
                      <Input placeholder="Ex: BEMVINDO10" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
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
                        <Input type="number" placeholder="Deixe em branco para usos ilimitados" {...field} value={field.value ?? ''}/>
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
          <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </Form>
    </>
  );
}

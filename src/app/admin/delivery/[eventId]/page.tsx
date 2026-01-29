'use client';

import { useState, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCollection, useDoc, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where, doc, updateDoc, arrayUnion, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import type { Order, Race, DeliveryAttempt } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { QrReader } from 'react-qr-reader';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, Clock, XCircle, AlertTriangle, Loader2, Printer, Search, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertTitle } from '@/components/ui/alert';

type DeliveryStatus = 'Pendente' | 'Impresso' | 'Entregue' | 'NaoAtendido' | 'Problema';

const statusConfig: Record<DeliveryStatus, { label: string; variant: 'secondary' | 'default' | 'outline' | 'destructive', icon: React.ElementType }> = {
    Pendente: { label: 'Pendente', variant: 'secondary', icon: Clock },
    Impresso: { label: 'Impresso', variant: 'outline', icon: Printer },
    Entregue: { label: 'Entregue', variant: 'default', icon: CheckCircle },
    NaoAtendido: { label: 'Não Atendido', variant: 'outline', icon: XCircle },
    Problema: { label: 'Problema', variant: 'destructive', icon: AlertTriangle },
};

const updateStatusSchema = z.object({
  status: z.enum(['Entregue', 'NaoAtendido', 'Problema'], { required_error: "Selecione um status."}),
  observation: z.string(),
}).refine(data => {
    return data.status === 'Entregue' ? true : data.observation.trim().length >= 10;
}, {
    message: "A observação é obrigatória e deve ter no mínimo 10 caracteres.",
    path: ["observation"],
});

type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;


export default function EventDeliveryPage() {
    const params = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { user } = useUser();
    const eventId = params.eventId as string;

    const [filter, setFilter] = useState<DeliveryStatus | 'all'>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // States for the new validation logic
    const [validationTerm, setValidationTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [validationMessage, setValidationMessage] = useState<{type: 'success' | 'error' | 'info', message: string, description?: string} | null>(null);
    const [scannerOpen, setScannerOpen] = useState(false);
    const isScanPaused = useRef(false);


    const raceRef = useMemoFirebase(() => (firestore && eventId) ? doc(firestore, 'races', eventId) : null, [firestore, eventId]);
    const { data: race, loading: loadingRace } = useDoc<Race>(raceRef);

    const ordersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'orders'), 
            where('raceId', '==', eventId),
            where('deliveryMethod', '==', 'home')
        );
    }, [firestore, eventId]);
    const { data: orders, loading: loadingOrders } = useCollection<Order>(ordersQuery);

    const form = useForm<UpdateStatusFormValues>({
        resolver: zodResolver(updateStatusSchema),
        defaultValues: { status: undefined, observation: '' },
    });
    
    const filteredOrders = useMemo(() => {
        if (!orders) return [];
        if (filter === 'all') return orders;
        const statusToFilter = filter as DeliveryStatus;
        return orders.filter(o => (o.kitDeliveryStatus || 'Pendente') === statusToFilter);
    }, [orders, filter]);

    async function handleUpdateStatus(data: UpdateStatusFormValues) {
        if (!firestore || !selectedOrder || !user) return;
        
        const orderRef = doc(firestore, 'orders', selectedOrder.id);
        const newAttempt: DeliveryAttempt = {
            agentId: user.uid,
            agentName: user.displayName || 'Entregador',
            status: data.status,
            observation: data.observation,
            timestamp: serverTimestamp(),
        };

        try {
            await updateDoc(orderRef, {
                kitDeliveryStatus: data.status,
                deliveryAttempts: arrayUnion(newAttempt),
            });
            toast({ title: 'Status atualizado com sucesso!' });
            setSelectedOrder(null);
            form.reset();
        } catch (error) {
            console.error(error);
            toast({ title: 'Erro ao atualizar', variant: 'destructive'});
        }
    }
    
    const handlePrintLabel = async () => {
        if (!firestore || !selectedOrder) return;

        const printUrl = `/admin/delivery/print?orderNumber=${selectedOrder.orderNumber}&name=${encodeURIComponent(selectedOrder.responsibleName || '')}&address=${encodeURIComponent(selectedOrder.deliveryAddress || 'Endereço não informado')}&phone=${encodeURIComponent(selectedOrder.responsiblePhone || 'N/A')}&eventName=${encodeURIComponent(race?.name || 'Evento')}&items=${selectedOrder.participantIds.length ?? 0}`;

        const currentStatus = selectedOrder.kitDeliveryStatus || 'Pendente';
        if (currentStatus === 'Pendente') {
            const orderRef = doc(firestore, 'orders', selectedOrder.id);
            try {
                await updateDoc(orderRef, {
                    kitDeliveryStatus: 'Impresso',
                    firstPrintedAt: serverTimestamp(),
                });
                toast({ title: 'Status atualizado para "Impresso".' });
            } catch (error) {
                console.error("Failed to update status to 'Impresso'", error);
                toast({ title: 'Erro ao atualizar status', variant: 'destructive' });
            }
        }
        
        window.open(printUrl, '_blank', 'noopener,noreferrer');
    };

    const handleValidate = async (code: string) => {
        if (!code.trim()) return;
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Erro de Conexão' });
            return;
        }

        setIsSearching(true);
        setValidationMessage(null);
        setValidationTerm(code); // Store the term that was used for validation

        const q = query(
            collection(firestore, 'orders'),
            where('orderNumber', '==', code.trim()),
            where('raceId', '==', eventId),
            limit(1)
        );

        try {
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                setValidationMessage({ type: 'error', message: 'Pedido não encontrado', description: `Nenhuma entrega encontrada com o código "${code}" para este evento.` });
                return;
            }

            const orderDoc = snapshot.docs[0];
            const orderData = orderDoc.data() as Order;

            if (orderData.deliveryMethod !== 'home') {
                setValidationMessage({ type: 'error', message: 'Entrega não aplicável', description: 'Este pedido não é para entrega em domicílio.' });
                return;
            }

            if (orderData.kitDeliveryStatus === 'Entregue') {
                setValidationMessage({ type: 'info', message: 'Kit já foi entregue', description: `O pedido para ${orderData.responsibleName} já foi concluído.` });
            } else if (orderData.kitDeliveryStatus === 'Pendente' || orderData.kitDeliveryStatus === 'Impresso') {
                await updateDoc(doc(firestore, 'orders', orderDoc.id), { kitDeliveryStatus: 'Entregue' });
                setValidationMessage({ type: 'success', message: 'Entrega Validada!', description: `Pedido de ${orderData.responsibleName} atualizado para Entregue.` });
                toast({ title: 'Entrega confirmada com sucesso!' });
                new Audio('/confirm.mp3').play();
            } else {
                setValidationMessage({ type: 'info', message: `Status: ${orderData.kitDeliveryStatus || 'N/A'}`, description: 'O status atual deste pedido não permite a validação da entrega.' });
            }
        } catch (error) {
            console.error("Validation error:", error);
            setValidationMessage({ type: 'error', message: 'Erro ao validar', description: 'Ocorreu um problema ao buscar o pedido.' });
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleScan = (scanData: any) => {
        if (scanData?.text && !isScanPaused.current) {
            isScanPaused.current = true;
            const scannedCode = scanData.text;
            setValidationTerm(scannedCode);
            handleValidate(scannedCode);
            setScannerOpen(false);
            toast({ title: 'QR Code Lido!', description: `Código: ${scannedCode}` });
            setTimeout(() => {
                isScanPaused.current = false;
            }, 3000);
        }
    }
    
    const loading = loadingRace || loadingOrders;

    return (
        <>
            <div className="space-y-8">
                <header>
                    <Button variant="ghost" onClick={() => router.push('/admin/delivery')} className="mb-4 pl-0">
                       <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Eventos
                    </Button>
                    {loading ? <Skeleton className="h-10 w-2/3" /> : (
                        <>
                            <h1 className="text-3xl font-bold">Entregas: {race?.name}</h1>
                            <p className="text-muted-foreground">Gerencie todos os pedidos com entrega em domicílio.</p>
                        </>
                    )}
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Validação Rápida de Entrega</CardTitle>
                        <CardDescription>Use um leitor de código de barras ou digite o número do pedido para validar a entrega.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                             <Input 
                                placeholder="Ler código ou digitar número do pedido..."
                                value={validationTerm}
                                onChange={(e) => {
                                    setValidationTerm(e.target.value);
                                    if(validationMessage) setValidationMessage(null);
                                }}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleValidate(validationTerm) }}
                                className="h-12 text-lg"
                             />
                             <Button onClick={() => handleValidate(validationTerm)} disabled={isSearching} className="h-12 px-6">
                                {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4"/>}
                                Validar
                             </Button>
                             <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="h-12 w-12 p-0">
                                        <QrCode className="h-6 w-6" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-center">Câmera ativa</DialogTitle>
                                        <DialogDescription className="text-center">
                                            Aponte para o QR Code.
                                        </DialogDescription>
                                    </DialogHeader>
                                    {scannerOpen && (
                                        <div style={{ display: 'none' }}>
                                            <QrReader 
                                                onResult={handleScan} 
                                                constraints={{ facingMode: 'environment' }} 
                                            />
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </div>
                        {validationMessage && (
                            <Alert className="mt-4" variant={validationMessage.type === 'error' ? 'destructive' : 'default'}>
                                <AlertTitle className="flex items-center gap-2">
                                    {validationMessage.type === 'success' && <CheckCircle className="h-4 w-4" />}
                                    {validationMessage.type === 'error' && <XCircle className="h-4 w-4" />}
                                    {validationMessage.type === 'info' && <AlertTriangle className="h-4 w-4" />}
                                    {validationMessage.message}
                                </AlertTitle>
                                {validationMessage.description && <p className="text-sm mt-1">{validationMessage.description}</p>}
                            </Alert>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Pedidos</CardTitle>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {(['all', 'Pendente', 'Impresso', 'Entregue', 'NaoAtendido', 'Problema'] as const).map(f => (
                                <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}>
                                    {f === 'all' ? 'Todos' : statusConfig[f as DeliveryStatus].label}
                                </Button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Desktop Table */}
                        <Table className="hidden md:table">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Pedido</TableHead>
                                    <TableHead>Responsável</TableHead>
                                    <TableHead>Endereço</TableHead>
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Inscrições</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && Array.from({length: 3}).map((_,i) => (
                                    <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-10 w-full"/></TableCell></TableRow>
                                ))}
                                {!loading && filteredOrders.map(order => {
                                    const currentStatus = order.kitDeliveryStatus || 'Pendente';
                                    const StatusIcon = statusConfig[currentStatus].icon;
                                    return (
                                        <TableRow key={order.id} onClick={() => setSelectedOrder(order)} className="cursor-pointer">
                                            <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                                            <TableCell>{order.responsibleName}</TableCell>
                                            <TableCell>{order.deliveryAddress || 'Não informado'}</TableCell>
                                            <TableCell>{order.responsiblePhone || 'N/A'}</TableCell>
                                            <TableCell className="text-center">{order.participantIds.length}</TableCell>
                                            <TableCell>
                                                <Badge
                                                  variant={statusConfig[currentStatus].variant}
                                                  className={
                                                    currentStatus === 'Impresso'
                                                      ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80 dark:border-transparent dark:bg-blue-950 dark:text-blue-300'
                                                      : ''
                                                  }
                                                >
                                                  <StatusIcon className="mr-2 h-3 w-3"/>
                                                  {statusConfig[currentStatus].label}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                                {!loading && filteredOrders.length === 0 && (
                                    <TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhum pedido encontrado para este filtro.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                        
                        {/* Mobile Cards */}
                        <div className="space-y-4 md:hidden">
                            {loading && Array.from({length: 3}).map((_,i) => (
                                <Skeleton key={i} className="h-28 w-full rounded-xl" />
                            ))}
                            {!loading && filteredOrders.map(order => {
                                const currentStatus = order.kitDeliveryStatus || 'Pendente';
                                const StatusIcon = statusConfig[currentStatus].icon;
                                return (
                                    <Card key={order.id} onClick={() => setSelectedOrder(order)} className="p-4 cursor-pointer hover:bg-muted/50 active:bg-muted/80">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <p className="font-bold text-sm">{order.responsibleName}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{order.orderNumber}</p>
                                            </div>
                                            <Badge
                                                variant={statusConfig[currentStatus].variant}
                                                className={
                                                    currentStatus === 'Impresso'
                                                    ? 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100/80'
                                                    : ''
                                                }
                                            >
                                                <StatusIcon className="mr-1.5 h-3 w-3"/>
                                                {statusConfig[currentStatus].label}
                                            </Badge>
                                        </div>
                                        <div className="mt-3 text-xs text-muted-foreground space-y-1">
                                            <p>{order.deliveryAddress || 'Endereço não informado'}</p>
                                            <p><strong>{order.participantIds.length}</strong> kit(s)</p>
                                        </div>
                                    </Card>
                                )
                            })}
                            {!loading && filteredOrders.length === 0 && (
                                <div className="h-24 text-center flex items-center justify-center">
                                    <p>Nenhum pedido encontrado para este filtro.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!selectedOrder} onOpenChange={(isOpen) => { if(!isOpen) { setSelectedOrder(null); form.reset(); }}}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Atualizar Status da Entrega</DialogTitle>
                        <DialogDescription>Pedido: <span className="font-mono">{selectedOrder?.orderNumber}</span></DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleUpdateStatus)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Novo Status</FormLabel>
                                        <FormControl>
                                            <RadioGroup onValueChange={field.onChange} className="space-y-2">
                                                {Object.entries(statusConfig).filter(([key]) => key !== 'Pendente' && key !== 'Impresso').map(([key, config]) => (
                                                    <Label key={key} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer has-[:checked]:bg-muted has-[:checked]:border-primary">
                                                        <RadioGroupItem value={key} />
                                                        <config.icon className="w-4 h-4"/>
                                                        {config.label}
                                                    </Label>
                                                ))}
                                            </RadioGroup>
                                        </FormControl>
                                         <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="observation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observação (obrigatória se não entregue)</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Ex: Cliente ausente, retornarei amanhã." {...field} />
                                        </FormControl>
                                         <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter className="sm:justify-between flex-col-reverse sm:flex-row gap-2">
                                <Button onClick={handlePrintLabel} variant="outline" type="button">
                                    <Printer className="mr-2 h-4 w-4" />
                                    Imprimir Etiqueta
                                </Button>
                                <div className="flex gap-2 self-end">
                                    <Button type="button" variant="ghost" onClick={() => { setSelectedOrder(null); form.reset(); }}>Cancelar</Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        Salvar Status
                                    </Button>
                                </div>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

    

    

    

    

    
    
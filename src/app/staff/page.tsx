
'use client';

import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ticket, CheckCircle, XCircle, Search, QrCode, ShieldAlert, Package, Shirt, User, Trophy, List, ArrowLeft, Calendar, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import dynamic from 'next/dynamic';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, getDoc, updateDoc, type DocumentReference, query, where, getDocs } from 'firebase/firestore';
import type { Race, Participant } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const QrReader = dynamic(
    () => import('react-qr-reader').then((m) => m.QrReader),
    { ssr: false }
);


type ValidationStatus = 'VALIDO' | 'RETIRADO' | 'INVALIDO';
interface KitValidationResult {
  status: ValidationStatus;
  participant: Participant | null;
  race: Race | null;
}

async function validateRegistration(
    firestore: any,
    searchTerm: string,
    eventId: string
): Promise<KitValidationResult> {
    
    if (!firestore) throw new Error("Firestore not initialized");

    const participantsRef = collection(firestore, 'participants');
    // Normalize search term for queries
    const normalizedSearch = searchTerm.trim();
    
    if (!normalizedSearch) {
        return { status: 'INVALIDO', participant: null, race: null };
    }

    // Build potential queries
    const queries = [
        query(participantsRef, where('__name__', '==', normalizedSearch), where('raceId', '==', eventId)), // By ID (QR Code)
        query(participantsRef, where('bibNumber', '==', normalizedSearch), where('raceId', '==', eventId)), // By Bib Number
        query(participantsRef, where('userProfile.documentNumber', '==', normalizedSearch), where('raceId', '==', eventId)), // By CPF
        query(participantsRef, where('userProfile.fullName', '==', normalizedSearch), where('raceId', '==', eventId)), // By Full Name
        query(participantsRef, where('userProfile.email', '==', normalizedSearch), where('raceId', '==', eventId)), // By Email
    ];

    let participantSnap = null;

    for (const q of queries) {
        const snapshot = await getDocs(q.limit(1));
        if (!snapshot.empty) {
            participantSnap = snapshot.docs[0];
            break;
        }
    }

    if (!participantSnap || !participantSnap.exists()) {
        return { status: 'INVALIDO', participant: null, race: null };
    }

    const participantData = { ...participantSnap.data(), id: participantSnap.id } as Participant;
    
    const raceRef = doc(firestore, 'races', eventId) as DocumentReference<Race>;
    const raceSnap = await getDoc(raceRef);

    if (!raceSnap.exists()) {
       return { status: 'INVALIDO', participant: null, race: null };
    }

    const raceData = { ...raceSnap.data(), id: raceSnap.id };

    if (participantData.kitStatus === 'retirado') {
         return { status: 'RETIRADO', participant: participantData, race: raceData };
    }
    
    // Additional validation: ensure payment is confirmed
    if (participantData.status !== 'IDENTIFICADA' && participantData.status !== 'VALIDADA') {
        return { status: 'INVALIDO', participant: participantData, race: raceData };
    }

    return { status: 'VALIDO', participant: participantData, race: raceData };
}

interface ResultDisplayProps {
    result: KitValidationResult;
    code: string;
    onConfirmWithdrawal: (participantId: string, responsibleName?: string, observation?: string) => Promise<void>;
    onReset: () => void;
}

function ResultDisplay({ result, code, onConfirmWithdrawal, onReset }: ResultDisplayProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [isManualFlow, setIsManualFlow] = useState(false);
    const [responsibleName, setResponsibleName] = useState('');
    const [observation, setObservation] = useState('');

    const handleConfirm = async () => {
        if (!result.participant) return;
        setIsConfirming(true);
        try {
            await onConfirmWithdrawal(result.participant.id, isManualFlow ? responsibleName : undefined, isManualFlow ? observation : undefined);
        } finally {
            setIsConfirming(false);
        }
    }

    const statusConfig = {
        VALIDO: { title: 'Inscrição Válida', description: 'Kit pronto para retirada.', icon: <CheckCircle className="h-10 w-10 text-green-500" />, variant: 'default' as const, bgColor: 'bg-green-50 border-green-200' },
        RETIRADO: { title: 'Kit Já Retirado', description: 'Este kit já foi entregue anteriormente.', icon: <ShieldAlert className="h-10 w-10 text-yellow-500" />, variant: 'default' as const, bgColor: 'bg-yellow-50 border-yellow-200' },
        INVALIDO: { title: 'Inscrição Inválida', description: result.participant ? 'Pagamento pendente ou inscrição bloqueada.' : 'Código não encontrado neste evento.', icon: <XCircle className="h-10 w-10 text-destructive" />, variant: 'destructive' as const, bgColor: '' },
    };

    const config = statusConfig[result.status];

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-8">
            <Alert variant={config.variant} className={config.bgColor}>
                <div className="flex flex-col items-center text-center gap-4">
                    {config.icon}
                    <div className='w-full'>
                        <AlertTitle className="text-xl font-bold mb-1">{config.title}</AlertTitle>
                        <AlertDescription className="mb-6">{config.description}</AlertDescription>
                        
                        {result.status !== 'INVALIDO' && result.participant && (
                           <Card className="text-left bg-background/50"><CardContent className="p-4 space-y-3">
                               <p><User className="inline-block mr-2 h-4 w-4 text-muted-foreground"/><strong>Atleta:</strong> {result.participant.userProfile?.fullName}</p>
                               <p><Trophy className="inline-block mr-2 h-4 w-4 text-muted-foreground"/><strong>Evento:</strong> {result.race?.name}</p>
                               <p><Package className="inline-block mr-2 h-4 w-4 text-muted-foreground"/><strong>Kit:</strong> {result.participant.kitType ?? 'Padrão'}</p>
                               <p><Shirt className="inline-block mr-2 h-4 w-4 text-muted-foreground"/><strong>Camiseta:</strong> {result.participant.shirtSize}</p>
                           </CardContent></Card>
                        )}
                         <p className="text-xs text-muted-foreground mt-4"><strong>Busca:</strong> <span className="font-mono bg-muted px-1.5 py-0.5 rounded-md">{code}</span></p>
                    </div>

                     {result.status === 'VALIDO' && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button className="w-full mt-4">Registrar Entrega</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Entrega do Kit?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Confirmo que o kit para <strong className="text-foreground">{result.participant?.userProfile?.fullName}</strong> (Nº {result.participant?.bibNumber}) foi entregue corretamente.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                {isManualFlow && (
                                     <div className="space-y-4">
                                        <Input placeholder="Nome do Responsável (se não for o atleta)" value={responsibleName} onChange={e => setResponsibleName(e.target.value)} />
                                        <Input placeholder="Observação (obrigatório)" value={observation} onChange={e => setObservation(e.target.value)} required />
                                    </div>
                                )}
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleConfirm} disabled={isConfirming || (isManualFlow && !observation)}>
                                        {isConfirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                        Confirmar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    <Button variant="outline" onClick={onReset} className="w-full mt-2">Nova Busca</Button>
                </div>
            </Alert>
        </motion.div>
    );
}

export default function StaffPage() {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [result, setResult] = useState<KitValidationResult | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isScanPaused = useRef(false);
  const { toast } = useToast();
  const firestore = useFirestore();

  const racesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'races') : null, [firestore]);
  const { data: races, loading: loadingRaces } = useCollection<Race>(racesQuery);

  async function processValidation(term: string) {
    if (!selectedEventId) {
        toast({ variant: 'destructive', title: 'Nenhum evento selecionado' });
        return;
    }
    setIsLoading(true);
    setResult(null);
    try {
        const validationResult = await validateRegistration(firestore, term, selectedEventId);
        setResult(validationResult);
    } catch(e) {
        console.error(e);
        toast({ title: 'Erro na Validação', variant: 'destructive'});
    } finally {
        setIsLoading(false);
    }
  }
  
  async function handleConfirmWithdrawal(participantId: string) {
    if (!firestore) return;
    const participantRef = doc(firestore, 'participants', participantId);
    try {
      await updateDoc(participantRef, { kitStatus: 'retirado' });
      toast({ title: 'Retirada Confirmada!' });
      new Audio('/confirm.mp3').play();
      processValidation(participantId); // Re-validate to show "RETIRADO" status
    } catch (e) {
      console.error(e);
      toast({ title: 'Erro ao confirmar retirada', variant: 'destructive' });
    }
  }

  function handleScan(scanData: any) {
    if (scanData?.text && !isScanPaused.current) {
        isScanPaused.current = true;
        const scannedCode = scanData.text;
        setSearchTerm(scannedCode);
        processValidation(scannedCode);
        setScannerOpen(false);
        toast({ title: 'QR Code Lido!', description: `Código: ${scannedCode}` });
        setTimeout(() => {
            isScanPaused.current = false;
        }, 3000);
    }
  }
  
  const resetSearch = () => {
    setSearchTerm('');
    setResult(null);
  }

  return (
    <div className="mx-auto max-w-2xl w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-4xl font-extrabold tracking-tight text-center">Validação de Kits</h1>
        </motion.div>

        <Card className="my-6">
            <CardHeader><CardTitle>1. Selecione o Evento</CardTitle></CardHeader>
            <CardContent>
                <Select onValueChange={setSelectedEventId} disabled={loadingRaces}>
                    <SelectTrigger><SelectValue placeholder={loadingRaces ? "Carregando..." : "Selecione um evento"} /></SelectTrigger>
                    <SelectContent>{races?.map(race => <SelectItem key={race.id} value={race.id}>{race.name}</SelectItem>)}</SelectContent>
                </Select>
            </CardContent>
        </Card>

        <AnimatePresence>
            {selectedEventId && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card><CardHeader><CardTitle>2. Buscar Atleta</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row items-center gap-2">
                                <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ID, CPF, Nome ou Nº Peito" className="flex-grow h-12"/>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button onClick={() => processValidation(searchTerm)} className="w-full h-12 flex-1" disabled={isLoading}>{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Validar</Button>
                                    <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
                                        <DialogTrigger asChild><Button variant="outline" className="h-12 w-12 p-0"><QrCode className="h-6 w-6" /></Button></DialogTrigger>
                                        <DialogContent><DialogHeader><DialogTitle>Aponte para o QR Code</DialogTitle></DialogHeader>{scannerOpen && <QrReader onResult={handleScan} constraints={{ facingMode: 'environment' }} />}</DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
        
        <AnimatePresence>
          {result && <ResultDisplay result={result} code={searchTerm} onConfirmWithdrawal={handleConfirmWithdrawal} onReset={resetSearch} />}
        </AnimatePresence>
    </div>
  );
}

    

    
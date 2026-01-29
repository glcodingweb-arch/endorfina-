'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, Search, Printer, CheckCircle, ShieldAlert, XCircle, Package, Shirt, User as UserIcon, Trophy, Loader2, QrCode, ArrowLeft, Edit, List, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCollection, useFirestore } from '@/firebase';
import type { Race, Participant } from '@/lib/types';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, doc, updateDoc, getDocs, where, limit, getDoc, serverTimestamp, DocumentReference, orderBy } from 'firebase/firestore';
import './amethyst-validator.css';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const QrReader = dynamic(
  () => import('react-qr-reader').then((m) => m.QrReader),
  { ssr: false }
);


type ValidationStatus = 'VALIDO' | 'RETIRADO' | 'INVALIDO';
interface KitValidationResult {
  status: ValidationStatus;
  participant: Participant | null;
  race: Race | null;
  justDelivered?: boolean;
}

async function validateRegistration(
    firestore: any,
    searchTerm: string,
    eventId: string
): Promise<KitValidationResult> {
    
    if (!firestore) throw new Error("Firestore not initialized");

    const participantsRef = collection(firestore, 'participants');
    const normalizedSearch = searchTerm.trim();
    
    if (!normalizedSearch) {
        return { status: 'INVALIDO', participant: null, race: null };
    }

    const unformattedCPF = normalizedSearch.replace(/\D/g, '');
    let formattedCPF = '';
    if (unformattedCPF.length === 11) {
        formattedCPF = unformattedCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    const queries = [
        query(participantsRef, where('__name__', '==', normalizedSearch), where('raceId', '==', eventId), limit(1)),
        query(participantsRef, where('bibNumber', '==', normalizedSearch), where('raceId', '==', eventId), limit(1)),
    ];
    
    if (unformattedCPF.length === 11) {
        queries.push(query(participantsRef, where('userProfile.documentNumber', '==', unformattedCPF), where('raceId', '==', eventId), limit(1)));
        queries.push(query(participantsRef, where('userProfile.documentNumber', '==', formattedCPF), where('raceId', '==', eventId), limit(1)));
    }
    
    queries.push(query(participantsRef, where('userProfile.fullName', '==', normalizedSearch), where('raceId', '==', eventId), limit(1)));
    queries.push(query(participantsRef, where('userProfile.email', '==', normalizedSearch), where('raceId', '==', eventId), limit(1)));
    
    if (normalizedSearch !== formattedCPF && normalizedSearch !== unformattedCPF) {
       queries.push(query(participantsRef, where('userProfile.documentNumber', '==', normalizedSearch), where('raceId', '==', eventId), limit(1)));
    }


    let participantSnap = null;

    for (const q of queries) {
        try {
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                participantSnap = snapshot.docs[0];
                break;
            }
        } catch (e) {
            console.warn("A query failed, but we are continuing.", e);
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
    
    if (participantData.status !== 'IDENTIFICADA' && participantData.status !== 'VALIDADA') {
        return { status: 'INVALIDO', participant: participantData, race: raceData };
    }

    return { status: 'VALIDO', participant: participantData, race: raceData };
}

interface ResultDisplayProps {
    result: KitValidationResult;
    code: string;
    onReset: () => void;
}

function ResultDisplay({ result, code, onReset }: ResultDisplayProps) {
    
    const statusConfig = {
        VALIDO: { title: 'Entrega Confirmada!', description: 'O kit foi registrado como entregue com sucesso.', icon: <CheckCircle className="h-10 w-10 text-green-500" />, variant: 'default' as const, bgColor: 'bg-green-50 border-green-200' },
        RETIRADO: { title: 'Kit Já Retirado', description: 'Este kit já foi entregue anteriormente.', icon: <ShieldAlert className="h-10 w-10 text-yellow-500" />, variant: 'default' as const, bgColor: 'bg-yellow-50 border-yellow-200' },
        INVALIDO: { title: 'Inscrição Inválida', description: result.participant ? 'Pagamento pendente ou inscrição bloqueada.' : 'Código não encontrado neste evento.', icon: <XCircle className="h-10 w-10 text-destructive" />, variant: 'destructive' as const, bgColor: '' },
    };

    const config = statusConfig[result.status];
    let title = config.title;
    let description = config.description;

    if (result.status === 'VALIDO' && result.justDelivered) {
        title = 'Entrega Confirmada!';
        description = 'O kit foi registrado como entregue com sucesso.';
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mt-8">
            <Alert variant={config.variant} className={config.bgColor}>
                <div className="flex flex-col items-center text-center gap-4">
                    {config.icon}
                    <div className='w-full'>
                        <AlertTitle className="text-xl font-bold mb-1">{title}</AlertTitle>
                        <AlertDescription className="mb-6">{description}</AlertDescription>
                        
                        {result.participant && (
                           <Card className="text-left bg-background/50"><CardContent className="p-4 space-y-3">
                               <p><UserIcon className="inline-block mr-2 h-4 w-4 text-muted-foreground"/><strong>Atleta:</strong> {result.participant.userProfile?.fullName}</p>
                               <p><Trophy className="inline-block mr-2 h-4 w-4 text-muted-foreground"/><strong>Evento:</strong> {result.race?.name}</p>
                               <p><Package className="inline-block mr-2 h-4 w-4 text-muted-foreground"/><strong>Kit:</strong> {result.participant.kitType ?? 'Padrão'}</p>
                               <p><Shirt className="inline-block mr-2 h-4 w-4 text-muted-foreground"/><strong>Camiseta:</strong> {result.participant.shirtSize}</p>
                           </CardContent></Card>
                        )}
                         <p className="text-xs text-muted-foreground mt-4"><strong>Busca:</strong> <span className="font-mono bg-muted px-1.5 py-0.5 rounded-md">{code}</span></p>
                    </div>

                    <Button variant="outline" onClick={onReset} className="w-full mt-2">Nova Busca</Button>
                </div>
            </Alert>
        </motion.div>
    );
}

function AmethystValidatorPage() {
    const { toast } = useToast();
    const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
    const [isScannerDialogOpen, setIsScannerDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [result, setResult] = useState<KitValidationResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isScanPaused = useRef(false);

    const firestore = useFirestore();
    const racesQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'races'), orderBy('date', 'desc')) : null, [firestore]);
    const { data: races, loading: loadingRaces } = useCollection<Race>(racesQuery);
    
    const stopCamera = () => {
        setIsScannerDialogOpen(false);
    };

    const startCamera = async () => {
        if (!selectedRaceId) {
            toast({ variant: "destructive", title: "Selecione um evento" });
            return;
        }
        setResult(null);
        setIsScannerDialogOpen(true);
    };
    
    const processValidation = useCallback(async (term: string) => {
        const searchValue = term.trim();
        if (!searchValue || !firestore) return;
        if (!selectedRaceId) {
            toast({ variant: 'destructive', title: 'Selecione um evento' });
            return;
        }
        
        setIsLoading(true);
        setResult(null);

        try {
            const validationResult = await validateRegistration(firestore, searchValue, selectedRaceId);
            
            if (validationResult.status === 'VALIDO' && validationResult.participant) {
                const participantRef = doc(firestore, 'participants', validationResult.participant.id);
                await updateDoc(participantRef, { kitStatus: 'retirado', updatedAt: serverTimestamp() });
                setResult({ ...validationResult, status: 'VALIDO', justDelivered: true });
                toast({ title: 'Entrega Confirmada!', description: `${validationResult.participant.userProfile?.fullName} agora tem o kit.` });
                new Audio('/confirm.mp3').play();
            } else {
                setResult(validationResult);
                if (validationResult.status === 'RETIRADO') {
                    toast({ variant: 'default', title: 'Kit já retirado', description: 'Este kit foi entregue anteriormente.'});
                } else if (validationResult.status === 'INVALIDO') {
                    toast({ variant: 'destructive', title: 'Inscrição Inválida', description: validationResult.participant ? 'Pagamento pendente ou inscrição bloqueada.' : 'Código não encontrado neste evento.'});
                }
            }
        } catch(e) {
            console.error(e);
            toast({ title: 'Erro na Validação', variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    }, [firestore, selectedRaceId, toast]);

    const handleScan = (scannedCode: string | undefined | null) => {
        if (scannedCode && !isLoading && !isScanPaused.current) {
            isScanPaused.current = true;
            stopCamera();
            setSearchTerm(scannedCode);
            processValidation(scannedCode);
            toast({ title: 'QR Code Lido!', description: `Código: ${scannedCode}` });
             setTimeout(() => {
                isScanPaused.current = false;
            }, 3000);
        }
    };
    
    const resetView = () => {
        setResult(null);
        setSearchTerm('');
    };
    
    return (
    <>
        <div className="container">
            <header className="no-print my-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Validador de Kits</h1>
            </header>
            
            <div className="form-group glass-card no-print">
                 <label className="form-label">Contexto do Evento</label>
                 <Select
                    onValueChange={(value) => {
                        setSelectedRaceId(value);
                        resetView();
                    }}
                    value={selectedRaceId || ''}
                    disabled={loadingRaces}
                 >
                    <SelectTrigger className="select-custom">
                        <SelectValue placeholder={loadingRaces ? "Carregando eventos..." : "Selecione um evento para começar"} />
                    </SelectTrigger>
                    <SelectContent>
                        {races?.map(race => (
                            <SelectItem key={race.id} value={race.id}>{race.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="main-grid">
                <div className="sidebar">
                    <div className="glass-card no-print" style={{ marginBottom: '2rem' }}>
                        
                        <Card className="text-center bg-card">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold">Leitor de QR Code</CardTitle>
                            </CardHeader>
                            <CardContent className="h-72 lg:h-80 flex flex-col items-center justify-center p-0 overflow-hidden rounded-b-lg">
                                <div className="space-y-2 text-center">
                                    <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto">
                                        <Camera className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="font-semibold text-lg">Leitor de Câmera</p>
                                    <p className="text-sm text-muted-foreground">Clique em "Ativar Validação" para usar a câmera.</p>
                                </div>
                            </CardContent>
                        </Card>

                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                            <Button className="btn-primary" style={{ flex: 2 }} id="btn-start-camera" onClick={startCamera} disabled={!selectedRaceId || isScannerDialogOpen}>
                                Ativar Validação
                            </Button>
                            <Button variant="outline" className="btn-outline" style={{ flex: 1 }} id="btn-stop-camera" onClick={stopCamera} disabled={!isScannerDialogOpen}>
                                Desligar
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="content-area">
                    <div className="glass-card no-print" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Busca Manual do Atleta</label>
                        <div className="search-box">
                            <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} type="text" className="input-custom" id="cpf-search" placeholder="Digite o ID, CPF ou Nº de Peito" />
                            <Button className="btn-primary" onClick={() => processValidation(searchTerm)} disabled={!selectedRaceId || isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                                {isLoading ? '' : 'Validar'}
                            </Button>
                        </div>
                    </div>
                    
                    <AnimatePresence>
                        {result && <ResultDisplay result={result} code={searchTerm} onReset={resetView} />}
                    </AnimatePresence>

                    {!result && !isLoading && !selectedRaceId && (
                         <div id="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--amethyst-border)', borderRadius: 'var(--amethyst-radius-lg)', color: 'var(--amethyst-text-muted)' }}>
                            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: 0.3, margin: '0 auto' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18"></path></svg>
                            <p className="mt-4 font-bold text-lg">Selecione um evento</p>
                            <p className="text-sm">Escolha uma corrida no menu acima para começar a validação.</p>
                        </div>
                    )}

                    {!result && !isLoading && selectedRaceId && (
                        <div id="empty-state" style={{ textAlign: 'center', padding: '4rem 2rem', border: '2px dashed var(--amethyst-border)', borderRadius: 'var(--amethyst-radius-lg)', color: 'var(--amethyst-text-muted)' }}>
                            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: 0.3, margin: '0 auto' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                            <p className="mt-4">Aguardando validação ou busca de atleta</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        <Dialog open={isScannerDialogOpen} onOpenChange={setIsScannerDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-center">Câmera ativa</DialogTitle>
                    <DialogDescription className="text-center">
                        Aponte para o QR Code.
                    </DialogDescription>
                </DialogHeader>
                <div style={{ display: 'none' }}>
                    <QrReader
                        onResult={(result) => handleScan(result?.text)}
                        constraints={{ facingMode: 'environment' }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    </>
  );
}

export default AmethystValidatorPage;
    
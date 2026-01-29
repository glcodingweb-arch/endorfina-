'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFirestore, useAuth } from '@/firebase';
import { collection, getDocs, writeBatch, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { RACES_DATA } from '@/lib/races';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Trash2, Dna, Loader2, UserPlus, Sparkles, Mail } from 'lucide-react';
import type { Race } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CollectionName = 'races' | 'coupons' | 'contactMessages' | 'combos' | 'participants' | 'abandonedCarts' | 'orders';

export default function DebugPage() {
    const firestore = useFirestore();
    const auth = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState<CollectionName | 'seed_races' | 'user' | 'staff' | 'seed_all' | null>(null);

    const [testEmail, setTestEmail] = useState('seu-email-de-teste@gmail.com');
    const [emailType, setEmailType] = useState('welcome');
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const handleClearCollection = async (collectionName: CollectionName) => {
        if (!firestore) {
            toast({ variant: 'destructive', title: 'Erro de conexão com o Firebase.' });
            return;
        }

        setIsLoading(collectionName);
        try {
            const collectionRef = collection(firestore, collectionName);
            const snapshot = await getDocs(collectionRef);
            
            if (snapshot.empty) {
                toast({ title: 'Coleção já está vazia!', description: `Nenhum documento encontrado em "${collectionName}".` });
                return;
            }

            const batch = writeBatch(firestore);
            snapshot.docs.forEach(doc => batch.delete(doc.ref));
            
            await batch.commit();

            toast({ title: 'Coleção Limpa com Sucesso!', description: `${snapshot.size} documentos foram excluídos de "${collectionName}".` });
        } catch (error) {
            console.error("Erro ao limpar coleção: ", error);
            toast({ variant: 'destructive', title: `Erro ao limpar "${collectionName}".` });
        } finally {
            setIsLoading(null);
        }
    };
    
    const handleSeedRaces = async () => {
         if (!firestore) {
            toast({ variant: 'destructive', title: 'Erro de conexão com o Firebase.' });
            return;
        }
        setIsLoading('seed_races');
        try {
            const batch = writeBatch(firestore);
            RACES_DATA.forEach(race => {
                const docRef = doc(firestore, 'races', race.id);
                batch.set(docRef, race);
            });
            await batch.commit();
            toast({ title: 'Eventos Populados!', description: `${RACES_DATA.length} corridas de exemplo foram criadas.` });

        } catch (error) {
             console.error("Erro ao popular corridas: ", error);
            toast({ variant: 'destructive', title: 'Erro ao popular os eventos.' });
        } finally {
            setIsLoading(null);
        }
    };

    const handleSeedAllData = async () => {
        if (!firestore || !auth) {
            toast({ variant: 'destructive', title: 'Erro de conexão.' });
            return;
        }
        setIsLoading('seed_all');
        
        try {
            // 1. Create Test Users
            toast({ title: '1/4 - Criando usuários de teste...' });
            const testUsersData = [
                { email: 'atleta1@test.com', displayName: 'João Corredor', doc: '111.111.111-11' },
                { email: 'atleta2@test.com', displayName: 'Maria Velocista', doc: '222.222.222-22' },
            ];
            const createdUsers = [];

            for (const userData of testUsersData) {
                try {
                    const userCred = await createUserWithEmailAndPassword(auth, userData.email, 'teste123');
                    await updateProfile(userCred.user, { displayName: userData.displayName });
                    createdUsers.push({ ...userCred.user, profileData: userData });
                } catch (e: any) {
                    if (e.code === 'auth/email-already-in-use') {
                        toast({ variant: 'destructive', title: 'Erro: Usuário já existe!', description: `O usuário ${userData.email} já está cadastrado. Limpe os usuários no Firebase Console (Authentication -> Users) e tente novamente.` });
                        setIsLoading(null);
                        return;
                    }
                    throw e; // Re-throw other errors
                }
            }
            toast({ title: 'Usuários de teste criados com sucesso!' });

            // 2. Prepare Data
            toast({ title: '2/4 - Preparando dados das corridas e inscrições...' });
            const batch = writeBatch(firestore);

            // Create Races
            const pastRace: Omit<Race, 'id'> = { name: 'Corrida de Outono (Teste)', date: '2024-03-15', location: 'São Paulo, SP', distance: '10k', description: 'Uma corrida de teste que já aconteceu.', longDescription: 'Descrição longa.', image: 'sao-silvestre', featured: false, organizerId: 'test-org', options: [{ distance: '10km', lots: [{ name: 'Lote Único', price: 90, startDate: '2024-01-01', endDate: '2024-03-01'}] }], status: 'closed' };
            const futureRace: Omit<Race, 'id'> = { name: 'Desafio da Primavera (Teste)', date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], location: 'Rio de Janeiro, RJ', distance: '5k, 21k', description: 'Uma corrida de teste que ainda vai acontecer.', longDescription: 'Descrição longa.', image: 'rio-marathon', featured: true, organizerId: 'test-org', options: [{ distance: '5km', lots: [{ name: '1º Lote', price: 120, startDate: '2024-08-01', endDate: '2024-09-30'}]}, { distance: '21km', lots: [{ name: '1º Lote', price: 190, startDate: '2024-08-01', endDate: '2024-09-30'}] }], status: 'published' };
            const pastRaceRef = doc(collection(firestore, 'races'));
            const futureRaceRef = doc(collection(firestore, 'races'));
            batch.set(pastRaceRef, pastRace);
            batch.set(futureRaceRef, futureRace);

            // Create User Profiles & Participants
            for (const user of createdUsers) {
                const userProfileRef = doc(firestore, 'users', user.uid);
                batch.set(userProfileRef, {
                    fullName: user.profileData.displayName,
                    email: user.profileData.email,
                    documentNumber: user.profileData.doc,
                    birthDate: '1990-01-01',
                    gender: 'Outro',
                });

                // Participant for past race
                const participant1Ref = doc(collection(firestore, 'participants'));
                batch.set(participant1Ref, { userId: user.uid, raceId: pastRaceRef.id, orderId: `order_${Math.random()}`, modality: '10km', status: 'IDENTIFICADA', kitStatus: 'retirado', userProfile: { fullName: user.profileData.displayName, documentNumber: user.profileData.doc } });

                // Participant for future race
                const participant2Ref = doc(collection(firestore, 'participants'));
                batch.set(participant2Ref, { userId: user.uid, raceId: futureRaceRef.id, orderId: `order_${Math.random()}`, modality: '5km', status: 'IDENTIFICADA', kitStatus: 'pendente', userProfile: { fullName: user.profileData.displayName, documentNumber: user.profileData.doc } });
            }

            // 3. Commit to Firestore
            toast({ title: '3/4 - Salvando dados no banco de dados...' });
            await batch.commit();

            toast({ title: '4/4 - Dados de teste populados!', description: '2 usuários, 2 corridas e 4 inscrições foram criadas.' });

        } catch (error: any) {
             console.error("Erro ao popular dados completos: ", error);
            toast({ variant: 'destructive', title: 'Erro ao popular dados.', description: error.message });
        } finally {
            setIsLoading(null);
        }
    }


    const handleCreateDeliveryUser = async () => {
        if (!auth) {
            toast({ variant: 'destructive', title: 'Erro de autenticação.' });
            return;
        }
        setIsLoading('user');
        try {
            await createUserWithEmailAndPassword(auth, 'entregador@gmail.com', 'entrega123');
            toast({ title: 'Usuário Entregador Criado!', description: 'Login: entregador@gmail.com | Senha: entrega123' });
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                toast({ variant: 'default', title: 'Usuário já existe', description: 'O usuário entregador já está cadastrado.' });
            } else {
                console.error("Erro ao criar usuário: ", error);
                toast({ variant: 'destructive', title: 'Erro ao criar usuário.' });
            }
        } finally {
            setIsLoading(null);
        }
    };
    
    const handleCreateStaffUser = async () => {
        if (!auth) {
            toast({ variant: 'destructive', title: 'Erro de autenticação.' });
            return;
        }
        setIsLoading('staff');
        try {
            await createUserWithEmailAndPassword(auth, 'staff@gmail.com', 'teste123');
            toast({ title: 'Usuário Staff Criado!', description: 'Login: staff@gmail.com | Senha: teste123' });
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                toast({ variant: 'default', title: 'Usuário já existe', description: 'O usuário de staff já está cadastrado.' });
            } else {
                console.error("Erro ao criar usuário de staff: ", error);
                toast({ variant: 'destructive', title: 'Erro ao criar usuário.' });
            }
        } finally {
            setIsLoading(null);
        }
    };

    const handleSendTestEmail = async () => {
        if (!testEmail) {
            toast({ variant: 'destructive', title: 'Destinatário ausente' });
            return;
        }
        setIsSendingEmail(true);

        const mockData: { [key: string]: any } = {
            welcome: { customerName: 'Atleta Teste' },
            orderConfirmation: {
                customerName: 'Comprador Teste',
                raceName: 'Corrida de Exemplo',
                orderNumber: 'ABC-123',
                totalInscriptions: 2,
            },
            abandonedCart: {
                customerName: 'Quase Atleta',
                raceName: 'Maratona Fictícia',
                checkoutUrl: `${window.location.origin}/cart`
            },
            paymentPending: {
                customerName: 'Pagador Teste',
                orderNumber: 'PIX-456',
                pixCode: '00020126...código...completo...aqui'
            }
        };

        try {
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: testEmail,
                    type: emailType,
                    data: mockData[emailType],
                }),
            });

            if (!response.ok) {
                const { error, details } = await response.json();
                throw new Error(details || error || 'Falha ao enviar e-mail de teste');
            }
            
            toast({
                title: "E-mail de teste enviado!",
                description: `Um e-mail do tipo "${emailType}" foi enviado para ${testEmail}.`
            });

        } catch (error: any) {
            console.error("Erro ao enviar e-mail de teste:", error);
            toast({
                variant: 'destructive',
                title: "Erro ao enviar e-mail",
                description: error.message
            });
        } finally {
            setIsSendingEmail(false);
        }
    };


    const renderButton = (
        action: () => void,
        collection: CollectionName,
        title: string,
        description: string,
        buttonText: string,
        Icon: React.ElementType
    ) => (
         <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={!!isLoading}>
                         {isLoading === collection ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icon className="mr-2 h-4 w-4" />}
                         {buttonText}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Esta ação não pode ser desfeita. Isso excluirá permanentemente todos os documentos da coleção {'"'}
                           <strong>{collection}</strong>
                           {'"'}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={action} className="bg-destructive hover:bg-destructive/90">
                            Sim, excluir tudo
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Página de Depuração</h1>
                <p className="text-muted-foreground">Ferramentas para desenvolvedores para limpar ou popular o banco de dados.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Popular Dados de Teste</CardTitle>
                    <CardDescription>Use esta seção para preencher o banco de dados com dados para cenários de teste.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-semibold">Popular Eventos de Exemplo</h4>
                            <p className="text-sm text-muted-foreground">Adiciona os eventos do arquivo `races.ts`.</p>
                        </div>
                        <Button onClick={handleSeedRaces} disabled={!!isLoading}>
                            {isLoading === 'seed_races' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Dna className="mr-2 h-4 w-4" />}
                            Popular Eventos
                        </Button>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-semibold">Popular Ambiente Completo</h4>
                            <p className="text-sm text-muted-foreground">Cria usuários, corridas e inscrições de teste.</p>
                        </div>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Button variant="default" disabled={!!isLoading}>
                                    {isLoading === 'seed_all' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Popular Tudo
                                </Button>
                            </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirmar Ação?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Esta ação criará novos usuários, corridas e inscrições. Se os usuários de teste (atleta1@test.com, atleta2@test.com) já existirem, a operação será interrompida.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSeedAllData}>
                                        Continuar
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                     <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-semibold">Criar Usuário Entregador</h4>
                            <p className="text-sm text-muted-foreground">Cria o usuário de teste para o painel de entregas.</p>
                        </div>
                        <Button onClick={handleCreateDeliveryUser} variant="outline" disabled={!!isLoading}>
                            {isLoading === 'user' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Criar Entregador
                        </Button>
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                            <h4 className="font-semibold">Criar Usuário Staff</h4>
                            <p className="text-sm text-muted-foreground">Cria o usuário de teste para o painel de validação de kits.</p>
                        </div>
                        <Button onClick={handleCreateStaffUser} variant="outline" disabled={!!isLoading}>
                            {isLoading === 'staff' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            Criar Staff
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Testar Envio de E-mails</CardTitle>
                    <CardDescription>Use esta ferramenta para verificar se o serviço de e-mail está funcionando corretamente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="test-email-recipient">E-mail do Destinatário</Label>
                        <Input 
                            id="test-email-recipient"
                            type="email"
                            value={testEmail}
                            onChange={(e) => setTestEmail(e.target.value)}
                            placeholder="email@exemplo.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="test-email-type">Tipo de E-mail</Label>
                        <Select value={emailType} onValueChange={setEmailType}>
                            <SelectTrigger id="test-email-type">
                                <SelectValue placeholder="Selecione um tipo de e-mail" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="welcome">Boas-vindas</SelectItem>
                                <SelectItem value="orderConfirmation">Confirmação de Pedido</SelectItem>
                                <SelectItem value="abandonedCart">Carrinho Abandonado</SelectItem>
                                <SelectItem value="paymentPending">Pagamento PIX Pendente</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSendTestEmail} disabled={isSendingEmail || !testEmail}>
                        {isSendingEmail ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                        {isSendingEmail ? 'Enviando...' : 'Enviar E-mail de Teste'}
                    </Button>
                </CardFooter>
            </Card>

            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle>Zona de Perigo</CardTitle>
                    <CardDescription>
                        As ações abaixo são irreversíveis. Use com cuidado.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     {renderButton(() => handleClearCollection('races'), 'races', 'Limpar Eventos', 'Exclui todos os documentos da coleção de corridas.', 'Limpar Eventos', Trash2)}
                     {renderButton(() => handleClearCollection('participants'), 'participants', 'Limpar Inscritos', 'Exclui todos os documentos da coleção de participantes.', 'Limpar Inscritos', Trash2)}
                     {renderButton(() => handleClearCollection('coupons'), 'coupons', 'Limpar Cupons', 'Exclui todos os documentos da coleção de cupons.', 'Limpar Cupons', Trash2)}
                     {renderButton(() => handleClearCollection('combos'), 'combos', 'Limpar Combos', 'Exclui todos os documentos da coleção de combos.', 'Limpar Combos', Trash2)}
                     {renderButton(() => handleClearCollection('contactMessages'), 'contactMessages', 'Limpar Mensagens', 'Exclui todas as mensagens de contato.', 'Limpar Mensagens', Trash2)}
                     {renderButton(() => handleClearCollection('abandonedCarts'), 'abandonedCarts', 'Limpar Carrinhos Abandonados', 'Exclui todos os registros de carrinhos abandonados.', 'Limpar Carrinhos', Trash2)}
                     {renderButton(() => handleClearCollection('orders'), 'orders', 'Limpar Pedidos (Faturamento)', 'Exclui todos os pedidos e dados de faturamento.', 'Limpar Pedidos', Trash2)}
                </CardContent>
            </Card>
        </div>
    );
}

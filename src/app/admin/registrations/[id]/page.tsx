

'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Lock } from 'lucide-react';
import { RegistrationDetails } from '@/components/admin/registration-details';
import { useDoc, useFirestore } from '@/firebase';
import type { Participant, Race } from '@/lib/types';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Skeleton } from '@/components/ui/skeleton';

export default function RegistrationDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const firestore = useFirestore();
    const registrationId = params.id as string;

    // Busca os dados da inscrição (participante)
    const registrationRef = useMemoFirebase(() => {
        if (!firestore || !registrationId) return null;
        return doc(firestore, 'participants', registrationId);
    }, [firestore, registrationId]);

    const { data: registration, loading: loadingRegistration } = useDoc<Participant>(registrationRef);

    // Busca os dados do evento associado a esta inscrição
    const raceRef = useMemoFirebase(() => {
        if (!firestore || !registration?.raceId) return null;
        return doc(firestore, 'races', registration.raceId);
    }, [firestore, registration?.raceId]);

    const { data: raceData, loading: loadingRace } = useDoc<Race>(raceRef);
    
    // Skeleton loading state
    if (loadingRegistration || loadingRace) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-7 w-7 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                 <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                    <div className="space-y-6">
                        <Skeleton className="h-64 w-full rounded-lg" />
                        <Skeleton className="h-32 w-full rounded-lg" />
                    </div>
                 </div>
            </div>
        )
    }
    
    if (!registration) {
         return (
             <div>
                <h1 className="text-2xl font-bold">Inscrição não encontrada.</h1>
                <Button onClick={() => router.back()} className="mt-4">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>
            </div>
         );
    }

    // Constrói o objeto com os detalhes para passar para o componente de exibição
    const registrationDetails = {
        id: registration.id,
        participant: {
            name: registration.userProfile?.fullName || 'Pendente',
            cpf: registration.userProfile?.documentNumber || 'N/A',
            email: registration.userProfile?.email || 'N/A',
            phone: registration.userProfile?.mobilePhone || 'N/A',
            birthDate: registration.userProfile?.birthDate || 'N/A',
        },
        event: {
            name: raceData?.name || 'Carregando...',
            raceId: registration.raceId || '',
            date: raceData?.date || '',
            category: registration.modality || 'N/A',
        },
        order: {
            id: registration.orderId,
            date: '', // Mock, pois não temos essa info no participante
            status: registration.status === 'IDENTIFICADA' ? 'paga' : 'pendente',
            kitStatus: registration.kitStatus,
            paymentMethod: 'N/A', // Mock
            value: raceData?.options.find(o => o.distance === registration.modality)?.lots[0].price ?? 0,
            installments: 'N/A',
        },
        kit: {
            type: registration.kitType || 'Padrão',
            shirtSize: registration.shirtSize || 'N/A',
            bibNumber: registration.bibNumber || ''
        },
        documents: [], // Mock por enquanto
    };


    return (
        <>
            <div className="mb-6 flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Voltar</span>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Detalhes da Inscrição</h1>
                    <p className="text-muted-foreground">ID: {registrationId}</p>
                </div>
            </div>
            
            <RegistrationDetails data={registrationDetails} />
        </>
    );
}


'use client';

import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where, getDoc, doc } from 'firebase/firestore';
import type { Participant, Race } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect, useState, useMemo } from 'react';
import { PackageCheck, Download, Ticket, ChevronRight, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"


const KitCard = ({ subscription }: { subscription: Participant & { race?: Race } }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { race, userProfile, kitStatus, kitType, shirtSize, id: registrationId, bibNumber } = subscription;

    const raceDate = race?.date ? new Date(race.date) : null;
    if (raceDate) {
        raceDate.setMinutes(raceDate.getMinutes() + raceDate.getTimezoneOffset());
    }

    const qrCodeValue = `${registrationId}`;
    
    const printUrl = `/dashboard/kits/print?name=${encodeURIComponent(userProfile?.fullName || 'N/A')}&race=${encodeURIComponent(race?.name || 'N/A')}&code=${encodeURIComponent(qrCodeValue)}&bib=${encodeURIComponent(bibNumber || 'Aguardando Geração')}&shirt=${encodeURIComponent(shirtSize || 'N/A')}&kit=${encodeURIComponent(kitType || 'Padrão')}&modality=${encodeURIComponent(subscription.modality || 'N/A')}`;

    return (
        <motion.div layout className="w-full">
            {isExpanded ? (
                <div>
                    <div className="relative w-full h-80 bg-white shadow-lg rounded-[24px] flex overflow-hidden">
                        <div
                            className="w-[35%] bg-gradient-to-br from-purple-600 to-indigo-700 flex flex-col items-center justify-center p-4 text-white"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}
                        >
                            <Dialog>
                                <DialogTrigger asChild>
                                    <div className="cursor-pointer bg-white p-2 rounded-xl shadow-md">
                                        <Image
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(qrCodeValue)}`}
                                            alt="QR Code de validação"
                                            width={140}
                                            height={140}
                                            unoptimized
                                        />
                                    </div>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="text-center">QR Code de Retirada</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <div className="bg-white p-4 border rounded-lg">
                                            <Image
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCodeValue)}`}
                                                alt="QR Code de validação"
                                                width={250}
                                                height={250}
                                                unoptimized
                                            />
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-4 text-center">Apresente este código junto com um documento de identificação no local de retirada.</p>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            <p className="mt-4 text-xs font-bold tracking-widest uppercase">Escaneie para validar</p>
                        </div>
                        <div className="flex-1 py-8 pr-8 pl-16 -ml-12">
                           <div className='flex justify-between items-start'>
                                <div>
                                <h1 className='text-3xl font-black text-slate-900 tracking-tighter italic'>{race ? race.name.substring(0, 3).toUpperCase() : 'EVT'}</h1>
                                <p className='text-slate-500 font-bold text-sm tracking-wide'>{race?.location.split(',')[0].toUpperCase()} EDITION</p>
                                </div>
                                {subscription.modality && <div className='px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-bold'>{subscription.modality}</div>}
                            </div>
                             <div className='mt-8 grid grid-cols-2 gap-y-6'>
                                <div className='flex flex-col'>
                                    <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>Nº de Peito</span>
                                    <span className='text-xl font-black text-slate-800'>#{bibNumber || 'N/A'}</span>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>Status do Kit</span>
                                    <span className={`inline-block w-fit px-3 py-1 rounded-full text-[11px] font-bold mt-1 ${kitStatus === 'retirado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {kitStatus === 'retirado' ? 'RETIRADO' : 'AGUARDANDO'}
                                    </span>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>Nome do Atleta</span>
                                    <span className='text-base font-bold text-slate-700 truncate'>{userProfile?.fullName}</span>
                                </div>
                                <div className='flex flex-col'>
                                    <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider'>Camiseta / Kit</span>
                                    <span className='text-base font-bold text-slate-700'>{shirtSize || 'N/A'} / {kitType || 'Padrão'}</span>
                                </div>
                            </div>
                            <svg className='absolute bottom-6 right-8 w-24 h-10' viewBox='0 0 100 40'>
                                <path d='M0 35 Q 25 35, 30 20 T 60 20 T 100 5' stroke='#e2e8f0' strokeDasharray='4 2' fill='none' strokeWidth='2'/>
                            </svg>
                        </div>
                    </div>
                    <div className="flex items-center justify-center mt-2 gap-4">
                        <Button variant="ghost" className="w-fit text-muted-foreground" onClick={() => setIsExpanded(false)}>
                            <ChevronUp className="w-4 h-4 mr-2" />Recolher
                        </Button>
                        <Link href={printUrl} target="_blank" rel="noopener noreferrer">
                           <Button variant="outline" className="w-fit">
                                <Download className="w-4 h-4 mr-2" />
                                Imprimir
                            </Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="p-6 bg-white border rounded-3xl shadow-sm hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer flex justify-between items-center"
                >
                    <div>
                        <p className="text-sm font-semibold text-primary">{userProfile?.fullName || 'Atleta Pendente'}</p>
                        <h3 className="font-bold text-lg text-slate-800">{race?.name}</h3>
                        <p className="text-sm text-muted-foreground">{raceDate?.toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={kitStatus === 'retirado' ? 'default' : 'secondary'}>
                            {kitStatus === 'retirado' ? 'Retirado' : 'Aguardando'}
                        </Badge>
                        <Button variant="ghost" className="hidden sm:inline-flex">
                           Ver Kit <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};


export default function KitsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [hydratedSubscriptions, setHydratedSubscriptions] = useState<(Participant & { race?: Race })[]>([]);
  const [loading, setLoading] = useState(true);

  const subscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'participants'), where('userId', '==', user.uid), where('status', '==', 'IDENTIFICADA'));
  }, [firestore, user]);

  const { data: subscriptions } = useCollection<Participant>(subscriptionsQuery);

   useEffect(() => {
        const fetchRaceDetails = async () => {
            if (subscriptions && firestore) {
                setLoading(true);
                const subsWithDetails = await Promise.all(subscriptions.map(async (sub) => {
                    if (sub.raceId) {
                        const raceRef = doc(firestore, 'races', sub.raceId);
                        const raceSnap = await getDoc(raceRef);
                        return { ...sub, race: raceSnap.exists() ? { id: raceSnap.id, ...raceSnap.data() } as Race : undefined };
                    }
                    return sub;
                }));
                setHydratedSubscriptions(subsWithDetails);
                setLoading(false);
            } else if (subscriptions === null) { // Handle case where there are no subscriptions
                 setHydratedSubscriptions([]);
                 setLoading(false);
            }
        };

        fetchRaceDetails();
    }, [subscriptions, firestore]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Meus Kits</h1>
        <p className="text-muted-foreground">Estes são seus comprovantes para retirada dos kits. Apresente o QR Code no dia do evento.</p>
      </header>
       
       {loading && (
          <div className="space-y-6">
            <Skeleton className="h-20 w-full rounded-3xl" />
            <Skeleton className="h-20 w-full rounded-3xl" />
          </div>
       )}

       {!loading && hydratedSubscriptions.length === 0 && (
         <Card>
            <CardContent className="text-center py-16">
                <h3 className="text-xl font-semibold">Nenhuma inscrição confirmada</h3>
                <p className="text-muted-foreground mt-2">Seus kits aparecerão aqui assim que você identificar os atletas nas suas inscrições.</p>
            </CardContent>
         </Card>
       )}

       {!loading && hydratedSubscriptions.length > 0 && (
           <div className="space-y-6">
               {hydratedSubscriptions.map(sub => <KitCard key={sub.id} subscription={sub} />)}
           </div>
       )}
    </div>
  );
}

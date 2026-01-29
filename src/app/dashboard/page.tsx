'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Trophy, Calendar, Zap, ListOrdered } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Participant, Race, RaceResult } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useEffect, useState, useMemo } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function StatCard({ title, value, icon: Icon, loading }: { title: string; value: string | number; icon: React.ElementType, loading: boolean }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{value}</div>}
            </CardContent>
        </Card>
    )
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const [subscribedRaces, setSubscribedRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextRace, setNextRace] = useState<Race | null>(null);
  
  const userSubscriptionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'participants'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: subscriptions, loading: loadingSubs } = useCollection<Participant>(userSubscriptionsQuery);

  const userResultsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'results'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: userResults, loading: loadingUserResults } = useCollection<RaceResult>(userResultsQuery);
  
  useEffect(() => {
    const fetchRaceDetails = async () => {
        if (loadingSubs || !firestore) return;
        
        setLoading(true);

        if (!subscriptions || subscriptions.length === 0) {
            setSubscribedRaces([]);
            setLoading(false);
            return;
        }

        const raceIds = [...new Set(subscriptions.map(sub => sub.raceId).filter(Boolean))];
        
        if (raceIds.length > 0) {
            const racesQuery = query(collection(firestore, 'races'), where('__name__', 'in', raceIds));
            const raceSnapshots = await getDocs(racesQuery);
            const racesData = raceSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() } as Race));
            setSubscribedRaces(racesData);
        } else {
            setSubscribedRaces([]);
        }
        setLoading(false);
    };

    fetchRaceDetails();
  }, [subscriptions, firestore, loadingSubs]);
  
  useEffect(() => {
    if (subscribedRaces.length > 0) {
      const today = new Date();
      today.setHours(0,0,0,0);

      const futureRaces = subscribedRaces
          .filter(race => new Date(race.date) >= today)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          
      setNextRace(futureRaces[0] || null);
    } else {
      setNextRace(null);
    }
  }, [subscribedRaces]);

  const { completedRacesCount, bestRank } = useMemo(() => {
      if (!subscriptions || !userResults) {
          return { completedRacesCount: 0, bestRank: 'N/A' };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedRaces = new Set<string>();
      subscriptions.forEach(sub => {
          const race = subscribedRaces.find(r => r.id === sub.raceId);
          if (race && new Date(race.date) < today) {
              completedRaces.add(race.id);
          }
      });
      
      const bestRank = userResults.length > 0 ? Math.min(...userResults.map(res => res.overallPosition)) : 'N/A';

      return { completedRacesCount: completedRaces.size, bestRank };
  }, [subscriptions, subscribedRaces, userResults]);

  const nextRaceImageUrl = useMemo(() => {
    if (!nextRace?.image) return null;
    if (nextRace.image.startsWith('http')) return nextRace.image;
    return PlaceHolderImages.find(p => p.id === nextRace.image)?.imageUrl || `https://picsum.photos/seed/${nextRace.id}/600/400`;
  }, [nextRace]);

  const totalRaces = subscriptions?.length ?? 0;
  const isLoadingStats = loading || loadingSubs || loadingUserResults;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Olá, {user?.displayName || user?.email?.split('@')[0] || 'Atleta'}!</h1>
        <p className="text-muted-foreground">Bem-vindo(a) à sua central de corridas.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard title="Corridas Concluídas" value={completedRacesCount} icon={Trophy} loading={isLoadingStats} />
        <StatCard title="Inscrições Ativas" value={totalRaces.toString()} icon={Calendar} loading={isLoadingStats} />
        <StatCard title="Melhor Ranking" value={bestRank !== 'N/A' ? `${bestRank}º` : 'N/A'} icon={ListOrdered} loading={isLoadingStats} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Próximo Desafio</CardTitle>
            <CardDescription>Sua próxima corrida está logo ali. Prepare-se!</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                </div>
            ) : nextRace ? (
                <div className="relative rounded-2xl overflow-hidden group">
                    {nextRaceImageUrl && <Image src={nextRaceImageUrl} alt={nextRace.name} width={600} height={400} className="object-cover w-full h-auto aspect-[16/9] group-hover:scale-105 transition-transform" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"/>
                    <div className="absolute bottom-0 left-0 p-6">
                        <h3 className="font-bold text-lg text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">{nextRace.name}</h3>
                        <p className="text-sm text-white/80">{new Date(nextRace.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                    </div>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">Nenhuma corrida futura encontrada.</p>
                     <Button className="mt-4" onClick={() => router.push('/races')}>
                        Explorar Provas <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            )}
             {nextRace && (
                 <Button className="mt-4 w-full" onClick={() => router.push(`/races/${nextRace.id}`)}>
                    Ver Detalhes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
             )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button variant="outline" className="justify-start gap-3" onClick={() => router.push('/races')}>
              <Zap className="h-5 w-5 text-primary" />
              <span>Explorar Novas Corridas</span>
            </Button>
            <Button variant="outline" className="justify-start gap-3" onClick={() => router.push('/dashboard/subscriptions')}>
              <Calendar className="h-5 w-5 text-primary" />
              <span>Ver Minhas Inscrições</span>
            </Button>
             <Button variant="outline" className="justify-start gap-3" onClick={() => router.push('/dashboard/results')}>
              <Trophy className="h-5 w-5 text-primary" />
              <span>Consultar Meus Resultados</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

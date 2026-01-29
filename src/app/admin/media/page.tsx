
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore } from '@/firebase';
import { collection, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import type { Race } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Link2, Save } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function RacePhotoLinkCard({ race }: { race: Race }) {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [url, setUrl] = useState(race.photoGalleryUrl || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!firestore) return;
        setIsLoading(true);
        try {
            const raceRef = doc(firestore, 'races', race.id);
            await updateDoc(raceRef, { 
                photoGalleryUrl: url,
                updatedAt: serverTimestamp(),
            });
            toast({
                title: "Link Salvo!",
                description: `O link de fotos para "${race.name}" foi atualizado.`
            });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: "Erro ao salvar." });
        } finally {
            setIsLoading(false);
        }
    }
    
    const raceImage = PlaceHolderImages.find(p => p.id === race.image);

    return (
        <Card className="overflow-hidden">
             {raceImage && (
                <div className="relative h-40 bg-muted">
                    <Image src={raceImage.imageUrl} alt={race.name} fill className="object-cover"/>
                </div>
            )}
            <CardHeader>
                <CardTitle className="text-base">{race.name}</CardTitle>
                <CardDescription>
                    {new Date(race.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })} • {race.location}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://suagaleriadefotos.com/..."
                      className="pl-9"
                  />
                </div>
                <Button onClick={handleSave} disabled={isLoading || url === (race.photoGalleryUrl || '')} className="w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Salvando..." : "Salvar"}
                </Button>
            </CardContent>
        </Card>
    );
}


export default function AdminMediaPage() {
  const firestore = useFirestore();
  const racesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'races') : null, [firestore]);
  const { data: races, loading } = useCollection<Race>(racesQuery);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Links de Fotos</h1>
        <p className="text-muted-foreground">Gerencie os links para as galerias de fotos de cada evento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-xl" />
        ))}
        {!loading && races?.map(race => (
            <RacePhotoLinkCard key={race.id} race={race} />
        ))}
        {!loading && (!races || races.length === 0) && (
            <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg">
                <h3 className="text-xl font-semibold">Nenhum evento encontrado</h3>
                <p className="text-muted-foreground mt-2">Crie um evento para poder adicionar o link das fotos.</p>
            </div>
        )}
      </div>
    </>
  );
}

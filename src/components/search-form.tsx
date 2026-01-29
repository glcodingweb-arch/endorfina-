
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { FormEvent } from 'react';
import { Label } from './ui/label';
import { MapPin, Calendar, Search, Route } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const city = formData.get('city') as string;
    const date = formData.get('date') as string;
    const distance = formData.get('distance') as string;

    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (date) params.set('date', date);
    if (distance) params.set('distance', distance);
    
    router.push(`/races?${params.toString()}`);
  };

  return (
    <Card className='bg-background/80 backdrop-blur-sm'>
      <CardContent className="p-4 w-full">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-4 md:items-end gap-4"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="city" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Localização
            </Label>
            <Input
              id="city"
              type="search"
              name="city"
              placeholder="Ex: Rio de Janeiro"
              defaultValue={searchParams.get('city') ?? ''}
              className="bg-background/50"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="date" className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Data
            </Label>
            <Input
              id="date"
              type="date"
              name="date"
              defaultValue={searchParams.get('date') ?? ''}
              className="bg-background/50"
            />
          </div>
           <div className="grid gap-1.5">
            <Label htmlFor="distance" className="flex items-center gap-2 text-sm font-medium">
              <Route className="h-4 w-4 text-muted-foreground" />
              Distância
            </Label>
             <Select name="distance" defaultValue={searchParams.get('distance') ?? 'all'}>
                <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Qualquer" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Qualquer</SelectItem>
                    <SelectItem value="5k">5k</SelectItem>
                    <SelectItem value="10k">10k</SelectItem>
                    <SelectItem value="15k">15k</SelectItem>
                    <SelectItem value="21k">21k (Meia Maratona)</SelectItem>
                    <SelectItem value="42k">42k (Maratona)</SelectItem>
                </SelectContent>
             </Select>
          </div>
          <Button type="submit" className="w-full md:w-auto md:self-end">
            <Search className="mr-2 h-4 w-4" />
            Buscar Corridas
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

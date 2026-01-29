'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminTeamsPage() {

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Gestão de Equipes e Assessorias</CardTitle>
            <CardDescription>Crie e gerencie as equipes para os eventos.</CardDescription>
          </div>
          <Button asChild>
            <Link href="#">
              <Plus className="mr-2 h-4 w-4" />
              Criar Equipe
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Nenhuma equipe cadastrada</h3>
            <p className="text-muted-foreground mt-2">Comece criando uma nova equipe para seus eventos.</p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

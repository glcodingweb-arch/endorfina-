'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useCollection, useFirestore } from '@/firebase';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { collection, query } from 'firebase/firestore';
import type { Combo } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminCombosPage() {
  const firestore = useFirestore();
  const router = useRouter();

  const combosQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'combos'));
  }, [firestore]);

  const { data: combos, loading } = useCollection<Combo>(combosQuery);

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Gestão de Combos</CardTitle>
            <CardDescription>Crie e gerencie pacotes de inscrições.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/admin/combos/create">
              <Plus className="mr-2 h-4 w-4" />
              Criar Combo
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          )}

          {!loading && combos && combos.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combos.map((combo) => (
                  <TableRow key={combo.id}>
                    <TableCell className="font-medium">{combo.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(combo.price)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={combo.active ? 'default' : 'secondary'}>
                        {combo.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>{combo.items.length}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/admin/combos/edit/${combo.id}`)
                            }
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && (!combos || combos.length === 0) && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <h3 className="text-xl font-semibold">Nenhum combo cadastrado</h3>
              <p className="text-muted-foreground mt-2">
                Crie pacotes especiais para seus eventos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

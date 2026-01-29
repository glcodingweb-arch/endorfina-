
'use client';

import { useState } from 'react';
import { useCollection, useFirestore } from '@/firebase';
import { collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Archive, Trash2, MailOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
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


interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  status: 'new' | 'read' | 'archived';
}

const statusConfig = {
  new: { label: 'Nova', variant: 'default' as const },
  read: { label: 'Lida', variant: 'secondary' as const },
  archived: { label: 'Arquivada', variant: 'outline' as const },
};

export default function AdminMessagesPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'contactMessages'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: messages, loading } = useCollection<ContactMessage>(messagesQuery);
  
  const formatDate = (timestamp: { seconds: number }) => {
    if (!timestamp) return '...';
    return new Date(timestamp.seconds * 1000).toLocaleString('pt-BR');
  }

  const handleDelete = async () => {
    if (!messageToDelete || !firestore) return;
    try {
      await deleteDoc(doc(firestore, 'contactMessages', messageToDelete.id));
      toast({
        title: 'Mensagem Excluída!',
        description: `A mensagem de ${messageToDelete.firstName} foi removida.`,
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro ao excluir', variant: 'destructive' });
    }
    setMessageToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Caixa de Entrada</CardTitle>
          <CardDescription>Mensagens recebidas através do formulário de contato.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Remetente</TableHead>
                <TableHead className="hidden md:table-cell">Mensagem</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!loading && messages?.map((message) => (
                <TableRow key={message.id} className={message.status === 'new' ? 'font-bold' : ''}>
                  <TableCell>
                    <div className="text-foreground">{`${message.firstName} ${message.lastName}`}</div>
                    <div className="text-xs text-muted-foreground font-normal">{message.email}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-sm">
                    <p className="truncate font-normal">{message.message}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground font-normal">{formatDate(message.createdAt)}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[message.status]?.variant ?? 'secondary'}>
                      {statusConfig[message.status]?.label ?? 'Desconhecido'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><MailOpen className="mr-2 h-4 w-4" /> Ver Mensagem</DropdownMenuItem>
                        <DropdownMenuItem><Archive className="mr-2 h-4 w-4" /> Arquivar</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setMessageToDelete(message)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && messages?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            Nenhuma mensagem encontrada.
                        </TableCell>
                    </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a mensagem
                    de <strong>{messageToDelete?.firstName}</strong>.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                    Excluir
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

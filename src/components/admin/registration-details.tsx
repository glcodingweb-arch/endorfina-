'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, Mail, Package, X, FileText, Download, Lock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Race } from '@/lib/types';

// O tipo de `data` agora é explícito e recebido via props
interface RegistrationDetailsProps {
    data: {
        id: string;
        participant: {
            name: string;
            cpf: string;
            email: string;
            phone: string;
            birthDate: string;
        };
        event: {
            name: string;
            raceId: string;
            date: string;
            category: string;
        };
        order: {
            id: string;
            date: string;
            status: 'paga' | 'pendente' | 'cancelada';
            kitStatus: 'pendente' | 'retirado';
            paymentMethod: string;
            value: number;
            installments: string;
        };
        kit: {
            type: string;
            shirtSize: string;
            bibNumber: string;
        };
        documents: { name: string; status: string; url: string | null }[];
    };
}

const statusConfig = {
    paga: { label: 'Paga', variant: 'default' as const },
    pendente: { label: 'Pendente', variant: 'secondary' as const },
    cancelada: { label: 'Cancelada', variant: 'destructive' as const },
    retirado: { label: 'Retirado', variant: 'default' as const },
    aprovado: { label: 'Aprovado', variant: 'default' as const },
};

type Status = keyof typeof statusConfig;

const DetailItem = ({ label, value }: { label: string; value: string | React.ReactNode }) => (
    <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
    </div>
);

export function RegistrationDetails({ data }: RegistrationDetailsProps) {

  const getStatusBadge = (status: Status) => {
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Participante</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DetailItem label="Nome Completo" value={data.participant.name} />
                    <DetailItem label="CPF" value={data.participant.cpf} />
                    <DetailItem label="Email" value={data.participant.email} />
                    <DetailItem label="Telefone" value={data.participant.phone} />
                    <DetailItem label="Data de Nascimento" value={new Date(data.participant.birthDate).toLocaleDateString('pt-BR')} />
                     <DetailItem 
                        label="Nº de Peito" 
                        value={
                            data.kit.bibNumber ? (
                                <span className="font-bold text-lg text-primary">{data.kit.bibNumber}</span>
                            ) : (
                                <span className="text-sm text-muted-foreground italic flex items-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    Aguardando geração
                                </span>
                            )
                        } 
                    />
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Documentos</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Documento</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.documents.length === 0 ? (
                                 <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24">Nenhum documento necessário.</TableCell>
                                </TableRow>
                            ) : data.documents.map((doc) => (
                                <TableRow key={doc.name}>
                                    <TableCell className="font-medium">{doc.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={doc.status === 'aprovado' ? 'default' : 'secondary'}>
                                            {doc.status === 'aprovado' ? 'Aprovado' : 'Pendente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {doc.url ? (
                                             <Button variant="outline" size="sm" asChild>
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-3 w-3" /> Ver
                                                </a>
                                            </Button>
                                        ) : (
                                            <Button variant="outline" size="sm" disabled>Aguardando</Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>

        {/* Coluna Lateral */}
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Resumo da Inscrição</CardTitle>
                    <CardDescription>Pedido: {data.order.id}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <DetailItem label="Evento" value={data.event.name} />
                    <DetailItem label="Categoria" value={data.event.category} />
                    <DetailItem label="Kit" value={`${data.kit.type} (Tamanho: ${data.kit.shirtSize})`} />
                    <Separator />
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status do Pagamento</span>
                        {getStatusBadge(data.order.status as Status)}
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status do Kit</span>
                        {getStatusBadge(data.order.kitStatus as Status)}
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button className="w-full" disabled={data.order.kitStatus === 'retirado' || !data.kit.bibNumber}>
                        <Check className="mr-2 h-4 w-4" /> Confirmar Retirada de Kit
                    </Button>
                    <Button variant="outline" className="w-full">
                        <Mail className="mr-2 h-4 w-4" /> Reenviar Confirmação
                    </Button>
                     <Button variant="destructive" className="w-full">
                        <X className="mr-2 h-4 w-4" /> Cancelar Inscrição
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

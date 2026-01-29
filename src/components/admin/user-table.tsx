'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { UserProfile } from '@/lib/types';
import { MoreHorizontal } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

interface UserTableProps {
  users: UserProfile[];
  onEdit?: (user: UserProfile) => void;
  onDelete?: (user: UserProfile) => void;
}

/* =========================================
   Status Badge
========================================= */
function UserStatusBadge({ status }: { status: 'active' | 'inactive' }) {
  const variant = status === 'active' ? 'default' : 'secondary';
  const label = status === 'active' ? 'Ativo' : 'Inativo';

  return <Badge variant={variant}>{label}</Badge>;
}

/* =========================================
   Ações (Dropdown)
========================================= */
function UserActions({
  user,
  onEdit,
  onDelete,
}: {
  user: UserProfile;
  onEdit?: (u: UserProfile) => void;
  onDelete?: (u: UserProfile) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-haspopup="true"
          size="icon"
          variant="ghost"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>

        <DropdownMenuItem onClick={() => onEdit?.(user)}>
          Editar
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onDelete?.(user)}
          className="text-red-600"
        >
          Deletar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Client-side component to safely format dates
const FormattedDateCell = ({ date }: { date?: Timestamp }) => {
    const [formattedDate, setFormattedDate] = useState('');
    useEffect(() => {
        if (date) {
            setFormattedDate(date.toDate().toLocaleDateString('pt-BR'));
        }
    }, [date]);

    return (
        <TableCell className="hidden md:table-cell">
            {formattedDate}
        </TableCell>
    );
};


/* =========================================
   Linha isolada (Single Responsibility)
========================================= */
function UserRow({
  user,
  onEdit,
  onDelete,
}: {
  user: UserProfile;
  onEdit?: (u: UserProfile) => void;
  onDelete?: (u: UserProfile) => void;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{user.fullName}</TableCell>
      <TableCell>{user.email}</TableCell>

      <TableCell className="hidden md:table-cell">
        <UserStatusBadge status={'active'} />
      </TableCell>

      <FormattedDateCell date={user.createdAt} />

      <TableCell>
        <UserActions
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
}

/* =========================================
   Tabela principal
========================================= */
export function UserTable({ users, onEdit, onDelete }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Data de Cadastro</TableHead>

          <TableHead>
            <span className="sr-only">Ações</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </TableBody>
    </Table>
  );
}

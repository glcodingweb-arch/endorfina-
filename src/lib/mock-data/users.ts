export type UserStatus = "active" | "inactive";

export type User = {
  name: string;
  email: string;
  avatar: string;
  registered: string;
  status: UserStatus;
};

// Mock user data - in a real app, this would come from a database
export const users: User[] = [
  {
    name: 'João da Silva',
    email: 'joao.silva@example.com',
    avatar: 'https://i.pravatar.cc/150?u=joao',
    registered: '2023-01-15',
    status: 'active',
  },
  {
    name: 'Maria Oliveira',
    email: 'maria.oliveira@example.com',
    avatar: 'https://i.pravatar.cc/150?u=maria',
    registered: '2023-02-20',
    status: 'active',
  },
  {
    name: 'Carlos Pereira',
    email: 'carlos.pereira@example.com',
    avatar: 'https://i.pravatar.cc/150?u=carlos',
    registered: '2023-03-10',
    status: 'inactive',
  },
  {
    name: 'Ana Costa',
    email: 'ana.costa@example.com',
    avatar: 'https://i.pravatar.cc/150?u=ana',
    registered: '2023-04-05',
    status: 'active',
  },
  {
    name: 'Pedro Martins',
    email: 'pedro.martins@example.com',
    avatar: 'https://i.pravatar.cc/150?u=pedro',
    registered: '2023-05-21',
    status: 'active',
  },
];

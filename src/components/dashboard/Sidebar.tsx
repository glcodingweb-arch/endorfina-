'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Trophy, User, LogOut, Users2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/subscriptions', label: 'Minhas Inscrições', icon: Calendar },
  { href: '/dashboard/results', label: 'Meus Resultados', icon: Trophy },
  { href: '/dashboard/kits', label: 'Meus Kits', icon: Package },
  { href: '/dashboard/team', label: 'Minha Equipe', icon: Users2 },
  { href: '/dashboard/profile', label: 'Meu Perfil', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };
  
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-20 items-center border-b px-6">
        <Link href="/">
          <Logo />
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
              pathname === item.href
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
         <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
         </Button>
      </div>
    </aside>
  );
}

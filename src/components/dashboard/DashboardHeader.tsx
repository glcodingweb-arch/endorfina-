'use client';

import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Home, Calendar, Trophy, User, LogOut, Users2, Package, PanelLeft } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Início', icon: Home },
  { href: '/dashboard/subscriptions', label: 'Minhas Inscrições', icon: Calendar },
  { href: '/dashboard/results', label: 'Meus Resultados', icon: Trophy },
  { href: '/dashboard/kits', label: 'Meus Kits', icon: Package },
  { href: '/dashboard/team', label: 'Minha Equipe', icon: Users2 },
  { href: '/dashboard/profile', label: 'Meu Perfil', icon: User },
];

function NavLink({ href, label, icon: Icon }: { href: string, label: string, icon: React.ElementType }) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-4 px-4 py-3 text-muted-foreground hover:text-foreground rounded-lg text-lg",
                isActive && "bg-muted text-foreground font-semibold"
            )}
            >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
        </Link>
    )
}


export function DashboardHeader() {
    const auth = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        if (!auth) return;
        await signOut(auth);
        router.push('/');
      };

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:hidden">
        <Sheet>
             <SheetTrigger asChild>
                 <Button size="icon" variant="outline">
                     <PanelLeft className="h-5 w-5" />
                     <span className="sr-only">Abrir Menu</span>
                 </Button>
             </SheetTrigger>
             <SheetContent side="left" className="flex flex-col p-4">
                 <nav className="grid gap-2 text-lg font-medium">
                     <div className="flex h-20 items-center border-b px-2">
                        <Link href="/">
                            <Logo />
                        </Link>
                    </div>
                     {navItems.map(link => <NavLink key={link.href} {...link} />)}
                 </nav>
                 <div className="mt-auto">
                    <Button variant="ghost" className="w-full justify-start gap-4 p-4 text-lg" onClick={handleLogout}>
                        <LogOut className="h-5 w-5" />
                        Sair
                    </Button>
                 </div>
             </SheetContent>
         </Sheet>
         <div className="md:hidden">
            <Link href="/dashboard"><Logo /></Link>
         </div>
      </header>
    )
}

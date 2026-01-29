'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Home,
  Calendar,
  Users,
  LineChart,
  Settings,
  PanelLeft,
  Search,
  Package,
  TicketPercent,
  ShoppingCart,
  Mail,
  Users2,
  PackageCheck,
  ImageIcon,
  Bell,
} from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Logo } from '../logo';

const navLinks = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/events', label: 'Eventos', icon: Calendar },
  { href: '/admin/users', label: 'Usuários', icon: Users },
  { href: '/admin/reports', label: 'Relatórios', icon: LineChart },
  { href: '/admin/coupons', label: 'Cupons', icon: TicketPercent },
  { href: '/admin/combos', label: 'Combos', icon: Package },
  { href: '/admin/abandoned-carts', label: 'Carrinhos', icon: ShoppingCart },
  { href: '/admin/messages', label: 'Mensagens', icon: Mail },
  { href: '/admin/teams', label: 'Equipes', icon: Users2 },
  { href: '/admin/validate', label: 'Validação', icon: PackageCheck },
  { href: '/admin/media', label: 'Mídia', icon: ImageIcon },
  { href: '/admin/notifications', label: 'Notificações', icon: Bell },
  { href: '/admin/settings', label: 'Configurações', icon: Settings },
];

function NavLink({ href, label, icon: Icon }: typeof navLinks[0]) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                isActive && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
            )}
            >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    )
}

export function AdminSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-[256px] flex-col border-r bg-card sm:flex">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link href="/admin">
          <Logo />
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navLinks.map(link => <NavLink key={link.href} {...link} />)}
        </nav>
      </div>
    </aside>
  );
}

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mb-6">
       <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                        href="/admin"
                        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                    >
                       <Package className="h-5 w-5 transition-all group-hover:scale-110" />
                       <span className="sr-only">Endorfina Esportes</span>
                    </Link>
                    {navLinks.map(link => <NavLink key={link.href} {...link} />)}
                </nav>
            </SheetContent>
        </Sheet>
        <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Buscar..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
            />
        </div>
    </header>
  );
}

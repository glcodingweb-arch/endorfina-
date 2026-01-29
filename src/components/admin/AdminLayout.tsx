
'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart2,
  Users,
  Settings,
  Folder,
  TicketPercent,
  Users2,
  Bell,
  LogOut,
  PackageCheck,
  ImageIcon,
  Mail,
  ShoppingCart,
  Package,
  ChevronLeft,
  Wrench,
  Tags,
  Truck,
  PanelLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const menuGroups = [
    {
      group: 'Vendas',
      items: [
        { id: '/admin/events', label: 'Eventos', icon: Folder },
        { id: '/admin/combos', label: 'Combos', icon: Package },
        { id: '/admin/coupons', label: 'Cupons', icon: TicketPercent },
        { id: '/admin/abandoned-carts', label: 'Carrinhos Abandonados', icon: ShoppingCart },
      ]
    },
    {
      group: 'Comunidade',
      items: [
        { id: '/admin/messages', label: 'Mensagens', icon: Mail },
        { id: '/admin/teams', label: 'Equipes & Assessorias', icon: Users2 },
        { id: '/admin/users', label: 'Atletas', icon: Users },
      ]
    },
    {
      group: 'Operações',
      items: [
        { id: '/admin/delivery', label: 'Entregas', icon: Truck },
        { id: '/admin/validate', label: 'Validação de Kits', icon: PackageCheck },
        { id: '/admin/media', label: 'Mídia & Conteúdo', icon: ImageIcon },
        { id: '/admin/tags', label: 'Tags', icon: Tags },
      ]
    },
    {
      group: 'Plataforma',
      items: [
        { id: '/admin/reports', label: 'Relatórios BI', icon: BarChart2 },
        { id: '/admin/notifications', label: 'Notificações', icon: Bell },
        { id: '/admin/settings', label: 'Configurações', icon: Settings },
        { id: '/admin/debug', label: 'Depuração', icon: Wrench },
      ]
    }
  ];

  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <nav className={`flex-1 overflow-y-auto ${isCollapsed && !isMobile ? 'px-4' : 'px-6'} space-y-10 py-6 admin-nav-scroll nav-fade-bottom transition-all`}>
      <button
        onClick={() => { router.push('/admin'); if (isMobile) setIsMobileMenuOpen(false); }}
        className={cn('w-full flex items-center py-4 rounded-2xl transition-all', (isCollapsed && !isMobile) ? 'justify-center' : 'gap-4 px-6', pathname === '/admin' && 'bg-primary text-primary-foreground shadow-xl shadow-primary/20', pathname !== '/admin' && 'text-muted-foreground hover:text-foreground hover:bg-muted')}
      >
        <Home className="w-5 h-5 shrink-0" />
        {(!isCollapsed || isMobile) && <span className="text-xs font-black uppercase tracking-widest animate-in fade-in">Dashboard</span>}
      </button>

      {menuGroups.map((group, idx) => (
        <div key={idx} className="space-y-4">
          {(!isCollapsed || isMobile) && (
            <p className="px-6 text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.3em] animate-in fade-in">
              {group.group}
            </p>
          )}
          <div className="space-y-1">
            {group.items.map((item) => (
              <button
                key={item.id}
                onClick={() => { router.push(item.id); if (isMobile) setIsMobileMenuOpen(false); }}
                className={cn('w-full flex items-center py-3.5 rounded-2xl transition-all group', (isCollapsed && !isMobile) ? 'justify-center' : 'gap-4 px-6', pathname.startsWith(item.id) ? 'bg-muted text-foreground shadow-inner' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}
              >
                <item.icon className={cn('w-5 h-5 shrink-0 transition-transform', pathname.startsWith(item.id) ? 'scale-110' : 'opacity-60 group-hover:opacity-100')} />
                {(!isCollapsed || isMobile) && <span className="text-xs font-bold whitespace-nowrap animate-in fade-in">{item.label}</span>}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/20 text-foreground flex">
      <aside className={`hidden md:flex fixed left-0 top-0 bottom-0 ${isCollapsed ? 'w-24' : 'w-80'} bg-card border-r flex-col z-[100] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[56px] w-6 h-12 bg-primary rounded-lg text-primary-foreground shadow-xl z-[110] hover:bg-primary/90 transition-colors group flex items-center justify-center"
        >
          <ChevronLeft className={`w-4 h-4 transition-transform duration-500 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>

        <div className={`p-8 ${isCollapsed ? 'px-4' : 'px-10'} pb-6 shrink-0 transition-all`}>
           <Link href="/" className={`flex items-center gap-4 ${isCollapsed ? 'justify-center' : ''} mb-10 overflow-hidden h-12`}>
              <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                 <Image src="/LOGO.png.png" alt="Logo" fill className="object-contain"/>
              </div>
              {!isCollapsed && (
                <div className="flex flex-col animate-in fade-in slide-in-from-left-4">
                  <span className="text-lg font-black tracking-tighter leading-none whitespace-nowrap">ADMIN HUB</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 whitespace-nowrap">Endorfina Elite</span>
                </div>
              )}
           </Link>
        </div>

        <div className="relative flex-1 flex flex-col min-h-0">
          <NavContent />
        </div>

        <div className={`p-8 ${isCollapsed ? 'p-4' : 'p-8'} border-t space-y-4 shrink-0 bg-card transition-all`}>
           <button
             onClick={() => router.push('/')}
             className={cn('w-full py-5 bg-red-500/10 text-red-500 font-black rounded-2xl hover:bg-red-500 hover:text-white transition-all text-[10px] uppercase tracking-widest flex items-center justify-center', isCollapsed ? '' : 'gap-3')}
             title={isCollapsed ? "Sair" : ""}
           >
              <LogOut className="w-4 h-4 shrink-0" />
              {!isCollapsed && "Sair do Painel"}
           </button>
        </div>
      </aside>

      <div className={cn('flex flex-col flex-1', isCollapsed ? 'md:ml-24' : 'md:ml-80', 'transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]')}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button size="icon" variant="outline">
                        <PanelLeft className="h-5 w-5" />
                        <span className="sr-only">Abrir menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-xs bg-card p-0 flex flex-col">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                    </SheetHeader>
                    <div className="p-8 pb-6 shrink-0 border-b">
                        <Link href="/" className="flex items-center gap-4">
                            <div className="w-12 h-12 relative">
                                <Image src="/LOGO.png.png" alt="Logo" fill className="object-contain"/>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black tracking-tighter leading-none">ADMIN HUB</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Endorfina Elite</span>
                            </div>
                        </Link>
                    </div>
                    <NavContent isMobile={true} />
                    <div className="p-8 border-t mt-auto">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-5 bg-red-500/10 text-red-500 font-black rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3"
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                            Sair do Painel
                        </button>
                    </div>
                </SheetContent>
            </Sheet>
            <div className="flex-1 text-center">
                 <Link href="/admin"><Image src="/LOGO.png.png" alt="Logo" width={36} height={36} className="object-contain inline-block"/></Link>
            </div>
             <div className="w-8"></div>
        </header>
        
        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto p-6 md:p-12 lg:p-20">
             {children}
          </div>
        </main>
      </div>
    </div>
  );
};


'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, User, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/firebase'
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth'

import { Logo } from '@/components/logo'
import { CartIcon } from '@/components/cart/cart-icon'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '../ui/button'
import { Sheet, SheetContent, SheetClose, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'


const MENU_ITEMS = [
  { label: 'Home', href: '/#home', id: 'home' },
  { label: 'Corridas', href: '/races', id: 'races' },
  { label: 'Combos', href: '/combos', id: 'combos' },
  { label: 'Resultados', href: '/results', id: 'results' },
  { label: 'Sobre', href: '/#sobre', id: 'sobre' },
]

function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return isVisible;
}

export function SmoothLink({ href, className, onClick, children, id }: { href: string; className: string; onClick?: () => void; children: React.ReactNode, id: string }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isAnchorLink = href.startsWith('/#');

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elementId = href.substring(href.indexOf('#') + 1);
    const element = document.getElementById(elementId);
    
    if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
    if (onClick) {
        onClick();
    }
  };

  if (isHomePage && isAnchorLink) {
    return (
      <a href={href} onClick={handleScroll} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className={className}>
      {children}
    </Link>
  );
}

const NewLoginButton = () => (
  <Link href="/login" passHref>
    <button className="flex items-center justify-center px-6 py-3 bg-primary text-white text-xs font-bold uppercase rounded-lg shadow-lg shadow-primary/30 transition-all duration-500 ease-out hover:shadow-primary/50 focus:opacity-85 active:opacity-85 focus:shadow-none active:shadow-none">
      Login
    </button>
  </Link>
);


export function Header() {
  const isNavVisible = useScrollDirection();
  const auth = useAuth();
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  }
  
  const isAdmin = user?.email === 'adm@gmail.com';
  const dashboardHref = isAdmin ? "/admin" : "/dashboard";

  return (
    <>
      <header className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-100 h-20 transition-transform duration-300",
          !isNavVisible ? '-translate-y-full' : 'translate-y-0'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <Link href="/">
                <Logo />
            </Link>
            
            <nav className="hidden lg:flex items-center space-x-10">
              {MENU_ITEMS.map((link) => (
                <SmoothLink 
                  key={link.href} 
                  href={link.href}
                  id={link.id}
                  className="text-sm font-bold text-slate-600 hover:text-purple-600 transition-colors relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full"></span>
                </SmoothLink>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex items-center">
                    {user && <CartIcon />}
                     <div className="flex items-center gap-3">
                        {!user ? (
                           <div className="ml-4">
                             <NewLoginButton />
                           </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div className="ml-4 cursor-pointer flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <div className="text-right hidden sm:block">
                                  <p className="text-sm font-bold text-slate-800">{user.displayName || user.email?.split('@')[0]}</p>
                                  {isAdmin && (
                                    <p className="text-xs text-primary font-semibold">Administrador</p>
                                  )}
                                </div>
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                              <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                  <p className="text-sm font-medium leading-none">{user.displayName || user.email?.split('@')[0]}</p>
                                  <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                  </p>
                                </div>
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                 <Link href={dashboardHref}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Painel</span>
                                 </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sair</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                    </div>
                </div>

                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="p-2 text-slate-600 hover:text-purple-600"
                            aria-label="Abrir Menu"
                            >
                            <Menu className="h-8 w-8" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[85%] max-w-sm p-8 flex flex-col">
                            <SheetHeader className="text-left mb-12">
                                <SheetTitle className="text-xl font-black text-slate-900 tracking-tighter">MENU</SheetTitle>
                            </SheetHeader>
                            
                            <nav className="flex flex-col space-y-8">
                            {MENU_ITEMS.map((link) => (
                                <SheetClose asChild key={link.href}>
                                <SmoothLink 
                                    href={link.href}
                                    id={link.id}
                                    className="text-3xl font-black text-slate-900 hover:text-purple-600 transition-colors tracking-tight"
                                >
                                    {link.label}
                                </SmoothLink>
                                </SheetClose>
                            ))}
                            </nav>

                            <div className="mt-auto space-y-4 pt-10">
                            {user ? (
                                <div className="w-full justify-start text-left">
                                    <SheetClose asChild>
                                    <Link href={dashboardHref} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <User className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-bold">{user.displayName || user.email}</p>
                                            <p className="text-xs text-muted-foreground">Acessar painel</p>
                                        </div>
                                    </Link>
                                    </SheetClose>
                                </div>
                            ) : (
                                <SheetClose asChild>
                                <Button asChild className="w-full">
                                    <Link href="/login">Login / Cadastro</Link>
                                </Button>
                                </SheetClose>
                            )}
                            </div>
                        </SheetContent>
                    </Sheet>
              </div>

            </div>
          </div>
        </div>
      </header>
    </>
  );
};

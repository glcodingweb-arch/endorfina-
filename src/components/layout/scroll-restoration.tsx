
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function ScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Desativa o gerenciamento de rolagem padrão do Next.js
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      sessionStorage.setItem(`scrollPos_${pathname}?${searchParams}`, String(scrollPosition));
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Restaura a posição ao carregar a página
    const savedScrollPos = sessionStorage.getItem(`scrollPos_${pathname}?${searchParams}`);
    if (savedScrollPos) {
       // Pequeno delay para garantir que o layout esteja pronto
      setTimeout(() => window.scrollTo(0, parseInt(savedScrollPos, 10)), 100);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };

  }, [pathname, searchParams]);

  return null;
}

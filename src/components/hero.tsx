'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useEffect, useRef } from 'react';

export function Hero() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (imgRef.current && window.innerWidth > 768) {
        const scrolled = window.scrollY;
        const translateY = scrolled * 0.15;
        imgRef.current.style.transform = `translateY(${translateY}px) scale(1.1) scaleX(-1)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden bg-white pt-20">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image 
          ref={imgRef}
          src="/HERO ENDORFINA.jpeg" 
          alt="Grupo de corredores em uma rua" 
          fill
          className="w-full h-full object-cover will-change-transform transition-transform duration-75 ease-out"
          style={{ transform: 'translateY(0px) scale(1.1) scaleX(-1)' }}
          priority
          data-ai-hint="runners street"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/70 to-white/40 md:bg-gradient-to-r md:from-white md:via-white/80 md:to-transparent"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-2xl space-y-6 sm:space-y-8 py-12 sm:py-20">
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black text-slate-900 leading-[1] sm:leading-[0.9] tracking-tighter">
            SUA CORRIDA <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600 uppercase">Começa aqui.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-slate-700 max-w-lg leading-relaxed font-medium">
            Essa é sua dose de endorfina. Supere seus limites nos circuitos mais divertidos que você já viu.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild size="lg" className="px-8 py-5 sm:px-10 sm:py-5 font-black rounded-2xl shadow-2xl shadow-purple-200 transform active:scale-95 w-full sm:w-auto">
                    <Link href="/races">
                      Encontrar Prova
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Explorar calendário 2025</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </section>
  );
}

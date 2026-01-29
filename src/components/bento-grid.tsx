'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Mail, ArrowRight } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { SmoothLink } from '@/components/layout/header';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  onNavigate?: (view: string) => void;
}

export default function BentoGrid({ onNavigate }: BentoGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const magazineCover = PlaceHolderImages.find(img => img.id === 'guarulhos-todo-dia-cover');
  const magazineUrl = "https://online.fliphtml5.com/bwdhm/xtih/#p=4";

  useEffect(() => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = containerRef.current?.querySelectorAll('.reveal-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setIsContactExpanded(false);
    }, 3000);
  };

  return (
    <section className="py-16 sm:py-24 bg-slate-50 overflow-hidden" id="bento">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={containerRef}>
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 sm:gap-6 h-auto md:h-[800px]">
          
          <div 
            className="md:col-span-2 md:row-span-1 bg-white border border-slate-200 rounded-[2.5rem] sm:rounded-[3rem] p-8 md:p-12 lg:px-12 flex flex-col justify-between group overflow-hidden relative shadow-sm reveal-on-scroll"
            style={{ transitionDelay: '0ms' }}
          >
            <div className="relative z-10">
              <span className="text-purple-600 text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Nossa Essência</span>
              <h3 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[0.9] tracking-tighter">Quem Somos</h3>
              <p className="text-slate-600 mb-8 leading-relaxed text-base md:text-lg font-medium max-w-md">
                Mais que um evento, somos uma transformação. A Endorfina Esportes nasceu para conectar pessoas ao seu melhor desempenho.
              </p>
               <Button asChild className="group inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-purple-600 transition-all active:scale-95">
                <Link href="/#sobre">Nossa História <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
            </div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-100/50 rounded-full blur-[100px] pointer-events-none"></div>
          </div>

          <div 
            className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] sm:rounded-[3rem] p-10 flex flex-col justify-between text-white shadow-[0_20px_50px_-15px_rgba(109,40,217,0.4)] relative overflow-hidden group reveal-on-scroll"
            style={{ transitionDelay: '100ms' }}
          >
            <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors"></div>

            <div className="relative z-10">
               <div className="flex justify-between items-start mb-6">
                 <h3 className="text-4xl font-black tracking-tighter leading-none text-white">Provas</h3>
                 <span className="flex h-2 w-2 rounded-full bg-white animate-pulse"></span>
               </div>
               <p className="text-purple-100/80 text-sm font-bold leading-relaxed max-w-[150px]">Calendário completo e inscrições abertas.</p>
            </div>
            <Button asChild className="relative z-10 w-full py-5 bg-white text-purple-700 font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-purple-900/20 hover:scale-[1.02] hover:bg-purple-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                <Link href="/races">Ver Calendário</Link>
            </Button>
          </div>

          <div 
            className="md:col-span-1 md:row-span-1 bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] p-10 flex flex-col justify-between text-white relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] reveal-on-scroll shadow-2xl"
            style={{ transitionDelay: '200ms' }}
          >
             <div className="absolute -top-20 -left-20 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="h-full flex flex-col">
              <div className="flex-1">
                  <h3 className="text-4xl font-black text-white tracking-tighter mb-4">Contato</h3>
                  <p className="text-slate-300 text-sm font-semibold leading-relaxed">
                    Dúvidas sobre inscrições ou parcerias?
                  </p>
                </div>
                <SmoothLink
                  href="/#contato"
                  id="contato-bento"
                  className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-950 transition-all active:scale-95 flex items-center justify-center"
                >
                  Falar Conosco
                </SmoothLink>
            </div>

            <div className="absolute -bottom-8 -right-16 w-48 h-48 text-purple-400 opacity-5 pointer-events-none">
              <Mail className="w-full h-full"/>
            </div>
          </div>

          <div 
            className="md:col-span-2 md:row-span-1 bg-white border border-slate-200 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-sm reveal-on-scroll"
            style={{ transitionDelay: '300ms' }}
          >
            <div className="md:w-1/2 p-10 sm:p-14 flex flex-col justify-center relative">
              <span className="text-purple-600 text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Destaque Editorial</span>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">Guarulhos <br/>Todo Dia</h3>
              <p className="text-slate-500 text-lg sm:text-xl mb-10 italic font-medium leading-relaxed">
                "A Endorfina Esportes tem sido o grande destaque nos eventos da região, elevando o patamar técnico da corrida de rua."
              </p>
              <Button asChild variant="outline" className="inline-flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-black text-[10px] uppercase tracking-widest group hover:bg-slate-900 hover:text-white transition-all w-fit">
                <Link href={magazineUrl || "#"} target="_blank" rel="noopener noreferrer">
                  Ler Matéria 
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -z-10"></div>
            </div>
            <div className="md:w-1/2 relative bg-slate-100 min-h-[300px]">
               {magazineCover && (
                <Image 
                    src={magazineCover.imageUrl}
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" 
                    alt={magazineCover.description}
                    fill
                    loading="lazy"
                />
               )}
               <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent md:block hidden"></div>
            </div>
          </div>
          
           <Link
             href="/photos"
             className={cn(
                "md:col-span-2 md:row-span-1 bg-slate-950 rounded-[3rem] p-10 flex flex-col sm:flex-row items-center justify-between text-white shadow-xl relative overflow-hidden group reveal-on-scroll cursor-pointer border border-white/5",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-slate-950"
             )}
             style={{ transitionDelay: '400ms' }}
           >
              <div className="absolute inset-0">
                <Image
                  src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&q=80&w=800"
                  className="w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-700"
                  alt="Fotógrafo"
                  width={800}
                  height={450}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
              </div>
              <div className="relative z-10 w-full">
                 <div className="flex justify-between items-start mb-2">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6 border border-white/10 group-hover:bg-white group-hover:text-purple-600 transition-colors">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                 </div>
                 <h3 className="text-3xl font-black tracking-tighter mb-2">
                    <span className="text-white">Sua Foto</span> <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">na Chegada</span>
                 </h3>
                 <p className="text-slate-400 text-sm font-medium mb-8 max-w-xs">Reviva a emoção. Encontre seus melhores ângulos nas galerias oficiais.</p>
                  <Button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-950 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group-hover:bg-purple-600 group-hover:text-white">
                      Buscar Minhas Fotos
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </Button>
              </div>
           </Link>

        </div>
      </div>
    </section>
  );
}

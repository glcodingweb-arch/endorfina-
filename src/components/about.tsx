'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { ShieldCheck, Trophy, Users, ArrowRight } from 'lucide-react';
import { SmoothLink } from '@/components/layout/header';
import { cn } from '@/lib/utils';

const values = [
  { 
    title: "Ética", 
    desc: "Transparência radical em cada etapa da jornada esportiva.",
    icon: <ShieldCheck className="w-full h-full" />
  },
  { 
    title: "Excelência", 
    desc: "Padrão de elite em segurança, cronometragem e infraestrutura.",
    icon: <Trophy className="w-full h-full" />
  },
  { 
    title: "Comunidade", 
    desc: "O esporte como elo de transformação social e superação.",
    icon: <Users className="w-full h-full" />
  },
];

const modalities = [
  { 
    name: "Triathlon", 
    image: "/MODALIDADES/Triathlon.png",
    desc: "O desafio triplo para quem busca a máxima resistência.",
    tag: "Multi-esporte"
  },
  { 
    name: "Trail Run", 
    image: "/MODALIDADES/Trail Run.jpg",
    desc: "Conexão profunda com a natureza em terrenos técnicos.",
    tag: "Natureza"
  },
  { 
    name: "Corrida de Rua", 
    image: "/MODALIDADES/COLOR EXPLOSION RUN HORIZONTAL (8).jpg",
    desc: "O asfalto urbano transformado em pista de alta performance.",
    tag: "Classic"
  },
  { 
    name: "Mountain Bike", 
    image: "/MODALIDADES/Mountain Bike.jpg",
    desc: "Adrenalina e velocidade sobre duas rodas nas trilhas.",
    tag: "Radical"
  },
];

export function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = { threshold: 0.15 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, observerOptions);

    const elements = sectionRef.current?.querySelectorAll('.reveal-on-scroll');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="sobre" ref={sectionRef} className="py-24 sm:py-40 bg-[#0a0f1d] text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-600/5 blur-[180px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[180px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center mb-40">
          
          <div className="lg:col-span-7 space-y-12 reveal-on-scroll">
            <div>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                <span className="text-purple-400 text-[10px] font-black uppercase tracking-[0.4em]">Propósito & DNA</span>
              </div>
              
              <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.85] tracking-tighter mb-10">
                <span className="text-white">PRODUZIMOS</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">FELICIDADE.</span>
              </h2>
              
              <div className="text-slate-300 text-xl font-medium leading-relaxed max-w-2xl space-y-6">
                <p>
                    A Endorfina Esportes nasceu de um desejo inquieto: Nossa missão é contribuir para a qualidade de vida, por meio da promoção de esportes e lazer.
                </p>
                <p>
                    Chegamos com o propósito de realizar novas experiências envolvendo diversas modalidades esportivas, incentivando, solidificando a saúde mental e física, levando DIVERSÃO, BEM ESTAR, e ALEGRIA.
                </p>
                <p>
                    Somos uma pequena molécula e causamos um efeito incrível e transformador na vida das pessoas. Não entregamos apenas medalhas; construímos o palco para que cada atleta descubra sua melhor versão.
                </p>
                <p>
                    Chegamos para produzir sua felicidade. Sinta!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <div key={i} className="relative p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                  <div className="relative z-10">
                    <h4 className="font-black text-white text-lg mb-3 uppercase tracking-tight">{v.title}</h4>
                    <p className="text-xs text-slate-500 font-bold leading-relaxed">{v.desc}</p>
                  </div>
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 text-white/5 pointer-events-none group-hover:text-white/10 group-hover:scale-110 transition-all duration-500">
                    {v.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={cn("lg:col-span-5 relative group reveal-on-scroll")} style={{ transitionDelay: '300ms' }}>
            <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl shadow-purple-900/20 border border-white/10 group-hover:border-purple-600/30 transition-all duration-1000 aspect-[4/5]">
              <Image 
                src="/IMG EQUIPE.jpg" 
                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-ease-2000 grayscale group-hover:grayscale-0"
                alt="Equipe Endorfina em ação"
                width={800} height={1000} data-ai-hint="team working"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-transparent to-transparent opacity-60"></div>
            </div>
            
            <div className="absolute -bottom-10 -left-6 sm:-left-12 z-20 bg-white p-10 rounded-[3rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] border border-slate-100 flex items-center gap-6 scale-90 sm:scale-100 animate-bounce-slow">
               <div className="text-slate-900">
                 <p className="text-5xl font-black leading-none tracking-tighter">10+</p>
                 <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mt-2 leading-none">Anos de Liderança</p>
               </div>
               <div className="w-px h-12 bg-slate-100"></div>
               <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight leading-none">Eventos Elite</p>
                  <p className="text-[10px] font-bold text-slate-400 max-w-[100px] leading-tight uppercase">Organizando o futuro do esporte brasileiro.</p>
               </div>
            </div>

            <div className="absolute -top-12 -right-12 w-48 h-48 border-2 border-purple-600/20 rounded-full -z-10 group-hover:scale-150 transition-transform duration-ease-2000"></div>
          </div>
        </div>

        <div className="mb-40">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 reveal-on-scroll">
            <div>
              <span className="text-purple-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4 block">Portfólio de Performance</span>
              <h3 className="text-4xl sm:text-5xl font-black tracking-tighter mb-2 uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-500">NOSSAS VERTICAIS.</h3>
              <p className="text-slate-400 font-medium text-lg">Ecossistema completo de alta performance em qualquer terreno.</p>
            </div>
            <div className="hidden lg:block h-px flex-1 bg-gradient-to-r from-white/10 to-transparent mx-12 mb-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
            {modalities.map((m, idx) => (
              <div 
                key={idx} 
                className={cn("group relative h-[480px] rounded-[3.5rem] overflow-hidden border border-white/5 transition-all duration-700 hover:border-purple-600/30 reveal-on-scroll")}
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <Image 
                  src={m.image} 
                  alt={m.name} 
                  fill
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-ease-2000 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
                
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/95 transition-opacity duration-700 group-hover:opacity-100"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="absolute inset-0 p-12 flex flex-col justify-end">
                   <div className="transform translate-y-12 group-hover:translate-y-0 transition-transform duration-700">
                      <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[9px] font-black text-purple-400 uppercase tracking-widest mb-4 border border-white/10 group-hover:bg-purple-600 group-hover:text-white transition-all">
                        {m.tag}
                      </span>
                      <h4 className="text-3xl font-black text-white mb-4 tracking-tighter leading-none">{m.name}</h4>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 max-w-[240px]">
                        {m.desc}
                      </p>
                      
                      <div className="mt-8 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-200">
                         <Button asChild variant="link" className="p-0 h-auto flex items-center gap-3 text-[10px] font-black text-white uppercase tracking-[0.2em] group/btn">
                           <Link href="/races">
                             Saber Mais
                             <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-slate-950 transition-all">
                               <ArrowRight className="w-4 h-4" strokeWidth={3} />
                             </div>
                           </Link>
                         </Button>
                      </div>
                   </div>
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none bg-gradient-to-tr from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full duration-ease-1500"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-10 sm:p-20 bg-gradient-to-br from-purple-700 to-indigo-900 rounded-[4rem] flex flex-col lg:flex-row items-center justify-between gap-12 shadow-[0_50px_120px_-20px_rgba(109,40,217,0.4)] relative overflow-hidden reveal-on-scroll">
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay">
            <svg width="100%" height="100%" fill="none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="diagonal-stripes-about" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="white" strokeWidth="3" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#diagonal-stripes-about)" />
            </svg>
          </div>

            <div className="lg:w-2/3 relative z-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/15 backdrop-blur-md rounded-xl mb-8 border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">PROMOÇÃO DE EVENTOS CORPORATIVOS</span>
                </div>
                <h3 className="text-5xl sm:text-6xl font-black mb-8 tracking-tighter leading-none text-white">PROMOVA SEU EVENTO</h3>
                <div className="text-purple-100 text-xl font-medium leading-relaxed max-w-3xl space-y-4">
                    <p>
                        Eventos esportivos corporativos são uma solução estratégica para empresas que desejam engajar colaboradores, promover saúde e fortalecer a cultura organizacional. Por meio do esporte, sua empresa incentiva qualidade de vida, integração entre equipes e valores como superação, cooperação e foco em resultados.
                    </p>
                    <p>
                        Festa de confraternização de final de ano, é coisa do passado. Quer levar um evento esportivo para a sua empresa e transformar saúde, integração e engajamento em resultados reais? Chama a gente! Estamos prontos para atender você e criar uma experiência esportiva inesquecível para sua empresa.
                    </p>
                </div>
            </div>
          
          <div className="lg:w-1/3 w-full relative z-10">
            <div className="p-10 bg-white/10 backdrop-blur-2xl rounded-[3rem] border border-white/10 shadow-inner group hover:bg-white/15 transition-all text-center lg:text-left">
                <p className="text-[10px] font-black text-purple-300 uppercase tracking-[0.3em] mb-2">Relacionamento Estratégico</p>
                <p className="text-3xl font-black text-white leading-none">Camila Balzan</p>
                <p className="text-xs font-bold text-white/50 mt-2 uppercase tracking-widest mb-10">Diretoria de Expansão</p>

               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <Button asChild className="py-5 bg-white text-slate-950 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-purple-50 transition-all active:scale-95 shadow-2xl">
                    <a href="https://wa.me/5511962576903" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                  </Button>
                  <Button asChild variant="secondary" className="py-5 bg-white/10 text-white font-black border border-white/10 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95">
                     <a href="mailto:contato@endorfinaesportes.com">E-mail</a>
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

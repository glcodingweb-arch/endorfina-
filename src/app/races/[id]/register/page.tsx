'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Download, Facebook, Mail, MapPin, Twitter, FileText, ArrowLeft, Zap, Info, Share2, Star, PackageCheck, Plus, Minus } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Race, Combo } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useCart } from '@/contexts/cart-context';
import { useToast } from '@/hooks/use-toast';

export function RaceDetailsClient({ race, combos }: { race: Race, combos: Combo[] }) {
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState('');
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [quantities, setQuantities] = useState<{[key: string]: number}>(
    race.options.reduce((acc, o) => ({...acc, [o.distance]: 0}), {})
  );

  const handleQuantityChange = (distance: string, delta: number) => {
    setQuantities(prev => {
        const current = prev[distance] || 0;
        const next = Math.max(0, current + delta);
        return {...prev, [distance]: next };
    });
  };

  const handleAddToCart = () => {
    let itemsAdded = 0;
    Object.entries(quantities).forEach(([distance, quantity]) => {
        if (quantity > 0) {
            const selectedOption = race.options.find(o => o.distance === distance);
            if (selectedOption) {
                addToCart(race.id, selectedOption, quantity);
                itemsAdded++;
            }
        }
    });
    
    if (itemsAdded === 0) {
        toast({ variant: 'destructive', title: 'Nenhuma modalidade selecionada', description: 'Adicione pelo menos uma inscrição para continuar.'});
        return;
    }

    toast({ title: "Itens adicionados ao carrinho!", description: `Continue para finalizar sua compra.` });
    router.push('/cart');
  };

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  if (!race) {
    notFound();
  }

  const raceDate = new Date(race.date);
  raceDate.setMinutes(raceDate.getMinutes() + raceDate.getTimezoneOffset());
  
  const registrationEndDate = new Date(raceDate);
  registrationEndDate.setDate(raceDate.getDate() - 3);

  const formatPrice = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const imageUrl = race.image?.startsWith('http')
    ? race.image
    : PlaceHolderImages.find(p => p.id === race.image)?.imageUrl || `https://picsum.photos/seed/${race.id}/1280/720`;

  const SocialButton = ({ children, href, tooltip }: { children: React.ReactNode; href: string, tooltip: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" asChild className="rounded-full bg-slate-100 hover:bg-primary hover:text-white transition-colors">
            <Link href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <>
      <Header />
      <div className="bg-white min-h-screen pt-20 animate-in fade-in duration-700">
        <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={race.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/20"></div>
             <Button
                onClick={() => router.push('/races')}
                className="absolute top-8 left-8 p-3 bg-slate-900/80 text-white backdrop-blur rounded-2xl shadow-xl hover:bg-primary hover:text-white transition-all group flex items-center gap-2 font-bold text-sm"
              >
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Voltar para Eventos
            </Button>
          </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* COLUNA PRINCIPAL - ESQUERDA */}
            <div className="lg:col-span-2 space-y-16">
              <div className="border-b border-slate-100 pb-8">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <span className="px-4 py-1.5 bg-purple-100 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">Inscrições Abertas</span>
                  <span className="text-slate-400 text-sm font-medium">Organizado por <strong className="text-slate-900">{race.organizerId || 'Endorfina Esportes'}</strong></span>
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter mb-8">
                  {race.name} <br />
                  <span className="text-primary">Edição {race.location.split(',')[0]} {raceDate.getFullYear()}</span>
                </h1>

                <div className="flex items-center gap-4">
                  <p className="text-sm font-bold text-slate-400 mr-2 uppercase tracking-widest flex items-center gap-2"><Share2 className="w-4 h-4"/>Compartilhar:</p>
                  <div className="flex gap-2">
                    <SocialButton href={`https://wa.me/?text=Confira esta corrida: ${race.name} - ${currentUrl}`} tooltip="Compartilhar no WhatsApp">
                        <FaWhatsapp className="h-5 w-5" />
                    </SocialButton>
                    <SocialButton href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`} tooltip="Compartilhar no Facebook">
                        <Facebook className="h-5 w-5" />
                    </SocialButton>
                    <SocialButton href={`https://twitter.com/intent/tweet?url=${currentUrl}&text=Confira esta corrida: ${race.name}`} tooltip="Compartilhar no X (Twitter)">
                        <Twitter className="h-5 w-5" />
                    </SocialButton>
                  </div>
                </div>
              </div>

              <div className="prose prose-slate max-w-none">
                <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3"><Info className="w-6 h-6"/>O Evento</h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  {race.longDescription}
                </p>
              </div>

                {race.showKitItems && race.kitItems && race.kitItems.length > 0 && (
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3"><PackageCheck className="w-6 h-6" />Itens do Kit</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {race.kitItems.map((item, index) => (
                                <div key={index} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                                    <p className="font-bold text-sm text-slate-800">{item.name}</p>
                                    {item.brand && <p className="text-xs text-slate-500">Marca: {item.brand}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

              {combos && combos.length > 0 && (
                <div>
                  <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-8">Pacotes & Combos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {combos.map(combo => (
                          <div key={combo.id} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 flex flex-col group hover:bg-white hover:border-purple-100 hover:shadow-lg transition-all">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Star className="w-5 h-5 text-amber-500" />
                                  <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{combo.name}</h4>
                                </div>
                                <p className="text-xs text-slate-500 mb-4 h-10">{combo.description}</p>
                              </div>
                              <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-xs font-bold text-slate-400">Valor do Combo</p>
                                    <p className="text-2xl font-black text-primary tracking-tighter">{formatPrice(combo.price)}</p>
                                </div>
                                <Button asChild size="sm" className="rounded-xl font-bold group-hover:bg-slate-900 transition-colors">
                                  <Link href="/combos">Ver Detalhes</Link>
                                </Button>
                              </div>
                          </div>
                      ))}
                  </div>
                </div>
              )}
              
              <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="flex gap-6 items-center">
                     <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <FileText className="h-8 w-8 text-primary" />
                     </div>
                     <div>
                        <h4 className="text-xl font-black text-slate-900">Regulamento Oficial</h4>
                        <p className="text-slate-500 text-sm">Versão {raceDate.getFullYear()} - Atualizado em {race.createdAt ? new Date(race.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
                     </div>
                   </div>
                   <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-primary transition-all shadow-xl active:scale-95 flex items-center gap-3">
                          <Link href="#">
                              Download PDF
                              <Download className="w-5 h-5" />
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Baixar PDF informativo</p>
                      </TooltipContent>
                    </Tooltip>
                   </TooltipProvider>
                 </div>
              </div>
            </div>

            {/* COLUNA LATERAL - DIREITA (CARD FIXO) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-purple-50 p-8 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -z-10 translate-x-10 -translate-y-10"></div>
                  
                  <div className="mb-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inscrições encerram em:</p>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-red-500">{Math.max(0, Math.ceil((registrationEndDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)))} dias</span>
                      <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full bg-red-500 w-[70%]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-4">Modalidades</h4>
                     {race.options.map(option => {
                        const price = option.lots[0]?.price ?? 0;
                        const quantity = quantities[option.distance] || 0;

                        return (
                          <div key={option.distance} className="flex flex-col sm:flex-row items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/50">
                            <div>
                              <p className="font-bold text-slate-900">{option.distance}</p>
                              <p className="text-sm font-semibold text-primary">{formatPrice(price)}</p>
                            </div>
                            <div className="flex items-center gap-3 mt-3 sm:mt-0">
                              <Button type="button" onClick={() => handleQuantityChange(option.distance, -1)} variant="outline" size="icon" className="w-10 h-10 rounded-xl"><Minus className="w-4 h-4"/></Button>
                              <span className="font-black text-lg text-slate-900 w-8 text-center">{quantity}</span>
                              <Button type="button" onClick={() => handleQuantityChange(option.distance, 1)} variant="outline" size="icon" className="w-10 h-10 rounded-xl"><Plus className="w-4 h-4"/></Button>
                            </div>
                          </div>
                        )
                      })}
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleAddToCart} size="lg" className="w-full py-5 text-base bg-primary text-primary-foreground font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-purple-200 active:scale-95 flex items-center justify-center gap-3">
                           Adicionar ao Carrinho
                           <Zap className="w-5 h-5" />
                        </Button>
                      </TooltipTrigger>
                       <TooltipContent>
                        <p>Garanta sua vaga na largada!</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100">
                   <h4 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-6">Informações Rápidas</h4>
                   <div className="space-y-6">
                      <div className="flex gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                            <Calendar className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Data e Hora</p>
                            <p className="text-sm font-bold text-slate-900">{raceDate.toLocaleDateString('pt-BR', { dateStyle: 'long' })}, às 07:00h</p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                           <MapPin className="w-5 h-5 text-primary" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase">Localização</p>
                            <p className="text-sm font-bold text-slate-900">{race.location}</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

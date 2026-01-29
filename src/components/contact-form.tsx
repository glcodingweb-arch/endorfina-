'use client';

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirestore } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { ArrowRight, Mail, Phone, Copy, Check, CheckCircle, Smartphone, HelpCircle, MapPin, Navigation, Lock } from "lucide-react";

const contactSchema = z.object({
  fullName: z.string().min(3, "O nome é obrigatório"),
  email: z.string().email("Por favor, insira um e-mail válido"),
  message: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mapActive, setMapActive] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      message: "",
    },
  });

  const { handleSubmit, reset, formState: { isSubmitting, isSubmitSuccessful } } = form;

  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    if (!firestore) {
      toast({ variant: "destructive", title: "Erro de conexão" });
      return;
    }
    try {
      await addDoc(collection(firestore, 'contactMessages'), {
        firstName: data.fullName.split(' ')[0],
        lastName: data.fullName.split(' ').slice(1).join(' ') || 'N/A',
        email: data.email,
        message: data.message,
        createdAt: serverTimestamp(),
        status: 'new',
      });
      
      // Envia o e-mail de confirmação para o usuário
      try {
        await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                to: data.email,
                type: 'contactConfirmation',
                data: {
                    customerName: data.fullName,
                    message: data.message,
                },
            }),
        });
      } catch (emailError) {
        console.error("Failed to send contact confirmation email:", emailError);
      }
      
      // Envia notificação para o admin
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'camilabalzan@hotmail.com',
            type: 'newContactMessageAdmin',
            data: {
              senderName: data.fullName,
              senderEmail: data.email,
              message: data.message,
            },
          }),
        });
      } catch (adminEmailError) {
        // Falha silenciosamente se o e-mail do admin não puder ser enviado, mas registra o erro.
        console.error("Failed to send admin notification email:", adminEmailError);
      }

    } catch (error) {
      toast({ variant: "destructive", title: "Erro ao Enviar", description: "Ocorreu um problema." });
    }
  };

  const handleResetForm = () => {
    reset();
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copiado para a área de transferência!", description: text });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="contato" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-purple-100 rounded-full blur-[140px] opacity-30"></div>
        <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[140px] opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-4 space-y-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg mb-6">
                <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest">Suporte 24/7</span>
              </div>
              <h2 className="text-5xl font-black text-slate-900 leading-[0.9] tracking-tighter mb-6">
                CONTATO <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">DIRETO.</span>
              </h2>
              <p className="text-slate-500 text-lg font-medium leading-relaxed">
                Nossa equipe de especialistas está pronta para acelerar seus resultados. Fale conosco pelos canais oficiais.
              </p>
            </div>

            <div className="space-y-4">
               {[
                { id: 'whatsapp', title: 'WhatsApp Direto', info: '+55 (11) 96257-6903', icon: Smartphone, color: 'bg-emerald-50 text-emerald-600', href: 'https://wa.me/5511962576903' },
                { id: 'email', title: 'E-mail Corporativo', info: 'CONTATO@ENDORFINAESPORTES.COM', icon: Mail, color: 'bg-purple-50 text-purple-600', href: 'mailto:contato@endorfinaesportes.com' },
                { id: 'phone', title: 'Central de Ajuda', info: 'Dúvidas Frequentes', icon: HelpCircle, color: 'bg-blue-50 text-blue-600', href: '/faq' },
              ].map((item) => {
                  const isExternal = item.id === 'whatsapp' || item.id === 'email';
                  
                  const content = (
                      <>
                          <div className="flex items-center gap-5">
                            <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center text-xl transition-all group-hover:scale-110 group-hover:rotate-3`}>
                              <item.icon className="w-6 h-6"/>
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.title}</p>
                              <p className="text-sm font-black text-slate-900">{item.info}</p>
                            </div>
                          </div>
                          {isExternal && (
                            <div className="flex items-center gap-2">
                              {copiedId === item.id ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Copy className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                            </div>
                          )}
                      </>
                  );

                  if (isExternal) {
                    return (
                       <a
                        key={item.id}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-purple-100/50 hover:border-purple-200 transition-all cursor-pointer relative"
                        onClick={(e) => {
                          e.preventDefault();
                          copyToClipboard(item.info, item.id);
                          window.open(item.href, '_blank');
                        }}
                      >
                       {content}
                      </a>
                    )
                  }
                  
                  return (
                     <Link
                        key={item.id}
                        href={item.href}
                        className="group flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-purple-100/50 hover:border-purple-200 transition-all cursor-pointer relative"
                      >
                       {content}
                     </Link>
                  )
              })}
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-[4rem] p-1 shadow-2xl shadow-purple-100/50 border border-slate-100 group">
               <div className="bg-slate-50/40 rounded-[3.8rem] p-8 md:p-16 transition-colors group-hover:bg-slate-50/60">
                  {isSubmitSuccessful ? (
                    <div className="py-24 text-center animate-in zoom-in-95 duration-700">
                       <div className="w-28 h-28 bg-emerald-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl shadow-emerald-200 rotate-6">
                          <Check className="w-14 h-14" strokeWidth={3} />
                       </div>
                       <h3 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">MENSAGEM NA PISTA!</h3>
                       <Button onClick={handleResetForm} className="px-12 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-purple-600 transition-all uppercase text-xs tracking-widest">Enviar Novo Ticket</Button>
                    </div>
                  ) : (
                    <Form {...form}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Como devemos te chamar?</Label>
                                <FormControl>
                                    <Input required placeholder="Seu nome completo" {...field} className="w-full px-8 py-6 bg-white border border-slate-200 rounded-[1.8rem] focus:ring-4 focus:ring-purple-600/5 focus:border-purple-600 focus:outline-none transition-all font-bold text-slate-700 shadow-sm" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">E-mail para resposta</Label>
                                <FormControl>
                                    <Input required type="email" placeholder="atleta@endorfina.com" {...field} className="w-full px-8 py-6 bg-white border border-slate-200 rounded-[1.8rem] focus:ring-4 focus:ring-purple-600/5 focus:border-purple-600 focus:outline-none transition-all font-bold text-slate-700 shadow-sm" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                      </div>
                       <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Sua Mensagem</Label>
                                <FormControl>
                                    <Textarea required rows={4} placeholder="Descreva como podemos ajudar você..." {...field} className="w-full px-8 py-6 bg-white border border-slate-200 rounded-[2.2rem] focus:ring-4 focus:ring-purple-600/5 focus:border-purple-600 focus:outline-none transition-all font-bold text-slate-700 shadow-sm resize-none" />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                      <Button disabled={isSubmitting} type="submit" className="w-full py-7 bg-slate-900 text-white rounded-[2.2rem] font-black text-sm uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 active:scale-95 group/btn">
                        {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                        <ArrowRight className="w-6 h-6 transition-transform group-hover/btn:translate-x-2" />
                      </Button>
                    </form>
                    </Form>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="mt-24 relative flex flex-col lg:block">
          <div className="h-[450px] sm:h-[650px] rounded-[3rem] sm:rounded-[5rem] overflow-hidden group shadow-2xl border border-slate-100 relative order-1">
            <iframe 
              title="Mapa Endorfina HQ"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3659.1025539563426!2d-46.52981358826501!3d-23.49258287877549!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce6166433e2abd%3A0x334433b5c54d3f3d!2sR.%20Roberto%20Tadeu%20Fornazari%2C%20136%20-%20Centro%2C%20Guarulhos%20-%20SP%2C%2007090-070!5e0!3m2!1spt-BR!2sbr!4v1770051280387!5m2!1spt-BR!2sbr" 
              width="100%" 
              height="100%" 
              style={{ border: 0, pointerEvents: mapActive ? 'auto' : 'none' }} 
              allowFullScreen={true} 
              loading="lazy" 
            ></iframe>
            
            {!mapActive && (
              <div 
                className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px] flex items-center justify-center cursor-pointer z-20 transition-all hover:bg-slate-900/5"
                onClick={() => setMapActive(true)}
              >
                <div className="bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
                   <Navigation className="w-5 h-5 text-purple-600" />
                   <span className="text-xs font-black uppercase tracking-widest text-slate-900">Toque para Explorar Mapa</span>
                </div>
              </div>
            )}

            {mapActive && (
              <Button 
                onClick={() => setMapActive(false)}
                size="icon"
                className="absolute top-4 right-4 z-30 bg-white p-3 rounded-xl shadow-2xl lg:hidden h-auto w-auto"
              >
                <Lock className="w-5 h-5 text-slate-400" />
              </Button>
            )}
          </div>

          <div className="lg:absolute lg:top-12 lg:left-12 lg:max-w-sm w-full bg-slate-950 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] border border-white/10 text-white shadow-2xl relative -mt-16 sm:-mt-20 lg:mt-0 z-30 mx-auto max-w-[90%] lg:max-w-sm order-2">
             <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center mb-6 sm:mb-10 shadow-2xl transform -rotate-6">
                <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
             </div>
             <h4 className="text-2xl sm:text-3xl font-black mb-4 tracking-tighter text-white">HQ ENDORFINA</h4>
             <p className="text-slate-400 font-medium leading-relaxed mb-8 sm:mb-10 text-sm">
               Roberto Tadeu Fornazari, 136 - Centro, Guarulhos
             </p>
             <div className="space-y-5 border-t border-white/10 pt-8 sm:pt-10">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">
                   <span>Seg - Sáb</span>
                   <span className="text-slate-200">06h às 21h</span>
                </div>
                <Button asChild className="w-full py-5 bg-white text-slate-950 font-black rounded-2xl hover:bg-purple-600 hover:text-white transition-all text-center block text-xs uppercase tracking-widest shadow-xl flex items-center justify-center">
                  <Link 
                    href="https://maps.app.goo.gl/WvpEA5JM5JYCLyBX9" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Abrir no GPS
                  </Link>
                </Button>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

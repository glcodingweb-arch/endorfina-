
'use client';

import { Search, CalendarCheck, CreditCard } from 'lucide-react';

const steps = [
  {
    icon: <Search className="w-8 h-8" />,
    title: 'Encontre seu Desafio',
    description: 'Navegue pelo nosso calendário completo e encontre o evento que combina com seu nível e objetivo.',
  },
  {
    icon: <CalendarCheck className="w-8 h-8" />,
    title: 'Escolha sua Modalidade',
    description: 'Selecione a modalidade desejada e a quantidade de inscrições para você e sua equipe.',
  },
  {
    icon: <CreditCard className="w-8 h-8" />,
    title: 'Faça sua Inscrição',
    description: 'Preencha seus dados de atleta, realize o pagamento seguro e receba seu comprovante na hora.',
  },
];

export function HowItWorks() {
  return (
    <section id="ride" className="py-24 bg-white">
        <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Inscreva-se em 3 Passos Fáceis</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Toda a jornada do atleta simplificada em uma plataforma intuitiva e rápida.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative p-10 bg-slate-100 rounded-[2.5rem] hover:bg-white border border-transparent hover:border-purple-100 transition-all group">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground mb-8 shadow-lg shadow-purple-200 transform group-hover:rotate-6 transition-transform">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
              <div className="absolute top-10 right-10 text-6xl font-black text-slate-200 group-hover:text-purple-50 transition-colors -z-10">0{idx + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

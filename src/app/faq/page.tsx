
import { Header } from '@/components/layout/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Metadata } from 'next';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
  title: 'FAQ - Dúvidas Frequentes | Endorfina Esportes',
  description: 'Encontre respostas para as perguntas mais comuns sobre nossos eventos, inscrições, kits e muito mais.',
};

const faqData = [
  {
    question: "Como faço para me inscrever em uma corrida?",
    answer: "É simples! Navegue até a nossa página de 'Corridas', escolha o evento desejado, selecione a modalidade (distância) e clique em 'Inscrever'. Siga as instruções para preencher seus dados e efetuar o pagamento. Sua vaga estará garantida!"
  },
  {
    question: "O que vem no kit do atleta?",
    answer: "O kit padrão geralmente inclui a camiseta oficial do evento, número de peito, chip de cronometragem e uma medalha de participação (entregue pós-prova). Kits premium ou especiais podem incluir itens adicionais, que estarão descritos na página de inscrição do evento."
  },
  {
    question: "Posso alterar os dados da minha inscrição ou transferir para outra pessoa?",
    answer: "Alterações de dados cadastrais, como tamanho da camiseta, podem ser feitas através do seu painel de atleta até a data limite informada no regulamento. A transferência de titularidade não é permitida por questões de segurança e seguro do atleta."
  },
  {
    question: "Qual a política de cancelamento e reembolso?",
    answer: "O atleta tem até 7 (sete) dias corridos após a compra para solicitar o cancelamento e estorno do valor da inscrição, conforme o Código de Defesa do Consumidor. Após este prazo, não haverá reembolso. A solicitação deve ser feita pelo nosso canal de contato oficial."
  },
  {
    question: "Como funcionam as corridas temáticas?",
    answer: "As corridas temáticas são eventos especiais com uma proposta lúdica e imersiva, como a 'Bubble Run' ou a 'Color Explosion'. Elas mantêm a estrutura de uma corrida de rua, mas com elementos interativos e um kit exclusivo para a experiência, como pós coloridos ou acessórios neon."
  }
];


export default function FaqPage() {
  return (
    <>
      <Header />
      <div className="bg-slate-50 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <span className="text-primary font-bold uppercase tracking-widest text-sm">Central de Ajuda</span>
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tighter mt-4">
              Dúvidas Frequentes
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Tudo o que você precisa saber para ter a melhor experiência em nossos eventos.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqData.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`} 
                className="bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-lg transition-all"
              >
                <AccordionTrigger className="p-6 text-left font-bold text-lg hover:no-underline group">
                    <span className="flex-1 pr-4">{item.question}</span>
                    <ChevronDown className="h-6 w-6 shrink-0 text-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

        </div>
      </div>
    </>
  );
}


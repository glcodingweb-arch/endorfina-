
import { Header } from '@/components/layout/header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade | Endorfina Esportes',
  description: 'Entenda como coletamos e utilizamos seus dados e sua imagem em nossos eventos.',
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />

      <main className="container py-24 sm:py-32">
        <HeaderSection />

        <article className="mx-auto max-w-3xl prose prose-slate max-w-none text-slate-600 space-y-8 leading-relaxed">
          <Section
            title="1. Coleta de Dados"
            content="A Endorfina Esportes coleta apenas os dados essenciais para sua participação nos eventos, garantindo a integridade do ranking e sua segurança médica durante os percursos."
          />

          <Section
            title="2. Uso de Imagem"
            content="Ao se inscrever em nossos eventos, você autoriza o uso gratuito de sua imagem em fotos e vídeos para fins exclusivos de divulgação e registros históricos das provas."
          />
        </article>
      </main>
    </>
  );
}

/* -----------------------------------------
   COMPONENTES
----------------------------------------- */

function HeaderSection() {
  return (
    <div className="mx-auto max-w-3xl text-center mb-12">
      <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">
        Política de Privacidade
      </h1>
    </div>
  );
}

interface SectionProps {
  title: string;
  content: string;
}

function Section({ title, content }: SectionProps) {
  return (
    <section>
      <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{title}</h2>
      <p>{content}</p>
    </section>
  );
}

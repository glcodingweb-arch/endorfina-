
import { Header } from '@/components/layout/header';
import type { Metadata } from 'next';

const TERMS_CONTENT = [
  {
    title: 'Participação em Eventos',
    body: `O atleta declara estar em plenas condições de saúde e assume total responsabilidade por sua integridade física durante a realização das provas organizadas pela Endorfina Esportes.`,
  },
];

export const metadata: Metadata = {
  title: 'Termos e Condições | Endorfina Esportes',
  description: 'Leia os termos e condições de participação nos eventos da Endorfina Esportes.',
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <Header />

      <div className="container py-24 sm:py-32">
        <div className="mx-auto max-w-4xl">
          
          {/* Cabeçalho da página */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight">Termos e Condições</h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Leia atentamente antes de se inscrever em nossos eventos.
            </p>
          </div>

          {/* Conteúdo legal estruturado */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            {TERMS_CONTENT.map((section) => (
              <section key={section.title}>
                <h4>{section.title}</h4>
                <p>{section.body}</p>
              </section>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}

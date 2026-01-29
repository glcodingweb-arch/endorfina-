
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

export function InTheMedia() {
  const magazineCover = PlaceHolderImages.find(img => img.id === 'guarulhos-todo-dia-cover');
  const magazineUrl = "https://online.fliphtml5.com/bwdhm/xtih/#p=4";

  return (
    <section id="in-the-media" className="py-12 sm:py-24 bg-muted/40">
      <div className="container px-4">
        {/* Estrutura hierárquica principal */}
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Na Mídia: Guarulhos Todo Dia
          </h2>
           <p className="mx-auto mt-2 max-w-2xl text-lg text-muted-foreground">
            Nosso evento recebeu destaque editorial. Confira a matéria completa e veja por que nossa corrida está agitando a cidade.
          </p>
        </div>

        {/* Wrapper do conteúdo principal */}
        <div className="mt-12 grid grid-cols-1 items-center gap-8 md:grid-cols-3 md:gap-12">
          
          {/* Coluna da Imagem (1/3) */}
          <div className="md:col-span-1">
            {magazineCover && (
              <Link href={magazineUrl} target="_blank" rel="noopener noreferrer" className="group block max-w-sm mx-auto">
                <div className="overflow-hidden rounded-lg shadow-lg transition-transform duration-300 ease-in-out group-hover:scale-105">
                  <div className="aspect-[3/4] relative">
                    <Image
                      src={magazineCover.imageUrl}
                      alt={magazineCover.description}
                      fill
                      className="object-cover"
                      data-ai-hint={magazineCover.imageHint}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Coluna de Texto e CTA (2/3) */}
          <div className="space-y-6 text-center md:text-left md:col-span-2">
            <h3 className="text-2xl font-semibold text-foreground">
              Destaque na Revista
            </h3>
            <p className="text-muted-foreground">
              A revista Guarulhos Todo Dia destacou nosso evento em sua última edição. A matéria apresenta os detalhes da corrida e convida toda a comunidade a participar desta grande celebração do esporte.
            </p>
            <Button asChild size="lg">
              <Link href={magazineUrl} target="_blank" rel="noopener noreferrer">
                Ler matéria na íntegra
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}

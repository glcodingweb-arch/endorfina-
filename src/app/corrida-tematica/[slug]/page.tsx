
import { notFound } from 'next/navigation';
import { THEMED_RACES_DATA } from '@/lib/themed-races-data';
import { Header } from '@/components/layout/header';
import Image from 'next/image';
import type { Metadata } from 'next';
import { CameraOff } from 'lucide-react';

interface ThemedRacePageProps {
  params: { slug: string };
}

// Generate metadata dynamically
export async function generateMetadata({ params }: ThemedRacePageProps): Promise<Metadata> {
  const event = THEMED_RACES_DATA.find(e => e.slug === params.slug);

  if (!event) {
    return {
      title: 'Evento não encontrado'
    };
  }

  return {
    title: `${event.heading} | Eventos Temáticos | Endorfina Esportes`,
    description: event.longDescription,
  };
}


export default function ThemedRacePage({ params }: ThemedRacePageProps) {
  const event = THEMED_RACES_DATA.find(e => e.slug === params.slug);

  if (!event) {
    notFound();
  }

  const galleryImages = event.gallery.map(img => ({
      id: img.id,
      imageUrl: img.url,
      description: img.alt,
      imageHint: img.hint
  }));

  return (
    <>
      <Header />
      <div className="container py-24 sm:py-32 px-4">
        
        {/* Header do Evento */}
        <header className="mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {event.logoSrc && (
                <Image 
                  src={event.logoSrc} 
                  alt={`Logo ${event.heading}`} 
                  width={150} 
                  height={150}
                  className="shrink-0 object-contain w-24 h-24 sm:w-36 sm:h-auto self-center sm:self-start"
                />
            )}
            <div className='flex-1'>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight uppercase">{event.heading}</h1>
                <p className="mt-4 text-base sm:text-lg text-muted-foreground">{event.longDescription}</p>
            </div>
          </div>
        </header>

        {/* Galeria */}
        <section>
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Galeria de Fotos</h2>
                <p className="mt-2 text-muted-foreground">Reviva os melhores momentos do evento.</p>
            </div>
            {galleryImages.length > 0 ? (
                <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
                    {galleryImages.map(image => (
                        <div key={image.id} className="mb-4 break-inside-avoid">
                            <Image
                                src={image.imageUrl}
                                alt={image.description}
                                width={500}
                                height={500}
                                className="w-full h-auto rounded-lg shadow-md"
                                data-ai-hint={image.imageHint}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 px-6 border-2 border-dashed rounded-2xl flex flex-col items-center gap-4 text-muted-foreground bg-slate-50">
                    <CameraOff className="w-10 h-10" />
                    <h3 className="text-xl font-semibold text-foreground">Nenhuma foto disponível</h3>
                    <p className="max-w-md">
                        Ainda não temos fotos para este evento. Por favor, volte mais tarde ou confira as galerias de outras corridas!
                    </p>
                </div>
            )}
        </section>

      </div>
    </>
  );
}

// Generate static pages for each themed race
export async function generateStaticParams() {
  return THEMED_RACES_DATA.map(event => ({
    slug: event.slug,
  }));
}

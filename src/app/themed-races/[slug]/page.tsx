
import { notFound } from 'next/navigation';
import { THEMED_RACES_DATA } from '@/lib/themed-races-data';
import { Header } from '@/components/layout/header';
import Image from 'next/image';
import { Gallery } from '@/components/gallery';
import type { Metadata } from 'next';

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
      <div className="container py-24 sm:py-32">
        
        {/* Header do Evento */}
        <header className="mb-12 max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start gap-6 text-left">
            {event.logoSrc && (
                <Image 
                  src={event.logoSrc} 
                  alt={`Logo ${event.heading}`} 
                  width={150} 
                  height={150}
                  className="shrink-0 object-contain w-36 h-auto self-start"
                />
            )}
            <div className='flex-1'>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight uppercase">{event.heading}</h1>
                <p className="mt-4 text-lg text-muted-foreground">{event.longDescription}</p>
            </div>
          </div>
        </header>

        {/* Galeria */}
        <section>
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Galeria de Fotos</h2>
                <p className="mt-2 text-muted-foreground">Reviva os melhores momentos do evento.</p>
            </div>
            <div className="columns-2 md:columns-3 gap-4">
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

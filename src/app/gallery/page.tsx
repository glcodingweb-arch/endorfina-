
'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/layout/header';


export default function GalleryPage() {
  const router = useRouter();
  const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-'));

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          <Button onClick={() => router.back()} variant="ghost" className="text-primary font-bold mb-8 flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar
          </Button>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-12">GALERIA DE <span className="text-primary">EMOÇÕES</span></h1>
          
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryImages.map((image) => (
              <Dialog key={image.id}>
                <DialogTrigger asChild>
                  <div className="break-inside-avoid rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:scale-[1.02] transition-transform cursor-zoom-in group">
                    <Image 
                      src={image.imageUrl} 
                      alt={image.description}
                      width={800}
                      height={800}
                      className="w-full h-auto object-cover"
                      data-ai-hint={image.imageHint}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 border-none">
                   <Image 
                      src={image.imageUrl} 
                      alt={image.description}
                      width={1200}
                      height={800}
                      className="w-full h-auto rounded-lg"
                      data-ai-hint={image.imageHint}
                    />
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

'use client';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface GalleryProps {
    images: ImagePlaceholder[];
}

export function Gallery({ images }: GalleryProps) {
  return (
    <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4">
      {images.map((image) => (
         <Dialog key={image.id}>
            <DialogTrigger asChild>
                <div className="mb-4 break-inside-avoid cursor-pointer group">
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="aspect-w-1 aspect-h-1 relative">
                                <Image
                                    src={image.imageUrl}
                                    alt={image.description}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    data-ai-hint={image.imageHint}
                                    loading="lazy"
                                    placeholder="blur"
                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNcvWS1LgAGJQIpt50GkgAAAABJRU5ErkJggg=="
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>{image.description}</DialogTitle>
                </DialogHeader>
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
  );
}


'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ImageUploaderProps {
  value: string;
  onChange: (value: string) => void;
}

const CLOUD_NAME = "dxgidvxty"; 
const UPLOAD_PRESET = "eventos"; 

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || 'Upload failed');
      }

      const data = await response.json();
      onChange(data.secure_url);
      toast({ title: 'Imagem enviada com sucesso!' });
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro no Upload', description: error.message || 'Não foi possível enviar a imagem. Verifique as configurações da Cloudinary.' });
    } finally {
      setIsUploading(false);
    }
  };

  const imageUrl = value?.startsWith('http')
    ? value
    : PlaceHolderImages.find(p => p.id === value)?.imageUrl;

  return (
    <div className="space-y-4">
      {imageUrl && (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden border">
          <Image src={imageUrl} alt="Preview do evento" fill className="object-cover" />
        </div>
      )}
      <div className="relative">
        <Input id="image-upload" type="file" onChange={handleFileChange} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
        <div className="w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground transition-colors hover:border-primary hover:bg-muted/50">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-8 w-8 mb-2" />
                <span>Clique para enviar ou arraste uma imagem</span>
              </>
            )}
        </div>
      </div>
    </div>
  );
}

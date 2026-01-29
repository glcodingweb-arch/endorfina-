
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
       <div className="w-10 h-10 relative">
        <Image 
          src="https://res.cloudinary.com/dl38o4mnk/image/upload/v1769463771/LOGO.png_gteiuk.png" 
          alt="Endorfina Esportes Logo"
          fill
          className="object-contain"
        />
      </div>
        <div className="flex flex-col">
            <span className={cn('text-xl font-black tracking-tighter leading-none text-slate-900', className)}>ENDORFINA</span>
            <span className={cn('text-[10px] font-bold text-primary tracking-[0.2em] uppercase leading-none mt-1', className)}>Esportes</span>
        </div>
    </div>
  );
}

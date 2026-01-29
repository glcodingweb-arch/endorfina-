

import { Hero } from '@/components/hero';
import { About } from '@/components/about';
import { Sponsors } from '@/components/sponsors';
import { ContactForm } from '@/components/contact-form';
import { HowItWorks } from '@/components/how-it-works';
import { ThemedRaces } from '@/components/themed-races';
import { TectonicRaces } from '@/components/tectonic-races';
import BentoGrid from '@/components/bento-grid';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Camera } from 'lucide-react';


export default function Home() {
  return (
    <>
      <Hero />
      <Sponsors />
      <HowItWorks />
      <TectonicRaces />
      <About />
      <BentoGrid />
      
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-slate-900 mb-16 text-center">Corridas Temáticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: "Bubble Run Fest", slug: "bubble-run-fest", img: "/ENDORFINA ESPORTES/LOGOS EVENTOS/BUBBLE RUN/BUBBLE RUN.png" },
              { name: "Color Explosion Run", slug: "color-explosion-run", img: "/ENDORFINA ESPORTES/LOGOS EVENTOS/COLOR EXPLOSION/COLOR EXPLOSION.png" },
              { name: "Neon Run Party", slug: "neon-run-party", img: "/ENDORFINA ESPORTES/LOGOS EVENTOS/NEON RUN/NEON RUN 1.png" },
              { name: "Pink GRU", slug: "pink-gru", img: "/ENDORFINA ESPORTES/LOGOS EVENTOS/PINK GRU/PINK GRU.png" }
            ].map((theme, idx) => (
              <div key={idx} className="group relative rounded-[3rem] overflow-hidden bento-card shadow-lg aspect-[16/9]">
                <Link href={`/corrida-tematica/${theme.slug}`}>
                    <img src={theme.img} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={theme.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-10 left-10">
                       <h3 className="text-2xl font-black text-white">{theme.name}</h3>
                       <div className="mt-4 px-6 py-2 bg-white text-slate-900 text-xs font-bold rounded-full inline-block group-hover:bg-purple-600 group-hover:text-white transition-all">Saber Mais</div>
                    </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactForm />
    </>
  );
}


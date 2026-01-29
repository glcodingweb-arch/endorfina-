
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const partners = [
  { id: 1, name: "Formula Group", logo: "/LOGOS PARCEIROS/FORMULA GROUP LOGO.png", link: "https://www.instagram.com/_formulagroup" },
  { id: 2, name: "Guarulhos Todo Dia", logo: "/LOGOS PARCEIROS/GUARULHOS TODO DIA LOGO.png", link: "https://www.instagram.com/guarulhos.tododia" },
  { id: 3, name: "LU BRIZ", logo: "/LOGOS PARCEIROS/LU BRIZ LOGO.png", link: "https://www.instagram.com/lubrizstudio" },
  { id: 4, name: "My Safe Sport", logo: "/LOGOS PARCEIROS/MY SAFE SPORT LOGO.png", link: "https://www.instagram.com/mysafesport" },
  { id: 5, name: "Ritmo Certo", logo: "/LOGOS PARCEIROS/RITMO CERTO LOGO.png", link: "https://www.instagram.com/ritmocerto_" },
  { id: 6, name: "Rota do Pico", logo: "/LOGOS PARCEIROS/ROTA DO PICO LOGO.png", link: "https://www.instagram.com/rotadopico" },
  { id: 7, name: "Studio Pafi", logo: "/LOGOS PARCEIROS/STUDIO PAFI LOGO.png", link: "https://www.instagram.com/studio_pafi" },
];

const PartnerLogo: React.FC<{ partner: typeof partners[0] }> = ({ partner }) => {
  const [src, setSrc] = useState(partner.logo);
  const fallbackSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=f8fafc&color=6D28D9&bold=true`;

  return (
    <Image
      src={src}
      alt={partner.name}
      width={96}
      height={96}
      className="w-full h-full object-cover rounded-full"
      onError={() => setSrc(fallbackSrc)}
    />
  );
};


export function Sponsors() {
  return (
    <div className="py-16 bg-white border-y border-slate-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Parceiros de Performance</p>
      </div>
      <div className="relative">
        <div className="slider">
          {[...partners, ...partners].map((p, idx) => (
            <Link
              key={idx}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="slide group block transition-all duration-500 hover:scale-110 active:scale-95 flex justify-center"
            >
              <div className="w-24 h-24 bg-white rounded-full shadow-lg border-2 border-slate-50 flex items-center justify-center overflow-hidden group-hover:border-purple-200 group-hover:shadow-purple-100/50 transition-all duration-500">
                <PartnerLogo partner={p} />
              </div>
            </Link>
          ))}
        </div>
        
        <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
      </div>
    </div>
  );
};

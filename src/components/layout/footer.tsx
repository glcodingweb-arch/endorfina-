
'use client';

import Link from "next/link";
import { Logo } from "@/components/logo";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useState } from "react";

const footerSections = [
  {
    title: "Navegação",
    links: [
      { name: "Home", href: "/" },
      { name: "Como Funciona", href: "/#ride" },
      { name: "Corridas", href: "/races" },
      { name: "Resultados", href: "/results" },
      { name: "Galeria", href: "/gallery" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Termos e Condições", href: "/terms" },
      { name: "Política de Privacidade", href: "/privacy" },
      { name: "Regulamentos", href: "#" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { name: "Blog Endorfina", href: "#" },
      { name: "Central de Ajuda", href: "/faq" },
      { name: "Lei de Incentivo", href: "/#sobre" },
    ],
  },
];

const socialLinks = [
  { id: "instagram", icon: FaInstagram, href: "https://www.instagram.com/endorfinaesportesbr", label: "Instagram" },
  { id: "facebook", icon: FaFacebook, href: "#", label: "Facebook" },
  { id: "twitter", icon: FaTwitter, href: "#", label: "Twitter" },
  { id: "linkedin", icon: FaLinkedin, href: "#", label: "LinkedIn" },
];


export function Footer() {
    const [currentYear, setCurrentYear] = useState<number | null>(null);

    useEffect(() => {
        setCurrentYear(new Date().getFullYear());
    }, []);

  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <Logo />
            </Link>
            <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-8">
              Líder em organização de eventos esportivos premium. Transformando o asfalto em palco de grandes conquistas.
            </p>
            <div className="flex gap-4">
               {socialLinks.map(({ id, icon: Icon, href, label }) => (
                 <a key={id} href={href} aria-label={label} className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-purple-600 hover:border-purple-600 transition-all">
                    <span className="sr-only">{label}</span>
                    <Icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>
          
         {footerSections.slice(1).map(section => (
              <div key={section.title}>
                <h4 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-widest">{section.title}</h4>
                <ul className="space-y-4">
                {section.links.map(link => (
                    <li key={link.name}><Link href={link.href} className="text-slate-500 text-sm hover:text-purple-600 transition-colors">{link.name}</Link></li>
                ))}
                </ul>
              </div>
         ))}

        </div>
        
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-xs">© {currentYear || new Date().getFullYear()} Endorfina Esportes Elite Street Racing. Todos os direitos reservados.</p>
            <Link href="http://glcoding.online/" target="_blank" rel="noopener noreferrer">
                <Image src="/selo-3-png.png" alt="Selo GL Coding" width={150} height={45} className="opacity-60 hover:opacity-100 transition-opacity" />
            </Link>
        </div>
      </div>
    </footer>
  );
};

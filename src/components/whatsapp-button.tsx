
'use client';

import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


export function WhatsappButton() {
  const phoneNumber = '5511962576903';
  const message = 'Olá! Gostaria de mais informações sobre as corridas.';
  
  const [isMounted, setIsMounted] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);

      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        const shouldBeVisible = footerRect.top > window.innerHeight; 
        setShowWhatsApp(shouldBeVisible);
      } else {
        setShowWhatsApp(true);
      }
    };
    
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMounted]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
        <AnimatePresence>
        {showBackToTop && (
             <div className={`fixed bottom-28 right-6 z-40 transition-all duration-500 ${
                showBackToTop ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50 pointer-events-none'
            }`}>
              <button
                onClick={scrollToTop}
                className="p-4 bg-purple-600 text-white rounded-full shadow-2xl hover:bg-purple-700 active:scale-90 border-2 border-white/20 group"
                aria-label="Voltar ao topo"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showWhatsApp && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-6 right-6 z-50"
            >
             <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-2xl shadow-green-200 border-4 border-white transform transition-transform group-hover:scale-110 group-hover:-rotate-12"
                    aria-label="Fale conosco no WhatsApp"
                  >
                    <FaWhatsapp className="h-8 w-8 text-white" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Dúvidas? Fale Conosco</p>
                </TooltipContent>
              </Tooltip>
             </TooltipProvider>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

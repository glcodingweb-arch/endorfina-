
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import './cookie-banner.css';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (consent !== 'granted' && consent !== 'denied') {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', 'granted');
    localStorage.setItem('cookie_preferences', JSON.stringify({ essential: true, analytics: true, marketing: true }));
    setShowBanner(false);
  };
  
  const handleSavePreferences = () => {
    // Em um app real, você leria os valores dos switches
    // Para este exemplo, vamos salvar um estado padrão
    const preferences = {
      essential: true, // Essenciais são sempre ativos
      analytics: (document.getElementById('analytics-switch') as HTMLInputElement)?.checked,
      marketing: (document.getElementById('marketing-switch') as HTMLInputElement)?.checked,
    };
    localStorage.setItem('cookie_consent', 'granted');
    localStorage.setItem('cookie_preferences', JSON.stringify(preferences));
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="cookie-container">
      <div className="cookie-card">
        <span className="title flex items-center gap-2">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M164.49,163.51a12,12,0,1,1-17,0A12,12,0,0,1,164.49,163.51Zm-81-8a12,12,0,1,0,17,0A12,12,0,0,0,83.51,155.51Zm9-39a12,12,0,1,0-17,0A12,12,0,0,0,92.49,116.49Zm48-1a12,12,0,1,0,0,17A12,12,0,0,0,140.49,115.51ZM232,128A104,104,0,1,1,128,24a8,8,0,0,1,8,8,40,40,0,0,0,40,40,8,8,0,0,1,8,8,40,40,0,0,0,40,40A8,8,0,0,1,232,128Zm-16.31,7.39A56.13,56.13,0,0,1,168.5,87.5a56.13,56.13,0,0,1-47.89-47.19,88,88,0,1,0,95.08,95.08Z"></path></svg>
          Aviso de Cookies
        </span>
        <p className="description">
          Esses cookies não quebram dieta. Só melhoram seu tempo. Nós os usamos para garantir a melhor experiência em nosso site.
          <Link href="/privacy"> Leia nossa política de privacidade</Link>.
        </p>
        <div className="actions">
          <Dialog>
            <DialogTrigger asChild>
               <button className="pref">
                Gerenciar preferências
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Preferências de Cookies</DialogTitle>
                <DialogDescription>
                  Escolha quais cookies você aceita. Você pode alterar suas preferências a qualquer momento.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="essential-switch" className="flex flex-col gap-1">
                    <span>Essenciais</span>
                    <span className="font-normal text-muted-foreground text-xs">Necessários para o site funcionar.</span>
                  </Label>
                  <Switch id="essential-switch" defaultChecked disabled />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics-switch" className="flex flex-col gap-1">
                    <span>Análise</span>
                     <span className="font-normal text-muted-foreground text-xs">Ajudam a entender como você usa o site.</span>
                  </Label>
                  <Switch id="analytics-switch" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="marketing-switch" className="flex flex-col gap-1">
                    <span>Marketing</span>
                    <span className="font-normal text-muted-foreground text-xs">Usados para personalizar anúncios.</span>
                  </Label>
                  <Switch id="marketing-switch" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSavePreferences}>Salvar e aceitar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <button className="accept" onClick={handleAcceptAll}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}


import type { LucideIcon } from 'lucide-react';
import { Shirt, Medal, Droplet, Sun, Zap, Gift } from 'lucide-react';

export interface KitItem {
  name: string;
  icon: LucideIcon;
}

export const MOCK_KIT_ITEMS_BASIC: KitItem[] = [
  { name: 'Camiseta Oficial do Evento', icon: Shirt },
  { name: 'Número de Peito com Chip', icon: Zap },
  { name: 'Medalha de Participação (Pós-prova)', icon: Medal },
  { name: 'Hidratação (Durante e Pós-prova)', icon: Droplet },
];

export const MOCK_KIT_ITEMS_PREMIUM: KitItem[] = [
    ...MOCK_KIT_ITEMS_BASIC,
    { name: 'Viseira ou Boné Exclusivo', icon: Sun },
    { name: 'Brindes dos Patrocinadores', icon: Gift },
];

export const MOCK_KIT_ITEMS_TEMATIC: KitItem[] = [
    { name: 'Camiseta Temática do Evento', icon: Shirt },
    { name: 'Acessório Neon ou Sachê de Cor', icon: Gift },
    { name: 'Número de Peito', icon: Zap },
    { name: 'Medalha Temática (Pós-prova)', icon: Medal },
];

export const getKitItems = (kitType?: string): KitItem[] => {
    if (kitType?.toLowerCase().includes('premium')) {
        return MOCK_KIT_ITEMS_PREMIUM;
    }
    if (kitType?.toLowerCase().includes('temático')) {
        return MOCK_KIT_ITEMS_TEMATIC;
    }
    return MOCK_KIT_ITEMS_BASIC;
}

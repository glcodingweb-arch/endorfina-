export type Coupon = {
  id: string;
  title: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: Date | null;
  endDate: Date | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
};

export const MOCK_COUPONS: Coupon[] = [
  {
    id: '1',
    title: 'Desconto de Boas-Vindas',
    code: 'BEMVINDO10',
    discountType: 'percentage',
    discountValue: 10,
    startDate: new Date('2024-01-01'),
    endDate: null,
    maxUses: null,
    currentUses: 125,
    isActive: true,
  },
  {
    id: '2',
    title: 'Cupom de Maratona',
    code: 'MARATONA20',
    discountType: 'fixed',
    discountValue: 20,
    startDate: new Date('2024-08-01'),
    endDate: new Date('2024-10-30'),
    maxUses: 100,
    currentUses: 42,
    isActive: true,
  },
  {
    id: '3',
    title: 'Especial Fim de Ano',
    code: 'FIMDEANO15',
    discountType: 'percentage',
    discountValue: 15,
    startDate: new Date('2023-12-01'),
    endDate: new Date('2023-12-31'),
    maxUses: 500,
    currentUses: 500,
    isActive: false,
  },
   {
    id: '4',
    title: 'Incentivo 5k',
    code: 'CORRE5K',
    discountType: 'fixed',
    discountValue: 15,
    startDate: null,
    endDate: null,
    maxUses: 200,
    currentUses: 88,
    isActive: true,
  },
];



import { Timestamp } from "firebase/firestore";

export type Lot = {
    name: string;
    price: number;
    startDate: string;
    endDate: string;
};

export type RaceOption = {
  id?: string;
  distance: string;
  bibPrefix?: number | null;
  lots: Lot[];
};

export type KitItem = {
    name: string;
    brand?: string;
};

export type Race = {
  id: string;
  name: string;
  date: string;
  location: string;
  distance: string;
  description: string;
  longDescription: string;
  image: string;
  featured: boolean;
  options: RaceOption[];
  organizerId: string;
  capacity?: number | null;
  status?: 'draft' | 'published' | 'closed';
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  tags?: string[];
  photoGalleryUrl?: string;
  kitItems?: KitItem[];
  showKitItems?: boolean;
  kitDelivery?: {
    enabled: boolean;
    price: number;
  };
  kitPickup?: {
    enabled: boolean;
    location: string;
    details?: string;
  };
};

export type RaceTag = {
  id: string;
  name: string;
  description?: string;
  createdAt: Timestamp;
};

export type RaceResult = {
  id: string;
  raceId: string;
  raceName: string;
  raceDate: string;
  participantId: string;
  userId?: string;
  athleteName: string;
  bibNumber: string;
  category: string;
  overallPosition: number;
  categoryPosition: number;
  netTime: string;
  grossTime: string;
};

export type CartItem = {
  raceId: string;
  raceName: string;
  raceImage: string;
  option: RaceOption;
  quantity: number;
};

export type EmailLog = {
  logId?: string;
  recipientEmail: string;
  type: 'abandonedCart' | 'pendingRegistration';
  status: 'sent' | 'failed';
  timestamp: Timestamp | string;
  error?: string;
};

export type Participant = {
  id: string;
  name: string;
  cpf: string;
  age: number;
  category: string;
  status: 'IDENTIFICADA' | 'PENDENTE_IDENTIFICACAO' | 'VALIDADA' | 'BLOQUEADA';
  kitStatus?: 'Pendente' | 'Impresso' | 'Entregue' | 'NaoAtendido' | 'Problema';
  bibNumber?: string;
  shirtSize?: string;
  userProfile?: Partial<UserProfile>;
  raceId: string;
  modality: string;
  userId: string;
  orderId: string;
  kitType?: string;
  createdAt?: Timestamp;
  emailHistory?: EmailLog[];
};

export type Coupon = {
  id: string;
  title: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  maxUses: number | null;
  currentUses: number;
  isActive: boolean;
  createdAt?: Timestamp;
};

export interface RaceEvent {
  id: string;
  name: string;
  date: string;
  location: string;
  distance: string;
  intensity: 'Beginner' | 'Intermediate' | 'Elite';
  image: string;
  description: string;
}

export interface TrainingTip {
  id: string;
  title: string;
  category: string;
  duration: string;
}

export interface ComboItem {
  raceId: string;
  modality: string;
  quantity: number;
}

export interface Combo {
  id: string;
  name: string;
  description?: string;
  price: number;
  eventId: string;
  items: ComboItem[];
  active: boolean;
  createdAt?: Timestamp | { seconds: number; nanoseconds: number; };
  updatedAt?: Timestamp | { seconds: number; nanoseconds: number; };
}

export type UserProfile = {
  id?: string;
  fullName?: string;
  birthDate?: string;
  email?: string;
  documentType?: "CPF" | "RG" | "Passaporte";
  documentNumber?: string;
  gender?: "Masculino" | "Feminino" | "Outro";
  phone?: string;
  mobilePhone?: string;
  shirtSize?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt?: Timestamp;
};

export type AbandonedCart = {
    id: string;
    userId?: string;
    customerEmail: string;
    customerName?: string;
    items: CartItem[];
    totalAmount: number;
    couponCode?: string;
    status: 'ACTIVE' | 'ABANDONED' | 'CONVERTED' | 'ARCHIVED';
    lastStep: 'CART' | 'IDENTIFICATION' | 'DELIVERY' | 'PAYMENT';
    createdAt: Timestamp | string;
    lastActivityAt: Timestamp | string;
    deviceType?: 'desktop' | 'mobile';
    emailHistory?: EmailLog[];
};

export type Notification = {
    id: string;
    title: string;
    description: string;
    createdAt: Timestamp;
    read: boolean;
    userId: string;
};

export type DeliveryAttempt = {
    agentId: string;
    agentName: string;
    status: 'Entregue' | 'NaoAtendido' | 'Problema';
    observation: string;
    timestamp: Timestamp | string;
};

export type Order = {
    id: string;
    orderNumber: string;
    userId: string;
    raceId: string;
    participantIds: string[];
    orderDate: Timestamp | string;
    orderStatus: string;
    orderStatusDetail: string;
    responsibleName: string;
    responsibleEmail: string;
    responsiblePhone?: string;
    totalAmount: number;
    deliveryMethod?: 'pickup' | 'home';
    deliveryFee?: number;
    kitDeliveryStatus?: 'Pendente' | 'Impresso' | 'Entregue' | 'NaoAtendido' | 'Problema';
    deliveryAddress?: string;
    deliveryAttempts?: DeliveryAttempt[];
    firstPrintedAt?: Timestamp | string;
    couponId?: string;
    couponCode?: string;
    discountAmount?: number;
}

export type AutomationSettings = {
  id?: string;
  abandonedCart: {
    minHoursSinceUpdate: number;
    minHoursBetweenEmails: number;
    maxEmailsPerDay: number;
  };
  pendingRegistration: {
    minHoursSinceCreation: number;
    minHoursBetweenEmails: number;
  };
};

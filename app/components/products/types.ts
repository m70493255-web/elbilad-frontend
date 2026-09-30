export interface ProductVariant {
  name: string;
  color: string;
  colorCode: string;
  defaultStorage: string;
  images: string[];
  storageOptions: { storage: string; originalPrice: number; salePrice: number }[];
}

export interface ProductSection {
  type: string;
  title: string;
  subtitle?: string;
  content: Record<string, unknown>;
  media: { type: string; url: string; alt?: string; sortOrder: number }[];
  sortOrder: number;
  isActive: boolean;
}

export interface Product {
  _id: string;
  name: string;
  brief?: string;
  originalPrice: number;
  salePrice?: number;
  price: number;
  discountPercent: number;
  description?: string;
  image?: string;
  images?: string[];
  color?: string;
  storage?: string;
  network?: string;
  screenSize?: string;
  variants?: ProductVariant[];
  specGroups?: { group: string; items: { key: string; value: string }[] }[];
  sections?: ProductSection[];
  gallery?: { url: string; caption: string }[];
  specs?: {
    screen?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    rearCamera?: string;
    frontCamera?: string;
    battery?: string;
    batteryLife?: string;
    charging?: string;
    os?: string;
    extras?: string;
  };
  freeDelivery: boolean;
  deliveryTime: string;
  warrantyYears: number;
  installment?: {
    available: boolean;
    downPayment?: number;
    months?: number;
    note?: string;
    conditions?: string[];
    policy?: string;
  };
  taxIncluded: boolean;
  category?: string;
  subCategory?: string;
  brand?: string;
  inStock: boolean;
}

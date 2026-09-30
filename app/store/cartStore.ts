import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../components/products/types";

export interface CartItem {
  product: Product;
  qty: number;
}

export interface CustomerInfo {
  name: string;
  nationalId: string;
  whatsapp: string;
  address: string;
  installmentType: "full" | "installment";
  installmentProvider?: "tabby" | "tamara" | "store";
  months: number;
  downPayment: number;
  discountCode?: string;
  discountAmount?: number;
  storeInstallment?: boolean;
}

interface CartState {
  items: CartItem[];
  customer: CustomerInfo | null;
  pendingDiscountCode: string | null;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  setCustomer: (info: CustomerInfo) => void;
  setPendingDiscountCode: (code: string) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      pendingDiscountCode: null,
      addItem: (product) =>
        set((s) => {
          const existing = s.items.find((i) => i.product._id === product._id);
          if (existing)
            return {
              items: s.items.map((i) =>
                i.product._id === product._id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          return { items: [...s.items, { product, qty: 1 }] };
        }),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.product._id !== id) })),
      updateQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.product._id !== id)
              : s.items.map((i) =>
                  i.product._id === id ? { ...i, qty } : i
                ),
        })),
      setCustomer: (info) => set({ customer: info }),
      setPendingDiscountCode: (code) => set({ pendingDiscountCode: code }),
      clear: () => set({ items: [], customer: null, pendingDiscountCode: null }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum + (i.product.salePrice ?? i.product.originalPrice ?? i.product.price) * i.qty,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);

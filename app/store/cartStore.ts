import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import type { Product } from "../components/products/types";

export const MAX_CART_ITEMS = 5;

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
  addItem: (product: Product) => boolean;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => boolean;
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
      addItem: (product) => {
        const state = get();
        const currentTotal = state.items.reduce((sum, i) => sum + i.qty, 0);
        if (currentTotal >= MAX_CART_ITEMS) {
          if (typeof window !== "undefined") {
            toast.error("الحد الأقصى للطلب هو 5 منتجات فقط");
          }
          return false;
        }

        set((s) => {
          const existing = s.items.find((i) => i.product._id === product._id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.product._id === product._id ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          }
          return { items: [...s.items, { product, qty: 1 }] };
        });
        return true;
      },
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.product._id !== id) })),
      updateQty: (id, qty) => {
        if (qty <= 0) {
          set((s) => ({ items: s.items.filter((i) => i.product._id !== id) }));
          return true;
        }

        const state = get();
        const otherTotal = state.items
          .filter((i) => i.product._id !== id)
          .reduce((sum, i) => sum + i.qty, 0);

        if (otherTotal + qty > MAX_CART_ITEMS) {
          if (typeof window !== "undefined") {
            toast.error("الحد الأقصى للطلب هو 5 منتجات فقط");
          }
          return false;
        }

        set((s) => ({
          items: s.items.map((i) =>
            i.product._id === id ? { ...i, qty } : i
          ),
        }));
        return true;
      },
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
    {
      name: "cart-storage",
      merge: (persistedState: any, currentState: CartState) => {
        const merged = { ...currentState, ...persistedState };
        if (Array.isArray(merged.items)) {
          let runningTotal = 0;
          const sanitizedItems: CartItem[] = [];
          for (const item of merged.items) {
            if (runningTotal >= MAX_CART_ITEMS) break;
            const remaining = MAX_CART_ITEMS - runningTotal;
            const itemQty = Math.min(item.qty || 1, remaining);
            if (itemQty > 0) {
              sanitizedItems.push({ ...item, qty: itemQty });
              runningTotal += itemQty;
            }
          }
          merged.items = sanitizedItems;
        }
        return merged;
      },
    }
  )
);

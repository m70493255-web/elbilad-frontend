import { create } from "zustand";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
let _fetchPromise: Promise<void> | null = null;

interface CompanyStore {
  logo: string;
  nameAr: string;
  nameEn: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  details: string;
  addressAr: string;
  taxNumber: string;
  _fetched: boolean;
  fetchCompany: () => Promise<void>;
  setLogo: (url: string) => void;
}

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  logo: "",
  nameAr: "",
  nameEn: "",
  phone: "",
  whatsapp: "",
  email: "",
  website: "",
  details: "",
  addressAr: "",
  taxNumber: "",
  _fetched: false,
  fetchCompany: () => {
    if (get()._fetched) return Promise.resolve();
    if (_fetchPromise) return _fetchPromise;
    _fetchPromise = (async () => {
      try {
        const res = await fetch(`/api/admin/company`, { credentials: "include" });
        if (!res.ok) return;
        const text = await res.text();
        if (!text) return;
        const data = JSON.parse(text);
        const fullLogo = data.logo
          ? (data.logo.startsWith("http") ? data.logo : `${API}${data.logo}`)
          : "";
        set({
          logo: fullLogo,
          nameAr: data.nameAr || "",
          nameEn: data.nameEn || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          email: data.email || "",
          website: data.website || "",
          details: data.details || "",
          addressAr: data.addressAr || "",
          taxNumber: data.taxNumber || "",
          _fetched: true,
        });
      } catch (e) { console.error(e); }
    })();
    return _fetchPromise;
  },
  setLogo: (url) => set({ logo: url }),
}));

// backward compat alias
export const useCompanyStoreLegacy = useCompanyStore;

"use client";

import { useState, useEffect, useSyncExternalStore, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { navItems } from "./data";
import { SearchIcon, CartIcon, MenuIcon, CloseIcon } from "./icons";
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import { useCartStore } from "../../store/cartStore";
import { useCompanyStore } from "../../store/companyStore";

export default function Navbar({ initialLogo }: { initialLogo?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ _id: string; name: string; images?: string[]; image?: string; salePrice?: number; originalPrice?: number; price?: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const { logo: storeLogo, fetchCompany } = useCompanyStore();
  const logo = initialLogo || storeLogo;

  const API_IMG = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const resolveImg = (src: string) => src.startsWith("http") ? src : `${API_IMG}${src.startsWith("/") ? src : "/" + src}`;

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchResults]);

  useEffect(() => {
    if (!initialLogo && !storeLogo) {
      fetchCompany();
    }
  }, [fetchCompany, initialLogo, storeLogo]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className="shadow-md sticky top-0 z-50" style={{ background: '#ffffff' }} dir="rtl">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Row 1: Logo + Icons (mobile: same row with hamburger) */}
        <div className="flex items-center justify-between h-16 sm:h-16 lg:h-20">
          {/* Logo + Hamburger */}
          <div className="flex items-center gap-1">
            <button
              aria-label="القائمة"
              className="lg:hidden p-1 sm:p-2 text-[#155E6F] hover:text-[#6DBE00] rounded-full transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <Link href="/" className="shrink-0" aria-label="الصفحة الرئيسية - مؤسسة البلاد الحديثة للإلكترونيات">
              {logo && (
                <Image
                  src={logo}
                  alt="مؤسسة البلاد الحديثة للإلكترونيات"
                  width={160}
                  height={60}
                  className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
                  priority
                />
              )}
            </Link>
          </div>

          {/* Desktop nav hidden here, shown in row 2 */}
          <div className="hidden lg:block" />

          {/* Icons */}
          <div className="flex items-center gap-0.5 sm:gap-2 md:gap-3">
            <button
              aria-label="بحث"
              className="p-1.5 sm:p-2 text-[#155E6F] hover:text-[#6DBE00] hover:bg-[#F5F7F8] rounded-full transition-colors"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <SearchIcon />
            </button>
            <Link href="/cart" aria-label="السلة" className="p-1.5 sm:p-2 text-[#155E6F] hover:text-[#6DBE00] hover:bg-[#F5F7F8] rounded-full transition-colors relative">
              <CartIcon />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 bg-red-500 text-white text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-0.5">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Row 2: Desktop nav links (desktop only) */}
        <div className="hidden lg:flex justify-center border-t border-gray-100 py-1">
          <DesktopNav items={navItems} />
        </div>
      </div>

      {searchOpen && (
        <div ref={searchWrapRef} className="border-t border-gray-100 px-4 py-2 relative" dir="rtl">
          <div className="flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="flex-1 border border-[#1F7A8C] rounded-full px-4 py-1.5 text-sm outline-none focus:border-[#6DBE00]"
            />
            {searching && (
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#6DBE00] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {results.length > 0 && (
            <ul className="absolute right-4 left-4 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-50 max-h-72 overflow-y-auto">
              {results.map((p) => {
                const img = p.images?.[0] || p.image;
                const price = p.salePrice ?? p.originalPrice ?? p.price ?? 0;
                return (
                  <li key={p._id}>
                    <Link
                      href={`/product/${p._id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); setResults([]); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F7F8] transition-colors"
                    >
                      {img && (
                        <Image src={resolveImg(img)} alt={p.name} width={40} height={40} className="object-contain rounded" unoptimized />
                      )}
                      <span className="flex-1 text-sm text-gray-800 line-clamp-1">{p.name}</span>
                      <span className="text-sm font-bold text-red-600 shrink-0">{price.toLocaleString("en-US")} ر.س</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!searching && searchQuery.trim() && results.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-3">لا توجد نتائج</p>
          )}
        </div>
      )}

      <MobileMenu items={navItems} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </nav>
  );
}

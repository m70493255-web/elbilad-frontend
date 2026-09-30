"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";
import SplashScreen from "./SplashScreen";
import IPhone18Popup from "./IPhone18Popup";
import { useCompanyStore } from "../store/companyStore";

export default function ClientLayout({
  children,
  footer,
  company,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  company?: any;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/invoice");

  if (company && !useCompanyStore.getState()._fetched) {
    const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const fullLogo = company.logo
      ? (company.logo.startsWith("http") ? company.logo : `${API}${company.logo}`)
      : "";
    useCompanyStore.setState({
      logo: fullLogo,
      nameAr: company.nameAr || "",
      nameEn: company.nameEn || "",
      phone: company.phone || "",
      whatsapp: company.whatsapp || "",
      email: company.email || "",
      website: company.website || "",
      details: company.details || "",
      addressAr: company.addressAr || "",
      taxNumber: company.taxNumber || "",
      _fetched: true,
    });
  }

  const logo = company?.logo
    ? (company.logo.startsWith("http")
        ? company.logo
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${company.logo}`)
    : undefined;

  return (
    <>
      {!isAdmin && <SplashScreen />}
      {!isAdmin && <IPhone18Popup />}
      {!isAdmin && <Navbar initialLogo={logo} />}
      {children}
      {!isAdmin && footer}
      {!isAdmin && <WhatsappButton />}
    </>
  );
}

import { useState } from "react";
import Link from "next/link";
import { NavItem } from "./data";
import { ChevronDownIcon } from "./icons";

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ items, isOpen, onClose }: MobileMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const hasChildren = (item: NavItem) => item.children || item.groups;

  return (
    <>
      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-16 sm:top-16 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`lg:hidden fixed top-16 sm:top-16 right-0 w-[75vw] max-w-[320px] h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-4rem)] bg-white z-50 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-[110%]"
        }`}
        dir="rtl"
      >
        <div className="py-2">
          <div className="px-4 py-4 text-base font-bold text-white border-b border-[#1F7A8C]" style={{ background: '#1a6b7d' }}>
            أقسام المتجر
          </div>
          {items.map((item) => (
            <div key={item.label} className="border-b border-gray-50">
              {hasChildren(item) ? (
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#F5F7F8] hover:text-[#155E6F] transition-colors"
                >
                  {item.label}
                  <span className={`transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`}>
                    <ChevronDownIcon />
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#F5F7F8] hover:text-[#155E6F] transition-colors"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              )}

              <div
                className={`transition-all duration-300 ease-in-out ${
                  hasChildren(item) && openDropdown === item.label ? "max-h-[600px] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <div className="bg-gray-50 py-1">
                  {/* groups mode */}
                  {item.groups?.map((group, gi) => (
                    <div key={gi}>
                      <div className="px-4 py-1.5 text-xs font-bold text-[#1F7A8C] uppercase tracking-wide border-b border-[#F5F7F8]">
                        {group.groupLabel}
                      </div>
                      {group.items.map((child, ci) => (
                        <Link
                          key={`${child.href}-${ci}`}
                          href={child.href}
                          className="block px-8 py-2.5 text-sm text-gray-600 hover:text-[#155E6F] hover:bg-[#F5F7F8] transition-colors"
                          onClick={onClose}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                  {/* children mode */}
                  {item.children?.map((child, index) => (
                    <Link
                      key={`${child.href}-${index}`}
                      href={child.href}
                      className="block px-8 py-2.5 text-sm text-gray-600 hover:text-[#155E6F] hover:bg-[#F5F7F8] transition-colors"
                      onClick={onClose}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

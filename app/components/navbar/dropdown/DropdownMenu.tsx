"use client";

import Link from "next/link";
import { NavGroup } from "../data";

interface DropdownMenuProps {
  items?: { label: string; href: string }[];
  groups?: NavGroup[];
}

export default function DropdownMenu({ items, groups }: DropdownMenuProps) {
  return (
    <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
      {groups?.map((group, gi) => (
        <div key={gi}>
          <div className="px-4 py-1.5 text-xs font-bold text-[#1F7A8C] uppercase tracking-wide border-b border-[#F5F7F8]">
            {group.groupLabel}
          </div>
          {group.items.map((item, ci) => (
            <Link
              key={`${item.href}-${ci}`}
              href={item.href}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7F8] hover:text-[#155E6F] transition-colors text-right"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ))}
      {items?.map((item, index) => (
        <Link
          key={`${item.href}-${index}`}
          href={item.href}
          className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#F5F7F8] hover:text-[#155E6F] transition-colors text-right"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

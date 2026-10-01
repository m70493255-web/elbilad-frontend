"use client";
import { useState } from "react";
import type { Category } from "../types";

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const PAGE_SIZE = 10;

interface CategoriesTableProps {
  categories: Category[];
  filtered: Category[];
  search: string;
  tableLoading?: boolean;
  onSearchChange: (v: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (name: string) => void;
}

export default function CategoriesTable({ categories, filtered, search, tableLoading, onSearchChange, onEdit, onDelete }: CategoriesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch(v: string) {
    onSearchChange(v);
    setCurrentPage(1);
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 py-3 border-b border-gray-100">
        <span className="text-xs sm:text-sm text-gray-500">إجمالي التصنيفات: <span className="font-bold text-gray-700">{categories.length}</span></span>
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="ابحث عن تصنيف..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48 md:w-52"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm">
            <tr>
              <th className="px-3 sm:px-4 py-3">#</th>
              <th className="px-3 sm:px-4 py-3">اسم التصنيف</th>
              <th className="px-3 sm:px-4 py-3 text-center">عدد المنتجات</th>
              <th className="px-3 sm:px-4 py-3">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableLoading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">جاري التحميل...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">لا توجد تصنيفات</td></tr>
            ) : (
              paginated.map((cat, i) => (
                <tr key={cat.name} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 text-gray-400 font-medium text-xs sm:text-sm">{(currentPage - 1) * PAGE_SIZE + i + 1}</td>
                  <td className="px-3 sm:px-4 py-3 font-medium text-gray-800 text-sm sm:text-base">{cat.name}</td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${cat.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                      {cat.count} منتج
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button onClick={() => onEdit(cat)} className="text-blue-500 hover:text-blue-700" title="تعديل">
                        <EditIcon />
                      </button>
                      <button onClick={() => onDelete(cat.name)} className="text-red-500 hover:text-red-700" title="حذف">
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-gray-100 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹ السابق
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            التالي ›
          </button>
        </div>
      )}
    </div>
  );
}


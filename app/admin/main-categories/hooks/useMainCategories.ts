"use client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import type { Category } from "../types";

const BASE = "/api/admin/main-categories";

export function useMainCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchCategories = useCallback(() => {
    setTableLoading(true);
    apiFetch(`${BASE}/extra`, { credentials: "include" })
      .then(async (res) => {
        const data: Category[] = res.ok ? await res.json() : [];
        setCategories(data);
      })
      .catch(() => toast.error("فشل تحميل التصنيفات"))
      .finally(() => setTableLoading(false));
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await apiFetch(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "حدث خطأ");
    setShowModal(false);
    setName("");
    toast.success(`تم إضافة "${data.name}" بنجاح 🎉`);
    fetchCategories();
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);
    const res = await apiFetch(`${BASE}/rename`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ oldName: editCat!.name, newName: editName }),
    });
    const data = await res.json().catch(() => ({}));
    setEditLoading(false);
    if (!res.ok) return setEditError(data.error ?? "حدث خطأ");
    setEditCat(null);
    toast.success("تم حفظ التعديلات بنجاح ✅");
    fetchCategories();
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    const catName = confirmDelete;
    setConfirmDelete(null);
    const res = await apiFetch(`${BASE}/remove`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: catName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(data.error ?? "حدث خطأ أثناء الحذف");
    toast.success(`تم حذف "${catName}" بنجاح ✅`);
    fetchCategories();
  }

  const filtered = categories.filter((c) => c.name.includes(search));

  return {
    categories, filtered, search, setSearch,
    tableLoading,
    showModal, setShowModal, name, setName, error, loading, handleAdd,
    editCat, setEditCat, editName, setEditName, editError, editLoading, handleEdit,
    confirmDelete, setConfirmDelete, confirmDeleteAction,
  };
}


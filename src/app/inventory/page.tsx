"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useApp, Medicine } from "@/context/AppContext";
import { api, ApiCatalogueMedicine } from "@/services/api";
import { SkeletonTable } from "@/components/Skeleton";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Pill,
  Loader2,
  BookOpen,
  Boxes,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  Tag,
  Clock,
  Layers,
  Info,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Upload,
} from "lucide-react";

export default function InventoryPage() {
  const { medicines, addMedicine, addFromCatalogue, bulkAddFromCatalogue, updateMedicine, deleteMedicine, loading } = useApp();

  // Search & Filter State for Inventory
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const [uploadingMedImage, setUploadingMedImage] = useState(false);
  const [medImageUploadError, setMedImageUploadError] = useState("");

  const handleMedImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMedImageUploadError("Image size exceeds 5MB limit.");
      return;
    }

    setUploadingMedImage(true);
    setMedImageUploadError("");
    try {
      const res = await api.uploadMedicineImage(file);
      if (res?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: res.url }));
      }
    } catch (err: any) {
      setMedImageUploadError(err.message || "Failed to upload image.");
    } finally {
      setUploadingMedImage(false);
    }
  };

  // Catalogue Browse & Bulk Add State
  const [showCatalogueModal, setShowCatalogueModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [catalogueSearch, setCatalogueSearch] = useState("");
  const [catalogueCategory, setCatalogueCategory] = useState("All");
  const [catalogueDosageForm, setCatalogueDosageForm] = useState("All");
  const [cataloguePage, setCataloguePage] = useState(1);
  const cataloguePageSize = 25;
  const [catalogueMedicines, setCatalogueMedicines] = useState<ApiCatalogueMedicine[]>([]);
  const [catalogueCategories, setCatalogueCategories] = useState<string[]>([]);
  const [catalogueDosageForms, setCatalogueDosageForms] = useState<string[]>([]);
  const [catalogueLoading, setCatalogueLoading] = useState(false);

  // Selected item from catalogue to add
  const [selectedCatalogueMed, setSelectedCatalogueMed] = useState<ApiCatalogueMedicine | null>(null);
  const [addPrice, setAddPrice] = useState<number>(15.0);
  const [addQuantity, setAddQuantity] = useState<number>(50);
  const [addBatch, setAddBatch] = useState<string>("");
  const [addExpiry, setAddExpiry] = useState<string>("");
  const [addAvailable, setAddAvailable] = useState<boolean>(true);

  // Bulk add state
  const [bulkSelectedIds, setBulkSelectedIds] = useState<number[]>([]);
  const [bulkDefaultPrice, setBulkDefaultPrice] = useState<number>(15.0);
  const [bulkDefaultQuantity, setBulkDefaultQuantity] = useState<number>(50);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ added_count: number; skipped_count: number; message: string } | null>(null);

  // Modal Control State for Edit / Delete / Custom Create
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMed, setCurrentMed] = useState<Medicine | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Custom Create Form Fields State
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    strength: "500mg",
    dosageForm: "Tablet",
    routeOfAdministration: "Oral",
    dosage: "500mg",
    price: 15.0,
    stockQuantity: 100,
    dosageInstructions: "Adults: 1-2 tablets every 4-6 hours as required. Do not exceed 8 tablets in 24 hours.",
    tags: "Oral Tablet, Fast Acting, FDA Approved",
    manufacturer: "Ghana National Pharma",
    category: "Analgesics",
    description: "Effective relief of mild to moderate pain and fever.",
    precautions: "Do not exceed recommended dose.",
    sideEffects: "Rare allergic reactions.",
    imageUrl: "",
    requiresPrescription: false,
    batchNumber: "",
    expiryDate: "",
    isAvailable: true,
  });

  // Load Catalogue Categories and Dosage Forms
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, forms] = await Promise.all([
          api.getCatalogueCategories(),
          api.getCatalogueDosageForms(),
        ]);
        setCatalogueCategories(cats);
        setCatalogueDosageForms(forms);
      } catch (err) {
        console.error("Failed to load catalogue filters:", err);
      }
    }
    loadMeta();
  }, []);

  // Reset catalogue page on filter change
  useEffect(() => {
    setCataloguePage(1);
  }, [catalogueSearch, catalogueCategory, catalogueDosageForm]);

  const catalogueAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (showCatalogueModal || showBulkAddModal) {
      if (catalogueAbortControllerRef.current) {
        catalogueAbortControllerRef.current.abort();
        catalogueAbortControllerRef.current = null;
      }

      const controller = new AbortController();
      catalogueAbortControllerRef.current = controller;

      const timer = setTimeout(async () => {
        setCatalogueLoading(true);
        try {
          const data = await api.getCatalogueMedicines({
            q: catalogueSearch,
            category: catalogueCategory,
            dosage_form: catalogueDosageForm,
            page: cataloguePage,
            page_size: cataloguePageSize,
            signal: controller.signal,
          } as any);
          if (!controller.signal.aborted) {
            setCatalogueMedicines(data);
          }
        } catch (err: any) {
          if (err?.name !== "AbortError" && !controller.signal.aborted) {
            console.error("Failed to fetch catalogue medicines:", err);
          }
        } finally {
          if (!controller.signal.aborted) {
            setCatalogueLoading(false);
          }
        }
      }, 200);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }
  }, [showCatalogueModal, showBulkAddModal, catalogueSearch, catalogueCategory, catalogueDosageForm, cataloguePage]);

  // Set of medicine IDs already in pharmacy inventory
  const inventoryMedicineIds = new Set(
    medicines.map((m) => m.medicineId).filter((id): id is number => typeof id === "number")
  );

  // Handlers for Catalogue Add
  const handleOpenCatalogueAdd = (med: ApiCatalogueMedicine) => {
    setSelectedCatalogueMed(med);
    setAddPrice(15.0);
    setAddQuantity(50);
    setAddBatch(`B-${Date.now().toString().slice(-4)}`);
    setAddExpiry("");
    setAddAvailable(true);
  };

  const handleCatalogueAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatalogueMed) return;
    try {
      setSubmitting(true);
      await addFromCatalogue({
        medicineId: selectedCatalogueMed.id,
        price: addPrice,
        stockQuantity: addQuantity,
        batchNumber: addBatch,
        expiryDate: addExpiry || undefined,
        isAvailable: addAvailable,
      });
      setSelectedCatalogueMed(null);
    } catch (err: any) {
      alert(err.message || "Failed to add medicine from catalogue.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handlers for Bulk Add
  const toggleBulkSelect = (id: number) => {
    setBulkSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllBulk = () => {
    const unaddedIds = catalogueMedicines
      .filter((m) => !inventoryMedicineIds.has(m.id))
      .map((m) => m.id);
    if (bulkSelectedIds.length === unaddedIds.length) {
      setBulkSelectedIds([]);
    } else {
      setBulkSelectedIds(unaddedIds);
    }
  };

  const handleBulkAddSubmit = async () => {
    if (bulkSelectedIds.length === 0) return;
    try {
      setBulkSubmitting(true);
      const res = await bulkAddFromCatalogue(
        bulkSelectedIds,
        bulkDefaultPrice,
        bulkDefaultQuantity
      );
      setBulkResult(res);
      setBulkSelectedIds([]);
    } catch (err: any) {
      alert(err.message || "Bulk addition failed. Please try again.");
    } finally {
      setBulkSubmitting(false);
    }
  };

  // Handlers for Edit
  const openEditModal = (med: Medicine) => {
    setCurrentMed(med);
    setFormData({
      name: med.name,
      genericName: med.genericName || "",
      strength: med.strength || med.dosage || "500mg",
      dosageForm: med.dosageForm || "Tablet",
      routeOfAdministration: med.routeOfAdministration || "Oral",
      dosage: med.dosage || "500mg",
      price: med.price,
      stockQuantity: med.stockQuantity,
      dosageInstructions: med.dosageInstructions || "",
      tags: med.tags || "",
      manufacturer: med.manufacturer || "Ridge Pharmacy",
      category: med.category || "General",
      description: med.description || "",
      precautions: med.precautions || "",
      sideEffects: med.sideEffects || "",
      imageUrl: med.imageUrl || "",
      requiresPrescription: med.requiresPrescription ?? false,
      batchNumber: med.batchNumber || "",
      expiryDate: med.expiryDate || "",
      isAvailable: med.isAvailable ?? true,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (med: Medicine) => {
    setCurrentMed(med);
    setShowDeleteModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMed) {
      try {
        setSubmitting(true);
        await updateMedicine(currentMed.id, {
          price: formData.price,
          stockQuantity: formData.stockQuantity,
          batchNumber: formData.batchNumber,
          expiryDate: formData.expiryDate,
          isAvailable: formData.isAvailable,
          imageUrl: formData.imageUrl,
        });
        setShowEditModal(false);
      } catch (err: any) {
        alert(err.message || "Failed to update inventory record.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (currentMed) {
      try {
        await deleteMedicine(currentMed.id);
        setShowDeleteModal(false);
      } catch (err: any) {
        alert(err.message || "Failed to remove medicine from inventory.");
      }
    }
  };

  // Custom Add Submit
  const handleCustomAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await addMedicine({
        name: formData.name,
        genericName: formData.genericName,
        strength: formData.strength || formData.dosage,
        dosageForm: formData.dosageForm,
        routeOfAdministration: formData.routeOfAdministration,
        dosage: formData.strength || formData.dosage,
        dosageInstructions: formData.dosageInstructions,
        stockQuantity: formData.stockQuantity,
        price: formData.price,
        description: formData.description,
        precautions: formData.precautions,
        sideEffects: formData.sideEffects,
        tags: formData.tags,
        imageUrl: formData.imageUrl,
        manufacturer: formData.manufacturer,
        category: formData.category,
        requiresPrescription: formData.requiresPrescription,
        batchNumber: formData.batchNumber,
        expiryDate: formData.expiryDate,
        isAvailable: formData.isAvailable,
      });
      setShowAddCustomModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to create new medicine.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Inventory items
  const filteredMeds = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.genericName && m.genericName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.strength && m.strength.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.category && m.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === "All" ||
      (selectedStatus === "In Stock" && m.status === "In Stock") ||
      (selectedStatus === "Low Stock" && m.status === "Low Stock") ||
      (selectedStatus === "Out of Stock" && m.status === "Out of Stock") ||
      (selectedStatus === "Unavailable" && m.status === "Unavailable");

    return matchesSearch && matchesStatus;
  });

  const inStockCount = medicines.filter((m) => m.status === "In Stock").length;
  const lowStockCount = medicines.filter((m) => m.status === "Low Stock").length;
  const outOfStockCount = medicines.filter((m) => m.status === "Out of Stock" || m.status === "Unavailable").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header & Top CTA Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Pharmacy Inventory</h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Browse our centralized medicine catalogue to instantly stock medicines or manage existing branch inventory.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setCatalogueSearch("");
              setShowBulkAddModal(true);
            }}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all duration-200"
          >
            <Boxes size={16} className="text-teal-400" />
            Bulk Add from Catalogue
          </button>
          <button
            onClick={() => {
              setCatalogueSearch("");
              setShowCatalogueModal(true);
            }}
            className="flex items-center gap-2 bg-[#005c55] hover:bg-[#004843] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-teal-900/10 transition-all duration-200"
          >
            <BookOpen size={16} className="text-teal-200" />
            Browse Shared Catalogue
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Stocked</p>
            <h3 className="text-2xl font-black text-slate-800 mt-0.5">{medicines.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700">
            <Pill size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Stock</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-0.5">{inStockCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Stock</p>
            <h3 className="text-2xl font-black text-amber-600 mt-0.5">{lowStockCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Out of Stock</p>
            <h3 className="text-2xl font-black text-rose-600 mt-0.5">{outOfStockCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <X size={20} />
          </div>
        </div>
      </div>

      {/* Main Inventory Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search and Filters Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search your inventory by name, generic, strength, batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
            {["All", "In Stock", "Low Stock", "Out of Stock"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedStatus === st
                    ? "bg-teal-50 text-[#005c55] border border-teal-200 shadow-sm"
                    : "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}

            <button
              onClick={() => setShowAddCustomModal(true)}
              className="ml-auto text-xs font-bold text-slate-500 hover:text-teal-700 underline flex items-center gap-1"
            >
              <Plus size={14} /> Custom Medicine
            </button>
          </div>
        </div>

        {/* Inventory Items Table */}
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filteredMeds.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-teal-50 text-[#005c55] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Pill size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-800">No medicines found in inventory</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              Select verified medicines from the shared MediFind catalogue to instantly start offering them in your branch.
            </p>
            <button
              onClick={() => setShowCatalogueModal(true)}
              className="inline-flex items-center gap-2 bg-[#005c55] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-[#004843] transition-all"
            >
              <BookOpen size={14} /> Browse Central Catalogue
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Medicine Details</th>
                  <th className="py-3 px-4">Form & Strength</th>
                  <th className="py-3 px-4">Selling Price</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Batch & Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {filteredMeds.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        {med.imageUrl ? (
                          <img
                            src={med.imageUrl}
                            alt={med.name}
                            className="w-9 h-9 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-black shrink-0 border border-teal-100">
                            {med.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{med.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {med.genericName ? `${med.genericName} • ` : ""}{med.category || "General"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-700 font-bold">{med.strength || med.dosage}</span>
                      <span className="text-[10px] text-slate-400 block">{med.dosageForm || "Tablet"}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900">GHS {Number(med.price).toFixed(2)}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold">{med.stockQuantity} packs</span>
                    </td>

                    <td className="py-3.5 px-4 text-[11px]">
                      <span className="font-mono text-slate-600 block">{med.batchNumber || "—"}</span>
                      <span className="text-slate-400 block">{med.expiryDate || "—"}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          med.status === "In Stock"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : med.status === "Low Stock"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {med.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(med)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-teal-700 rounded-lg transition-colors"
                          title="Edit Price/Stock"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(med)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          title="Remove from Pharmacy Stock"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* BROWSE CENTRAL CATALOGUE MODAL */}
      {showCatalogueModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#005c55]">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">Central Medicine Catalogue</h2>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Select a medicine from the verified MediFind catalogue to add directly to your inventory.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCatalogueModal(false);
                  setSelectedCatalogueMed(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Search & Filters */}
            <div className="p-4 border-b border-slate-100 bg-white grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6 relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalogue (Paracetamol, Amoxicillin...)"
                  value={catalogueSearch}
                  onChange={(e) => setCatalogueSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={catalogueCategory}
                  onChange={(e) => setCatalogueCategory(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="All">All Categories</option>
                  {catalogueCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={catalogueDosageForm}
                  onChange={(e) => setCatalogueDosageForm(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600"
                >
                  <option value="All">All Dosage Forms</option>
                  {catalogueDosageForms.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catalogue Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {catalogueLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-teal-600" /> Loading catalogue...
                </div>
              ) : catalogueMedicines.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-xs font-bold text-slate-700">No catalogue medicines found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different term or clear filters.</p>
                </div>
              ) : (
                catalogueMedicines.map((item) => {
                  const alreadyAdded = inventoryMedicineIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 hover:border-teal-400/60 bg-white hover:bg-teal-50/20 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-800 text-sm">{item.name}</span>
                          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-mono font-bold border border-teal-100">
                            {item.strength || item.dosage || "500mg"}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                            {item.dosage_form || "Tablet"}
                          </span>
                          {item.requires_prescription && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                              Rx Required
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.generic_name ? <span className="font-semibold text-slate-600">Generic: {item.generic_name} • </span> : null}
                          {item.manufacturer ? `Mfr: ${item.manufacturer} • ` : ""}
                          {item.category || "General"}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {alreadyAdded ? (
                          <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-bold border border-slate-200 flex items-center gap-1">
                            <Check size={13} className="text-emerald-600" /> In Stock
                          </span>
                        ) : (
                          <button
                            onClick={() => handleOpenCatalogueAdd(item)}
                            className="px-3 py-1.5 rounded-lg bg-[#005c55] hover:bg-[#004843] text-white text-[11px] font-bold shadow-sm flex items-center gap-1 transition-all"
                          >
                            <Plus size={13} /> Add to Inventory
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls for Catalogue Browse */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">
                Page {cataloguePage} • {catalogueMedicines.length} items shown
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCataloguePage((p) => Math.max(1, p - 1))}
                  disabled={cataloguePage <= 1 || catalogueLoading}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-xs font-bold">
                  {cataloguePage}
                </span>
                <button
                  onClick={() => setCataloguePage((p) => p + 1)}
                  disabled={catalogueMedicines.length < cataloguePageSize || catalogueLoading}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">
                Can't find a medicine? Use the Custom Medicine option.
              </span>
              <button
                onClick={() => {
                  setShowCatalogueModal(false);
                  setShowAddCustomModal(true);
                }}
                className="text-xs font-bold text-teal-800 hover:underline"
              >
                + Create Custom Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD PRICE & STOCK MODAL (FROM CATALOGUE SELECTION) */}
      {selectedCatalogueMed && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-teal-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">Set Price & Stock</h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  {selectedCatalogueMed.name} ({selectedCatalogueMed.strength || selectedCatalogueMed.dosage})
                </p>
              </div>
              <button
                onClick={() => setSelectedCatalogueMed(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCatalogueAddSubmit} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Selling Price (GHS) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={addPrice}
                  onChange={(e) => setAddPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Available Quantity (Packs) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Batch Number (Optional)</label>
                  <input
                    type="text"
                    value={addBatch}
                    onChange={(e) => setAddBatch(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={addExpiry}
                    onChange={(e) => setAddExpiry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="addAvailableCheckbox"
                  checked={addAvailable}
                  onChange={(e) => setAddAvailable(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="addAvailableCheckbox" className="text-xs text-slate-700 font-bold cursor-pointer">
                  Publish as available for patient search and reservation
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCatalogueMed(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#005c55] hover:bg-[#004843] text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Add to Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ADD MODAL */}
      {showBulkAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center">
                  <Boxes size={20} />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">Bulk Add Medicines from Catalogue</h2>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Select multiple medicines to add to your inventory at once with default pricing & quantities.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBulkAddModal(false);
                  setBulkResult(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Default Parameters Bar */}
            <div className="p-4 bg-teal-50/60 border-b border-teal-100 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-4">
                <label className="text-slate-700 font-bold block mb-1">Default Price (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={bulkDefaultPrice}
                  onChange={(e) => setBulkDefaultPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-teal-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="text-slate-700 font-bold block mb-1">Default Initial Stock</label>
                <input
                  type="number"
                  min="0"
                  value={bulkDefaultQuantity}
                  onChange={(e) => setBulkDefaultQuantity(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-teal-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="sm:col-span-4 flex items-end">
                <button
                  onClick={handleSelectAllBulk}
                  className="w-full py-2 bg-white hover:bg-teal-100 text-teal-900 border border-teal-200 font-bold rounded-lg text-xs transition-colors"
                >
                  {bulkSelectedIds.length > 0 ? "Deselect All" : "Select All Unadded"}
                </button>
              </div>
            </div>

            {/* Success Summary Toast */}
            {bulkResult && (
              <div className="p-3 mx-4 mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-600 shrink-0" />
                <span>{bulkResult.message}</span>
              </div>
            )}

            {/* Filter Search */}
            <div className="p-3 border-b border-slate-100 bg-white">
              <input
                type="text"
                placeholder="Filter catalogue medicines..."
                value={catalogueSearch}
                onChange={(e) => setCatalogueSearch(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            {/* Catalogue Items to Check */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {catalogueLoading ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-teal-600" /> Loading...
                </div>
              ) : (
                catalogueMedicines.map((item) => {
                  const alreadyAdded = inventoryMedicineIds.has(item.id);
                  const isChecked = bulkSelectedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => !alreadyAdded && toggleBulkSelect(item.id)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        alreadyAdded
                          ? "bg-slate-50/75 border-slate-200 opacity-60 cursor-not-allowed"
                          : isChecked
                          ? "bg-teal-50/40 border-teal-500 cursor-pointer shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-teal-700">
                          {alreadyAdded ? (
                            <Check size={16} className="text-slate-400" />
                          ) : isChecked ? (
                            <CheckSquare size={18} className="text-[#005c55]" />
                          ) : (
                            <Square size={18} className="text-slate-300" />
                          )}
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                            {item.name}
                            <span className="font-mono text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-100">
                              {item.strength || item.dosage || "500mg"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.generic_name ? `${item.generic_name} • ` : ""}
                            {item.dosage_form || "Tablet"} • {item.manufacturer || "Generic"}
                          </div>
                        </div>
                      </div>

                      {alreadyAdded && (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                          In Stock
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls for Bulk Add */}
            <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-semibold">
                Page {cataloguePage} • {catalogueMedicines.length} items shown
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCataloguePage((p) => Math.max(1, p - 1))}
                  disabled={cataloguePage <= 1 || catalogueLoading}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={13} /> Prev
                </button>
                <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-xs font-bold">
                  {cataloguePage}
                </span>
                <button
                  onClick={() => setCataloguePage((p) => p + 1)}
                  disabled={catalogueMedicines.length < cataloguePageSize || catalogueLoading}
                  className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Bulk Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {bulkSelectedIds.length} medicines selected
              </span>
              <button
                onClick={handleBulkAddSubmit}
                disabled={bulkSubmitting || bulkSelectedIds.length === 0}
                className="px-5 py-2.5 bg-[#005c55] hover:bg-[#004843] text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-40 transition-all flex items-center gap-2"
              >
                {bulkSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Adding to Inventory...
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Add {bulkSelectedIds.length} Selected Medicines
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT INVENTORY MODAL */}
      {showEditModal && currentMed && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">Edit Inventory Stock & Price</h3>
                <p className="text-[11px] text-slate-500 font-semibold">{currentMed.name} ({currentMed.strength || currentMed.dosage})</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-700 block mb-1 font-bold">Selling Price (GHS) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block mb-1 font-bold">Current Stock Quantity (Packs) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stockQuantity: parseInt(e.target.value, 10) || 0 }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, batchNumber: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Medicine Product Image */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="text-slate-700 block font-bold text-[11px] uppercase tracking-wider">Product Photo (Optional)</label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Medicine preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-slate-400" size={18} />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                      {uploadingMedImage ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-teal-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={12} className="text-teal-600" />
                          <span>Upload Photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        disabled={uploadingMedImage}
                        onChange={handleMedImageUpload}
                        className="hidden"
                      />
                    </label>
                    {formData.imageUrl && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                        className="ml-2 text-xs font-bold text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editAvailableCheckbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isAvailable: e.target.checked }))}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="editAvailableCheckbox" className="text-xs text-slate-700 font-bold cursor-pointer">
                  Available for Patient Search & App Reservations
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#005c55] hover:bg-[#004843] text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE INVENTORY CONFIRM MODAL */}
      {showDeleteModal && currentMed && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">Remove from Pharmacy Stock?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove <span className="font-bold text-slate-700">{currentMed.name}</span> from your branch inventory?
              </p>
              <p className="text-[10px] text-slate-400 mt-2">
                (This will only remove the item from your branch. The central catalogue entry and historical orders remain safe.)
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Keep Item
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-600/20"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM MEDICINE CREATION MODAL */}
      {showAddCustomModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">Create & Add Custom Medicine</h3>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Specify complete product, clinical, and inventory attributes to register a new medicine.
                </p>
              </div>
              <button onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-slate-700 p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCustomAddSubmit} className="p-6 overflow-y-auto space-y-6 text-xs font-semibold">
              {/* SECTION 1: PRODUCT IDENTIFICATION */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-[10px]">1</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Product Identification</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Brand / Trade Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Paracetamol Extra, Amoxil"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Generic Name (INN)</label>
                    <input
                      type="text"
                      placeholder="e.g. Acetaminophen, Amoxicillin"
                      value={formData.genericName}
                      onChange={(e) => setFormData((prev) => ({ ...prev, genericName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Strength / Potency *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 500mg, 100mg/5ml"
                      value={formData.strength}
                      onChange={(e) => setFormData((prev) => ({ ...prev, strength: e.target.value, dosage: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Dosage Form</label>
                    <select
                      value={formData.dosageForm}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dosageForm: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Syrup">Syrup</option>
                      <option value="Suspension">Suspension</option>
                      <option value="Injection">Injection</option>
                      <option value="Inhaler">Inhaler</option>
                      <option value="Ointment">Ointment</option>
                      <option value="Cream">Cream</option>
                      <option value="Eye Drops">Eye Drops</option>
                      <option value="Ear Drops">Ear Drops</option>
                      <option value="Suppository">Suppository</option>
                      <option value="Powder">Powder</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Route of Administration</label>
                    <select
                      value={formData.routeOfAdministration}
                      onChange={(e) => setFormData((prev) => ({ ...prev, routeOfAdministration: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    >
                      <option value="Oral">Oral</option>
                      <option value="Topical">Topical</option>
                      <option value="Intravenous">Intravenous (IV)</option>
                      <option value="Intramuscular">Intramuscular (IM)</option>
                      <option value="Inhalation">Inhalation</option>
                      <option value="Ophthalmic">Ophthalmic (Eyes)</option>
                      <option value="Otic">Otic (Ears)</option>
                      <option value="Sublingual">Sublingual</option>
                      <option value="Rectal">Rectal</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Therapeutic Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Analgesics, Antibiotics, Antimalarials"
                      value={formData.category}
                      onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Manufacturer / Brand</label>
                    <input
                      type="text"
                      placeholder="e.g. Ernest Chemists, Kinapharma, Pfizer"
                      value={formData.manufacturer}
                      onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                {/* Custom Medicine Product Photo */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="text-slate-700 block font-bold text-[11px] uppercase tracking-wider">Product Photo (Optional)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Medicine preview" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-400" size={18} />
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors">
                          {uploadingMedImage ? (
                            <>
                              <Loader2 size={12} className="animate-spin text-teal-600" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload size={12} className="text-teal-600" />
                              <span>Upload Photo</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/jpg"
                            disabled={uploadingMedImage}
                            onChange={handleMedImageUpload}
                            className="hidden"
                          />
                        </label>
                        {formData.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="url"
                        placeholder="Or paste medicine image URL..."
                        value={formData.imageUrl}
                        onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                        className="w-full px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="requiresPrescriptionCustom"
                    checked={formData.requiresPrescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, requiresPrescription: e.target.checked }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="requiresPrescriptionCustom" className="text-xs text-slate-700 font-bold cursor-pointer">
                    Requires Prescription (Rx required from doctor before dispensing)
                  </label>
                </div>
              </div>

              {/* SECTION 2: CLINICAL & USAGE DETAILS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-[10px]">2</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Clinical & Usage Guidelines</h4>
                </div>

                <div>
                  <label className="text-slate-700 block mb-1 font-bold">Description / Indications</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what the medicine treats and its indications..."
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Dosage Instructions</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Adults: 1-2 tablets three times daily after meals."
                      value={formData.dosageInstructions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, dosageInstructions: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Precautions & Warnings</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Avoid alcohol, not recommended during pregnancy."
                      value={formData.precautions}
                      onChange={(e) => setFormData((prev) => ({ ...prev, precautions: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Side Effects</label>
                    <input
                      type="text"
                      placeholder="e.g. May cause drowsiness, mild nausea"
                      value={formData.sideEffects}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sideEffects: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Search Tags</label>
                    <input
                      type="text"
                      placeholder="e.g. Pain Relief, Fever, Rapid Action"
                      value={formData.tags}
                      onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: INVENTORY & STOCKING DETAILS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="w-5 h-5 rounded-md bg-teal-50 text-teal-700 font-bold flex items-center justify-center text-[10px]">3</span>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Pharmacy Stock & Pricing</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Selling Price (GHS) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Initial Stock Quantity (Packs) *</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stockQuantity: parseInt(e.target.value, 10) || 0 }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Batch / Lot Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. B-9021"
                      value={formData.batchNumber}
                      onChange={(e) => setFormData((prev) => ({ ...prev, batchNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block mb-1 font-bold">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="customAvailableCheckbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isAvailable: e.target.checked }))}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="customAvailableCheckbox" className="text-xs text-slate-700 font-bold cursor-pointer">
                    Publish as Available for Patient Search & App Reservations
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 bg-[#005c55] hover:bg-[#004843] text-white font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? "Registering Medicine..." : "Save & Add to Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, Medicine } from "@/context/AppContext";
import { api } from "@/services/api";
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
  Loader2
} from "lucide-react";


export default function InventoryPage() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal Control State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMed, setCurrentMed] = useState<Medicine | null>(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields State (shared between add/edit)
  const [formData, setFormData] = useState({
    name: "",
    price: 15.0,
    stockQuantity: 100,
    dosage: "500mg",
    dosageInstructions: "Adults & Children > 12y:\n1-2 tablets every 4-6 hours as required. Do not exceed 8 tablets in 24 hours.",
    tags: "Oral Tablet, Fast Acting, FDA Approved",
    manufacturer: "Ridge Pharmacy",
    description: "Effective for relief of mild to moderate pain including headache, migraine, neuralgia, toothache, sore throat, period pain, and relief of symptoms of flu and fever.",
    precautions: "Avoid alcohol consumption while taking this medication.\nDo not take with other paracetamol-containing products.",
    sideEffects: "Common side effects are rare but may include allergic reactions (skin rash, swelling), or blood disorders. Consult a doctor if you experience any unusual symptoms.",
    imageUrl: "",
  });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const uploaded = await api.uploadMedicineImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: uploaded.url }));
    } catch (err: any) {
      alert(err.message || "Failed to upload medicine image.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Handlers
  const openAddModal = () => {
    setFormData({
      name: "",
      price: 15.0,
      stockQuantity: 100,
      dosage: "500mg",
      dosageInstructions: "Adults & Children > 12y:\n1-2 tablets every 4-6 hours as required. Do not exceed 8 tablets in 24 hours.",
      tags: "Oral Tablet, Fast Acting, FDA Approved",
      manufacturer: "Ridge Pharmacy",
      description: "Effective for relief of mild to moderate pain including headache, migraine, neuralgia, toothache, sore throat, period pain, and relief of symptoms of flu and fever.",
      precautions: "Avoid alcohol consumption while taking this medication.\nDo not take with other paracetamol-containing products.",
      sideEffects: "Common side effects are rare but may include allergic reactions (skin rash, swelling), or blood disorders. Consult a doctor if you experience any unusual symptoms.",
      imageUrl: "",
    });
    setShowAddModal(true);
  };

  const openEditModal = (med: Medicine) => {
    setCurrentMed(med);
    setFormData({
      name: med.name,
      price: med.price,
      stockQuantity: med.stockQuantity,
      dosage: med.dosage || "500mg",
      dosageInstructions: med.dosageInstructions || "",
      tags: med.tags || "Oral Tablet, Fast Acting, FDA Approved",
      manufacturer: med.manufacturer || "Ridge Pharmacy",
      description: med.description || "",
      precautions: med.precautions || "",
      sideEffects: med.sideEffects || "",
      imageUrl: med.imageUrl || "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (med: Medicine) => {
    setCurrentMed(med);
    setShowDeleteModal(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await addMedicine(formData);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to add medicine to inventory.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMed) {
      try {
        setSubmitting(true);
        await updateMedicine(currentMed.id, formData);
        setShowEditModal(false);
      } catch (err: any) {
        alert(err.message || "Failed to update medicine details.");
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
        alert(err.message || "Failed to delete medicine entry.");
      }
    }
  };

  // Filter medicines
  const filteredMeds = medicines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-headline">Medicine Catalog</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage medicine stock, images, dosage instructions & warnings</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary hover:bg-teal-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-teal-700/20 hover:shadow-teal-700/35 transition-all duration-200 text-sm select-none"
        >
          <Plus size={16} className="stroke-[3]" />
          Add New Medicine
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicine name, brand or indication..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-150"
          />
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredMeds.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm font-semibold">
              No matching medicines found in catalog.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Medicine Name</th>
                  <th className="py-4 px-6">Dosage Strength</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6">Retail Price(GH₵)</th>
                  <th className="py-4 px-6">Manufacturer</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeds.map((med) => {
                  return (
                    <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {med.imageUrl ? (
                            <img src={med.imageUrl} alt={med.name} className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-teal-50 text-primary flex items-center justify-center shrink-0 border border-teal-100">
                              <Pill size={20} />
                            </div>
                          )}
                          <div>
                            <p className="font-extrabold text-slate-800 text-base">{med.name}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-700">
                        {med.dosage || "500mg"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${med.status === "In Stock"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : med.status === "Low Stock"
                            ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                          }`}>
                          {med.status === "In Stock"
                            ? `In Stock`
                            : med.status === "Low Stock"
                              ? `Low Stock`
                              : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-black text-slate-800 text-base">
                        {med.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-semibold">
                        {med.manufacturer || "Ridge Pharmacy"}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/inventory/${med.id}`}
                            title="View Details"
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors border border-transparent hover:border-slate-200"
                          >
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => openEditModal(med)}
                            title="Edit Medicine"
                            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors border border-transparent hover:border-slate-200"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(med)}
                            title="Delete Medicine"
                            className="w-8 h-8 rounded-lg hover:bg-rose-50 text-rose-600 flex items-center justify-center transition-colors border border-transparent hover:border-rose-100"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL: ADD MEDICINE */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 text-md">Add New Medicine</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Fields marked with <span className="text-rose-500 font-bold">*</span> are required</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Medicine Name <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Paracetamol"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold"
                  />
                </div>

                {/* Medicine Image Upload */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Medicine Package Image <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Medicine preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200/60 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                        <Pill size={24} />
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                      />
                      {uploadingImage && <p className="text-[10px] text-teal-600 font-semibold animate-pulse">Uploading image to cloud storage...</p>}
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="Or paste public image URL (https://...)"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Dosage Strength / Form <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 500mg or 100mg/5ml"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Retail Price (GH¢) <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Initial Stock Quantity <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Manufacturer Name <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Ridge Pharmacy"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Form & Badges / Tags <span className="text-slate-400 font-normal normal-case">(Optional, comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. Oral Tablet, Fast Acting, FDA Approved"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Description <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Effective for relief of mild to moderate pain including headache, migraine..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm leading-relaxed"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Dosage Instructions <span className="text-slate-400 font-normal normal-case">(Optional, enter points on new lines for Adults/Children)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.dosageInstructions}
                    onChange={(e) => setFormData({ ...formData, dosageInstructions: e.target.value })}
                    placeholder="Adults & Children > 12y: 1-2 tablets every 4-6 hours as required..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm leading-relaxed font-semibold text-slate-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-rose-600 mb-1.5">
                    Precautions & Warnings <span className="text-rose-400 font-normal normal-case">(Optional, enter points on new lines)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.precautions}
                    onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
                    placeholder="Avoid alcohol consumption while taking this medication..."
                    className="w-full px-3 py-2 border border-rose-200 bg-rose-50/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-sm leading-relaxed text-rose-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-700 mb-1.5">
                    Side Effects <span className="text-teal-500 font-normal normal-case">(Optional, enter points on new lines)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.sideEffects}
                    onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                    placeholder="Common side effects are rare but may include allergic reactions..."
                    className="w-full px-3 py-2 border border-teal-200 bg-teal-50/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm leading-relaxed text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-primary hover:bg-teal-800 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all select-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <span>Add Medicine</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEDICINE */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-slate-800 text-md">Edit Medicine Details</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">Fields marked with <span className="text-rose-500 font-bold">*</span> are required</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Medicine Name <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold"
                  />
                </div>

                {/* Medicine Image Upload */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Medicine Package Image <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                  </label>
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Medicine preview" className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-200/60 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                        <Pill size={24} />
                      </div>
                    )}
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                      />
                      {uploadingImage && <p className="text-[10px] text-teal-600 font-semibold animate-pulse">Uploading image to cloud storage...</p>}
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="Or paste public image URL (https://...)"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Dosage Strength / Form <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Retail Price (GH¢) <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Stock Quantity <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Manufacturer <span className="text-rose-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Form & Badges / Tags <span className="text-slate-400 font-normal normal-case">(Optional, comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Description <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm leading-relaxed"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Dosage Instructions <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.dosageInstructions}
                    onChange={(e) => setFormData({ ...formData, dosageInstructions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm leading-relaxed font-semibold text-slate-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-rose-600 mb-1.5">
                    Precautions & Warnings <span className="text-rose-400 font-normal normal-case">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.precautions}
                    onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
                    className="w-full px-3 py-2 border border-rose-200 bg-rose-50/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 text-sm leading-relaxed text-rose-900"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-teal-700 mb-1.5">
                    Side Effects <span className="text-teal-500 font-normal normal-case">(Optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={formData.sideEffects}
                    onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
                    className="w-full px-3 py-2 border border-teal-200 bg-teal-50/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 text-sm leading-relaxed text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 px-5 py-2 bg-primary hover:bg-teal-800 disabled:opacity-60 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all select-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}




      {/* MODAL: DELETE CONFIRMATION */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-6 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg tracking-tight">Delete Medicine Catalog Entry?</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Are you sure you want to remove <span className="font-bold text-slate-700">{currentMed?.name}</span>? This action cannot be undone and will reject active reservations waiting on this stock.
                </p>
              </div>


              <div className="w-full flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel, Keep Entry
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-rose-600/25"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

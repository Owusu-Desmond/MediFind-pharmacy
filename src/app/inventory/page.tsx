"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, Medicine } from "@/context/AppContext";
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
  HelpCircle
} from "lucide-react";

export default function InventoryPage() {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useApp();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentMed, setCurrentMed] = useState<Medicine | null>(null);

  // Form Fields State (shared between add/edit)
  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    batchNumber: "",
    stockQuantity: 0,
    price: 0,
    category: "Analgesic",
    expiryDate: "",
    description: "",
    manufacturer: "",
  });

  const categories = [
    "All",
    "Analgesic",
    "Antibiotic",
    "Antidiabetic",
    "Cardiovascular",
    "Antihistamine",
    "Gastrointestinal",
  ];

  // Handlers
  const openAddModal = () => {
    setFormData({
      name: "",
      dosage: "",
      batchNumber: "",
      stockQuantity: 100,
      price: 10,
      category: "Analgesic",
      expiryDate: "2027-12-31",
      description: "",
      manufacturer: "",
    });
    setShowAddModal(true);
  };

  const openEditModal = (med: Medicine) => {
    setCurrentMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      batchNumber: med.batchNumber,
      stockQuantity: med.stockQuantity,
      price: med.price,
      category: med.category,
      expiryDate: med.expiryDate,
      description: med.description || "",
      manufacturer: med.manufacturer || "",
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
      await addMedicine(formData);
      setShowAddModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to add medicine to inventory.");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentMed) {
      try {
        await updateMedicine(currentMed.id, formData);
        setShowEditModal(false);
      } catch (err: any) {
        alert(err.message || "Failed to update medicine details.");
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
      m.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.manufacturer && m.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight font-headline">Medicine Catalog</h2>
          <p className="text-xs text-slate-400 mt-0.5">Manage stock availability and batch expiry schedules</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary hover:bg-teal-800 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg shadow-teal-700/20 hover:shadow-teal-700/35 transition-all duration-200 text-sm select-none"
        >
          <Plus size={16} className="stroke-[3]" />
          Add New Medicine
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicine name, batch or lab..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-150"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-150 select-none border ${
                selectedCategory === cat
                  ? "bg-teal-50 border-teal-200 text-primary"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
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
                  <th className="py-4 px-6">Medicine & Dosage</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Batch No</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6">Retail Price</th>
                  <th className="py-4 px-6">Expiry Date</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMeds.map((med) => {
                  const isExpiredSoon = new Date(med.expiryDate) < new Date("2027-01-01");
                  return (
                    <tr key={med.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm">
                      <td className="py-4 px-6">
                        <p className="font-extrabold text-slate-800">{med.name}</p>
                        <p className="text-[11px] font-semibold text-slate-400">{med.dosage} • {med.manufacturer}</p>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-semibold">
                        {med.category}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">
                        {med.batchNumber}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          med.status === "In Stock"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                            : med.status === "Low Stock"
                            ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse"
                            : "bg-rose-50 text-rose-700 border-rose-100"
                        }`}>
                          {med.status === "In Stock" 
                            ? `${med.stockQuantity} In Stock` 
                            : med.status === "Low Stock" 
                            ? `Low Stock (${med.stockQuantity})` 
                            : "Out of Stock"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-800">
                        GH¢ {med.price.toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`flex items-center gap-1 text-xs font-semibold ${
                          isExpiredSoon ? "text-rose-600" : "text-slate-500"
                        }`}>
                          {isExpiredSoon && <AlertTriangle size={12} />}
                          {med.expiryDate}
                        </span>
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
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-md">Add New Medicine</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ibuprofen"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Dosage / Strength</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 400mg"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="e.g. B-IBU-772"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Retail Price (GH¢)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Manufacturer / Laboratory</label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Pharma Ghana Ltd"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Keep in dry place below 30°C."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20"
                >
                  Add Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT MEDICINE */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-md">Edit Medicine Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Dosage / Strength</label>
                  <input
                    type="text"
                    required
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Batch Number</label>
                  <input
                    type="text"
                    required
                    value={formData.batchNumber}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Retail Price (GH¢)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-white"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Manufacturer</label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description (Optional)</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20"
                >
                  Save Changes
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
                  Are you sure you want to remove <span className="font-bold text-slate-700">{currentMed?.name} {currentMed?.dosage}</span> (Batch: {currentMed?.batchNumber})? This action cannot be undone and will reject active reservations waiting on this stock.
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

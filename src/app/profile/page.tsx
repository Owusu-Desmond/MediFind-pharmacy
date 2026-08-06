"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  User, 
  MapPin, 
  Clock, 
  Truck, 
  FileText,
  Save,
  CheckCircle,
  Building
} from "lucide-react";

export default function ProfilePage() {
  const { profile, updateProfile } = useApp();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    openingHours: profile.openingHours,
    deliveryOffered: profile.deliveryOffered,
    gpsCoordinates: profile.gpsCoordinates || "",
    pharmacistName: profile.pharmacistName || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    try {
      await updateProfile(formData);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile settings.");
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200 select-none">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-headline">Pharmacy Profile</h2>
        <p className="text-xs text-slate-400 mt-0.5">Manage your branch contact details, operational hours and logistics</p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle className="text-emerald-600 shrink-0" size={18} />
          <span className="text-xs font-bold text-emerald-800">Pharmacy profile details updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Store & Contact details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="text-primary" size={16} />
            Branch Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Pharmacy Branch Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Supervising Pharmacist</label>
              <input
                type="text"
                required
                value={formData.pharmacistName}
                onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Official Contact Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Opening Hours Description</label>
              <input
                type="text"
                required
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location & Logistics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="text-primary" size={16} />
            Location & Logistics
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Physical Location Address</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">GPS Coordinates / Digital Address</label>
              <input
                type="text"
                value={formData.gpsCoordinates}
                onChange={(e) => setFormData({ ...formData, gpsCoordinates: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Truck size={16} className="text-primary" /> Offer Home Delivery
                </h4>
                <p className="text-[11px] text-slate-400 font-semibold">Allow users to book delivery for prescription reservations.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryOffered: !formData.deliveryOffered })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  formData.deliveryOffered ? "bg-primary" : "bg-slate-300"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform ${
                  formData.deliveryOffered ? "translate-x-6.5" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Verification info (Read Only) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="text-primary" size={16} />
            Registration Certificate & Licensing
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-slate-500">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Registration Authority</span>
              <span className="text-slate-700">Pharmacy Council of Ghana</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">License Reference ID</span>
              <span className="text-slate-700 font-mono">{profile.licenseNumber}</span>
            </div>
            <div className="col-span-2 pt-2 flex items-center gap-2 text-emerald-700">
              <CheckCircle size={16} className="stroke-[2.5]" />
              <span>License Status: Verified & Approved Active Branch</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary hover:bg-teal-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-teal-700/20 transition-all text-sm"
          >
            <Save size={16} />
            Save Profile Settings
          </button>
        </div>

      </form>
    </div>
  );
}

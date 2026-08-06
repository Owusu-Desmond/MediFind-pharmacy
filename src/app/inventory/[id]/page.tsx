"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  ArrowLeft, 
  Pill, 
  Tag, 
  Building, 
  DollarSign, 
  Boxes, 
  Calendar,
  AlertTriangle,
  History,
  ShieldCheck
} from "lucide-react";

export default function MedicineDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { medicines, reservations } = useApp();
  const id = params.id as string;

  const medicine = medicines.find((m) => m.id === id);

  if (!medicine) {
    return (
      <div className="text-center py-16">
        <h3 className="font-extrabold text-slate-800 text-lg">Medicine Not Found</h3>
        <p className="text-slate-400 text-xs mt-1.5">The medicine you are searching for does not exist in your catalog.</p>
        <Link href="/inventory" className="text-xs font-bold text-primary hover:underline mt-4 inline-block">
          Return to Inventory
        </Link>
      </div>
    );
  }

  // Filter reservations containing this medicine
  const associatedReservations = reservations.filter((res) => 
    res.medicines.some((m) => 
      m.name.toLowerCase().includes(medicine.name.toLowerCase()) || 
      medicine.name.toLowerCase().includes(m.name.toLowerCase())
    )
  );

  const isExpiredSoon = new Date(medicine.expiryDate) < new Date("2027-01-01");

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Back button */}
      <div>
        <Link
          href="/inventory"
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors w-fit select-none"
        >
          <ArrowLeft size={16} />
          Back to Inventory Catalog
        </Link>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Overview spec sheet */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Specs Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-primary flex items-center justify-center shrink-0 border border-teal-100">
              <Pill size={32} />
            </div>
            <div className="space-y-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                medicine.status === "In Stock"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : medicine.status === "Low Stock"
                  ? "bg-amber-50 text-amber-700 border-amber-100"
                  : "bg-rose-50 text-rose-700 border-rose-100"
              }`}>
                {medicine.status}
              </span>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none mt-1.5">{medicine.name} {medicine.dosage}</h1>
              <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 pt-0.5">
                <Building size={14} /> Manufactured by: {medicine.manufacturer}
              </p>
            </div>
          </div>

          {/* Detailed Info Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
            <h3 className="font-extrabold text-slate-800 text-md border-b border-slate-100 pb-3">Technical Specifications</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Category */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                  <Tag size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Therapeutic Category</span>
                  <span className="text-sm font-bold text-slate-700">{medicine.category}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                  <DollarSign size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retail Price (pack)</span>
                  <span className="text-sm font-extrabold text-slate-700">GH¢ {medicine.price.toFixed(2)}</span>
                </div>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                  <Boxes size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Stock Volume</span>
                  <span className="text-sm font-bold text-slate-700">{medicine.stockQuantity} Packs available</span>
                </div>
              </div>

              {/* Expiry */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 border border-slate-100">
                  <Calendar size={18} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Batch Expiration Schedule</span>
                  <span className={`text-sm font-bold flex items-center gap-1.5 ${
                    isExpiredSoon ? "text-rose-600 font-extrabold" : "text-slate-700"
                  }`}>
                    {medicine.expiryDate}
                    {isExpiredSoon && <AlertTriangle size={14} className="text-rose-500 animate-bounce" />}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinical Description & Indications</h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100/60">
                {medicine.description || "No clinical description uploaded. Standard pharmacy guidelines apply for dispersing."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Associated Reservation Logs */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <History className="text-primary" size={18} />
              <h3 className="font-extrabold text-slate-800 text-md">Linked Reservations</h3>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[360px]">
              {associatedReservations.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-semibold leading-relaxed">
                  No active reservations currently requesting this medicine.
                </div>
              ) : (
                associatedReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400">{res.id}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${
                        res.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-100"
                          : res.status === "Confirmed"
                          ? "bg-teal-50 text-primary border-teal-100"
                          : res.status === "Picked Up"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {res.status}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-700">{res.patientName}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{res.date} at {res.time}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-200/50">
                      <span className="text-slate-500 font-semibold">Qty Reserved:</span>
                      <span className="font-bold text-slate-700">
                        {res.medicines.find(m => m.name.toLowerCase().includes(medicine.name.toLowerCase()))?.quantity || 1} packs
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

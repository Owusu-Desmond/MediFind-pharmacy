"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  ArrowLeft,
  Pill,
  Building,
  Info,
  AlertTriangle,
  History,
  Activity,
  CheckCircle,
  FileText
} from "lucide-react";

export default function MedicineDetailsPage() {
  const params = useParams();
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

  const parseListItems = (text?: string): string[] => {
    if (!text) return [];
    return text
      .split(/\n|•|\\n/)
      .map((item) => item.replace(/^[-*•]\s*/, "").trim())
      .filter(Boolean);
  };

  const tagList = (medicine.tags || "Oral Tablet, Fast Acting, FDA Approved").split(",").map(t => t.trim());
  const dosageList = parseListItems(medicine.dosageInstructions || medicine.dosage || "Adults & Children > 12y:\n1-2 tablets every 4-6 hours as required. Do not exceed 8 tablets in 24 hours.");
  const precautionsList = parseListItems(medicine.precautions || "Avoid alcohol consumption while taking this medication.\nDo not take with other paracetamol-containing products.");
  const sideEffectsList = parseListItems(medicine.sideEffects || "Common side effects are rare but may include allergic reactions (skin rash, swelling), or blood disorders. Consult a doctor if you experience any unusual symptoms.");


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
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                {medicine.imageUrl ? (
                  <img src={medicine.imageUrl} alt={medicine.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-teal-50 text-primary flex items-center justify-center shrink-0 border border-teal-100">
                    <Pill size={36} />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                    {medicine.name} {medicine.dosage && <span className="text-teal-700 font-extrabold text-xl">({medicine.dosage})</span>}
                  </h1>
                  <p className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mt-1">
                    <Building size={14} className="text-slate-400" /> {medicine.manufacturer || "Ridge Pharmacy"}
                  </p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${medicine.status === "In Stock"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                  : medicine.status === "Low Stock"
                    ? "bg-amber-50 text-amber-700 border-amber-100"
                    : "bg-rose-50 text-rose-700 border-rose-100"
                }`}>
                ✓ {medicine.status} ({medicine.stockQuantity} available)
              </span>
            </div>

            {/* Price Box */}
            <div className="bg-teal-50/60 border border-teal-100/80 rounded-2xl p-4">
              <span className="text-[11px] font-extrabold text-teal-800 tracking-wider uppercase block">PRICE</span>
              <span className="text-3xl font-black text-teal-900 mt-0.5 block">
                GH¢ {medicine.price.toFixed(2)}
              </span>
            </div>

            {/* Badges / Tags */}
            <div className="flex flex-wrap gap-2 pt-1">
              {tagList.map((tag, idx) => (
                <span key={idx} className="px-3.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/60 flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-teal-600" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-800">
              <Info size={18} className="text-teal-700" />
              <h3 className="font-extrabold text-slate-800 text-base">Description</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100/80">
              {medicine.description || "Effective for relief of mild to moderate pain including headache, migraine, neuralgia, toothache, sore throat, period pain, and relief of symptoms of flu and fever."}
            </p>
          </div>

          {/* Dosage Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-800">
              <FileText size={18} className="text-teal-700" />
              <h3 className="font-extrabold text-slate-800 text-base">Dosage</h3>
            </div>
            <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100/80 space-y-1">
              <p className="text-xs text-slate-800 font-extrabold">
                {medicine.dosage || "Adults & Children > 12y:"}
              </p>
            </div>
          </div>

          {/* Precautions Section */}
          <div className="bg-rose-50/30 p-6 rounded-3xl border border-rose-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-700">
              <AlertTriangle size={18} className="text-rose-600" />
              <h3 className="font-extrabold text-rose-800 text-base">Precautions</h3>
            </div>
            <div className="bg-white/80 p-4 rounded-2xl border border-rose-100 space-y-2">
              {(medicine.precautions || "Avoid alcohol consumption while taking this medication.\nDo not take with other paracetamol-containing products.")
                .split("\n")
                .map((item, idx) => (
                  <p key={idx} className="text-xs text-rose-900 font-semibold flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span> {item}
                  </p>
                ))}
            </div>
          </div>

          {/* Side Effects Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-teal-800">
              <Activity size={18} className="text-teal-700" />
              <h3 className="font-extrabold text-slate-800 text-base">Side Effects</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-2xl border border-slate-100/80">
              {medicine.sideEffects || "Common side effects are rare but may include allergic reactions (skin rash, swelling), or blood disorders. Consult a doctor if you experience any unusual symptoms."}
            </p>
          </div>

        </div>

        {/* Right Side: Associated Reservation Logs */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
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
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold border ${res.status === "Pending"
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


"use client";

import React, { useState } from "react";
import { useApp, Reservation } from "@/context/AppContext";
import { 
  Check, 
  X, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  CreditCard, 
  MessageSquare,
  FileText,
  UserCheck,
  ClipboardList
} from "lucide-react";

export default function ReservationsPage() {
  const { reservations, updateReservationStatus } = useApp();
  const [selectedResId, setSelectedResId] = useState<string>(
    reservations.length > 0 ? reservations[0].id : ""
  );
  const [filter, setFilter] = useState<string>("All");

  const selectedRes = reservations.find((r) => r.id === selectedResId);

  // Filter reservations
  const filteredRes = reservations.filter((r) => {
    if (filter === "All") return true;
    return r.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusStyle = (status: Reservation["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Confirmed":
        return "bg-teal-50 text-primary border-teal-100";
      case "Picked Up":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-8 select-none">
      
      {/* Left Pane: Reservations list */}
      <div className="w-full md:w-[350px] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm shrink-0">
        
        {/* Pane Header */}
        <div className="p-4 border-b border-slate-200/80 space-y-3">
          <h3 className="font-extrabold text-slate-800 text-md">Reservations Queue</h3>
          
          {/* Status filter tabs */}
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            {["All", "Pending", "Confirmed", "Picked Up"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all select-none ${
                  filter === tab
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab === "Picked Up" ? "Completed" : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredRes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No reservations found.
            </div>
          ) : (
            filteredRes.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedResId(res.id)}
                className={`p-4 cursor-pointer transition-all border-l-4 ${
                  selectedResId === res.id
                    ? "bg-teal-50/20 border-primary"
                    : "border-transparent hover:bg-slate-50/50"
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-bold text-slate-400">{res.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(res.status)}`}>
                    {res.status}
                  </span>
                </div>

                <h4 className="font-extrabold text-slate-800 text-sm mt-2">{res.patientName}</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  {res.fulfillmentMethod} • {res.medicines.length} Medicines
                </p>

                <div className="flex justify-between items-center pt-3 mt-1 text-[11px] text-slate-400 font-semibold border-t border-slate-100">
                  <span>{res.date} • {res.time}</span>
                  <span className="font-extrabold text-slate-700">GH¢ {res.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Selected details view */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm">
        {selectedRes ? (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-150">
            
            {/* Detail Header */}
            <div className="p-6 border-b border-slate-200/80 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
              <div>
                <span className="text-xs font-bold text-slate-400">Reservation Reference: {selectedRes.id}</span>
                <h2 className="text-xl font-black text-slate-800 tracking-tight mt-1">{selectedRes.patientName}</h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1">
                  <Phone size={14} /> {selectedRes.patientPhone}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${getStatusStyle(selectedRes.status)}`}>
                {selectedRes.status}
              </span>
            </div>

            {/* Scrollable details body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Requested Medicines Section */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <FileText className="text-primary" size={16} />
                  Prescription Medicine Order
                </h3>
                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                        <th className="p-3.5 pl-4">Medicine Item</th>
                        <th className="p-3.5 text-center">Quantity</th>
                        <th className="p-3.5 text-right">Unit Price</th>
                        <th className="p-3.5 text-right pr-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRes.medicines.map((med, index) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors text-slate-700 font-semibold">
                          <td className="p-3.5 pl-4">{med.name}</td>
                          <td className="p-3.5 text-center text-slate-600">×{med.quantity}</td>
                          <td className="p-3.5 text-right text-slate-600">GH¢ {med.price.toFixed(2)}</td>
                          <td className="p-3.5 text-right font-extrabold text-slate-800 pr-4">GH¢ {(med.price * med.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      {/* Total row */}
                      <tr className="bg-slate-50/50">
                        <td colSpan={3} className="p-3.5 pl-4 font-bold text-slate-500 text-xs text-right">Order Grand Total:</td>
                        <td className="p-3.5 text-right font-black text-primary text-md pr-4">GH¢ {selectedRes.totalPrice.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fulfilment and Payment details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Fulfillment */}
                <div className="p-4 rounded-xl border border-slate-100 space-y-2.5 shadow-sm">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-primary" /> Fulfillment Logistics
                  </h4>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{selectedRes.fulfillmentMethod} Reservation</p>
                    {selectedRes.fulfillmentMethod === "Delivery" ? (
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                        Address: {selectedRes.fulfillmentAddress}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock size={12} /> Scheduled Pickup Time: {selectedRes.fulfillmentTime || "Not Specified"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div className="p-4 rounded-xl border border-slate-100 space-y-2.5 shadow-sm">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard size={14} className="text-primary" /> Payment details
                  </h4>
                  <div>
                    <p className="text-xs font-bold text-slate-700">{selectedRes.paymentPreference}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Payment must be verified at the counter or upon delivery receipt.
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Notes */}
              {selectedRes.notes && (
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={14} className="text-primary" /> Patient Remarks & Notes
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    &ldquo;{selectedRes.notes}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Action bar */}
            <div className="p-4 border-t border-slate-200 bg-slate-50/40 flex justify-end gap-3 shrink-0">
              
              {/* Action: Pending State */}
              {selectedRes.status === "Pending" && (
                <>
                  <button
                    onClick={() => updateReservationStatus(selectedRes.id, "Cancelled")}
                    className="flex items-center gap-1.5 px-4.5 py-2 border border-rose-200 text-rose-600 font-bold rounded-xl text-xs hover:bg-rose-50 transition-colors"
                  >
                    <X size={15} className="stroke-[2.5]" /> Reject Reservation
                  </button>
                  <button
                    onClick={() => updateReservationStatus(selectedRes.id, "Confirmed")}
                    className="flex items-center gap-1.5 px-4.5 py-2 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all"
                  >
                    <Check size={15} className="stroke-[2.5]" /> Confirm Booking
                  </button>
                </>
              )}

              {/* Action: Confirmed State */}
              {selectedRes.status === "Confirmed" && (
                <>
                  <button
                    onClick={() => updateReservationStatus(selectedRes.id, "Cancelled")}
                    className="flex items-center gap-1.5 px-4.5 py-2 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                  >
                    <X size={15} className="stroke-[2.5]" /> Cancel Reservation
                  </button>
                  <button
                    onClick={() => updateReservationStatus(selectedRes.id, "Picked Up")}
                    className="flex items-center gap-1.5 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 transition-all"
                  >
                    <UserCheck size={15} className="stroke-[2.5]" /> Complete Pickup / Delivery
                  </button>
                </>
              )}

              {/* Status Banner: Completed/Cancelled */}
              {(selectedRes.status === "Picked Up" || selectedRes.status === "Cancelled") && (
                <div className="w-full flex items-center justify-center p-2 text-xs font-semibold text-slate-400 italic">
                  This reservation has already been closed. No modifications are allowed.
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <ClipboardList size={40} className="stroke-[1.5]" />
            <p className="text-sm font-semibold mt-3">Select a reservation from the list queue to review details</p>
          </div>
        )}
      </div>

    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useApp, Reservation } from "@/context/AppContext";
import { SkeletonQueue, SkeletonDetail } from "@/components/Skeleton";
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
  ClipboardList,
  Package,
  Truck
} from "lucide-react";

export default function ReservationsPage() {
  const { reservations, updateReservationStatus, markCashPaid, loading } = useApp();
  const [selectedResId, setSelectedResId] = useState<string>(
    reservations.length > 0 ? reservations[0].id : ""
  );
  const [filter, setFilter] = useState<string>("All");
  const [confirmingCash, setConfirmingCash] = useState(false);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [selectedReasonOption, setSelectedReasonOption] = useState<string>("Medicine Out of Stock");
  const [customReasonText, setCustomReasonText] = useState("");
  const [submittingRejection, setSubmittingRejection] = useState(false);

  const REASON_PRESETS = [
    "Medicine Out of Stock",
    "Prescription required or invalid",
    "Incorrect dosage or quantity requested",
    "Pharmacy closing soon / unable to fulfill",
    "Delivery address outside operating radius",
    "Other reason (specify below)",
  ];

  const openRejectModal = (id: string) => {
    setRejectTargetId(id);
    setSelectedReasonOption("Medicine Out of Stock");
    setCustomReasonText("");
    setRejectModalOpen(true);
  };

  const handleConfirmRejection = async () => {
    if (!rejectTargetId) return;
    const finalReason =
      selectedReasonOption === "Other reason (specify below)"
        ? customReasonText.trim() || "Reservation cancelled by pharmacy"
        : customReasonText.trim()
        ? `${selectedReasonOption} - ${customReasonText.trim()}`
        : selectedReasonOption;

    try {
      setSubmittingRejection(true);
      await updateReservationStatus(rejectTargetId, "Cancelled", finalReason);
      setRejectModalOpen(false);
    } catch (err: any) {
      alert(err.message || "Failed to reject reservation");
    } finally {
      setSubmittingRejection(false);
    }
  };

  useEffect(() => {
    if (!selectedResId && reservations.length > 0) {
      setSelectedResId(reservations[0].id);
    }
  }, [reservations, selectedResId]);

  const selectedRes = reservations.find((r) => r.id === selectedResId);

  // Filter reservations
  const filteredRes = reservations.filter((r) => {
    if (filter === "All") return true;
    if (filter === "Pending") return r.status === "Pending";
    if (filter === "Active") return ["Confirmed", "Approved", "Preparing", "Out for Delivery", "Ready for Pickup"].includes(r.status);
    if (filter === "Done") return ["Delivered", "Collected", "Picked Up"].includes(r.status);
    if (filter === "Paid") return r.paymentStatus === "PAID";
    return r.status.toLowerCase() === filter.toLowerCase();
  });

  const getStatusStyle = (status: Reservation["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Confirmed":
      case "Approved":
        return "bg-teal-50 text-primary border-teal-100";
      case "Preparing":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "Out for Delivery":
        return "bg-cyan-50 text-cyan-700 border-cyan-100";
      case "Ready for Pickup":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Delivered":
      case "Picked Up":
      case "Collected":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      default:
        return "bg-slate-50 text-slate-700 border-slate-100";
    }
  };

  const handleMarkCash = async (id: string) => {
    if (confirmingCash) return;
    try {
      setConfirmingCash(true);
      await markCashPaid(id);
    } catch (err: any) {
      alert(err.message || "Failed to confirm cash payment");
    } finally {
      setConfirmingCash(false);
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-8 select-none relative">

      {/* Left Pane: Reservations list */}
      <div className="w-full md:w-[350px] bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden shadow-sm shrink-0">

        {/* Pane Header */}
        <div className="p-4 border-b border-slate-200/80 space-y-3">
          <h3 className="font-extrabold text-slate-800 text-md">Reservations Queue</h3>

          {/* Status filter tabs */}
          <div className="flex gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
            {["All", "Pending", "Active", "Done", "Paid"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all select-none ${filter === tab
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <SkeletonQueue />
          ) : filteredRes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              No reservations found.
            </div>
          ) : (
            filteredRes.map((res) => (
              <div
                key={res.id}
                onClick={() => setSelectedResId(res.id)}
                className={`p-4 cursor-pointer transition-all border-l-4 ${selectedResId === res.id
                    ? "bg-teal-50/20 border-primary"
                    : "border-transparent hover:bg-slate-50/50"
                  }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                    {res.reservationCode || res.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(res.status)}`}>
                      {res.status}
                    </span>
                    {res.status !== "Pending" && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${res.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                        {res.paymentStatus === "PAID" ? "PAID" : "UNPAID"}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-extrabold text-slate-800 text-sm mt-2">{res.patientName}</h4>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                  {res.fulfillmentMethod} • {res.medicines.length} Medicines
                  {res.status !== "Pending" && res.paymentMethod ? ` • ${res.paymentMethod === "PAYSTACK" ? "Paystack" : "Cash"}` : ""}
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
        {loading ? (
          <SkeletonDetail />
        ) : selectedRes ? (
          <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in duration-150">

            {/* Detail Header */}
            <div className="p-6 border-b border-slate-200/80 bg-slate-50/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Reservation Code:</span>
                  <span className="text-xs font-black text-slate-800 bg-white border border-slate-200 px-2.5 py-0.5 rounded-lg font-mono">
                    {selectedRes.reservationCode || selectedRes.id}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">{selectedRes.patientName}</h2>
                <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone size={12} /> {selectedRes.patientPhone}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${getStatusStyle(selectedRes.status)}`}>
                  {selectedRes.status}
                </span>
                {selectedRes.status !== "Pending" && (
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-sm ${selectedRes.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}`}>
                    {selectedRes.paymentStatus === "PAID" ? "Paid" : "Unpaid (Payment Pending)"}
                  </span>
                )}
              </div>
            </div>

            {/* Scrollable details body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">

              {/* Rejection / Cancellation Banner */}
              {selectedRes.status === "Cancelled" && (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 space-y-1.5 shadow-sm">
                  <h4 className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5">
                    <X size={15} className="text-rose-600 stroke-[3]" /> Rejection / Cancellation Reason
                  </h4>
                  <p className="text-xs text-rose-700 font-semibold leading-relaxed">
                    {selectedRes.rejectionReason || "No specific reason provided."}
                  </p>
                </div>
              )}

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
                    <CreditCard size={14} className="text-primary" /> Payment Details
                  </h4>
                  {selectedRes.status === "Pending" || !selectedRes.paymentMethod ? (
                    <div>
                      <p className="text-xs font-bold text-slate-700">Awaiting Customer Selection</p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        Customer will select payment mode (Pay Online with Paystack or Cash at Counter) once this reservation is confirmed.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        {selectedRes.paymentMethod === "PAYSTACK" ? "Pay Online (Paystack Subaccount)" : "Pay at Pharmacy (Cash Collection)"}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {selectedRes.paymentMethod === "PAYSTACK"
                          ? selectedRes.paymentStatus === "PAID"
                            ? "✓ Verified online payment via Paystack split transfer."
                            : "Awaiting patient payment via Paystack gateway."
                          : selectedRes.paymentStatus === "PAID"
                            ? "✓ Cash collected and marked as PAID at counter."
                            : "Collect cash payment at counter upon medicine pickup."}
                      </p>
                    </div>
                  )}
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
                    onClick={() => openRejectModal(selectedRes.id)}
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

              {/* Action: Confirmed / Approved State */}
              {(selectedRes.status === "Confirmed" || selectedRes.status === "Approved") && (
                <>
                  <button
                    onClick={() => openRejectModal(selectedRes.id)}
                    className="flex items-center gap-1.5 px-4.5 py-2 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                  >
                    <X size={15} className="stroke-[2.5]" /> Cancel Reservation
                  </button>

                  {selectedRes.fulfillmentMethod === "Delivery" ? (
                    <button
                      onClick={() => updateReservationStatus(selectedRes.id, "Preparing")}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all"
                    >
                      <Package size={15} className="stroke-[2.5]" /> Start Preparing Order
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReservationStatus(selectedRes.id, "Ready for Pickup")}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all"
                    >
                      <Check size={15} className="stroke-[2.5]" /> Mark Ready for Pickup
                    </button>
                  )}
                </>
              )}

              {/* Action: Preparing State (Delivery) */}
              {selectedRes.status === "Preparing" && (
                <>
                  <button
                    onClick={() => openRejectModal(selectedRes.id)}
                    className="flex items-center gap-1.5 px-4.5 py-2 border border-slate-200 text-slate-500 font-bold rounded-xl text-xs hover:bg-slate-50 transition-colors"
                  >
                    <X size={15} className="stroke-[2.5]" /> Cancel Reservation
                  </button>
                  <button
                    onClick={() => updateReservationStatus(selectedRes.id, "Out for Delivery")}
                    className="flex items-center gap-1.5 px-4.5 py-2 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all"
                  >
                    <Truck size={15} className="stroke-[2.5]" /> Dispatch / Out for Delivery
                  </button>
                </>
              )}

              {/* Action: Out for Delivery State (Delivery) */}
              {selectedRes.status === "Out for Delivery" && (
                <>
                  {selectedRes.paymentMethod === "CASH" && selectedRes.paymentStatus !== "PAID" ? (
                    <button
                      onClick={() => handleMarkCash(selectedRes.id)}
                      disabled={confirmingCash}
                      className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 transition-all"
                    >
                      <Check size={15} className="stroke-[2.5]" /> Collect Cash & Mark Delivered
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReservationStatus(selectedRes.id, "Delivered")}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 transition-all"
                    >
                      <UserCheck size={15} className="stroke-[2.5]" /> Mark as Delivered
                    </button>
                  )}
                </>
              )}

              {/* Action: Ready for Pickup State (Pickup) */}
              {selectedRes.status === "Ready for Pickup" && (
                <>
                  {selectedRes.paymentMethod === "CASH" && selectedRes.paymentStatus !== "PAID" ? (
                    <button
                      onClick={() => handleMarkCash(selectedRes.id)}
                      disabled={confirmingCash}
                      className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-700/20 transition-all"
                    >
                      <Check size={15} className="stroke-[2.5]" /> Collect Cash & Complete Pickup
                    </button>
                  ) : (
                    <button
                      onClick={() => updateReservationStatus(selectedRes.id, "Picked Up")}
                      className="flex items-center gap-1.5 px-4.5 py-2 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition-all"
                    >
                      <UserCheck size={15} className="stroke-[2.5]" /> Complete Pickup
                    </button>
                  )}
                </>
              )}

              {/* Status Banner: Completed/Cancelled */}
              {(["Delivered", "Collected", "Picked Up", "Cancelled"].includes(selectedRes.status)) && (
                <div className="w-full flex items-center justify-center p-2 text-xs font-semibold text-slate-400 italic">
                  {selectedRes.status === "Cancelled"
                    ? "This reservation was cancelled."
                    : "This reservation has been completed and closed."}
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

      {/* Rejection / Cancellation Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Provide Rejection Reason</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Select a reason for declining reservation #{rejectTargetId}. The patient will see this reason in their app.
                </p>
              </div>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Common Reasons
              </label>
              <div className="space-y-1.5">
                {REASON_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSelectedReasonOption(preset)}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between ${
                      selectedReasonOption === preset
                        ? "bg-teal-50 border-primary text-teal-900"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span>{preset}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedReasonOption === preset ? "border-primary bg-primary" : "border-slate-300"}`}>
                      {selectedReasonOption === preset && <Check size={10} color="white" className="stroke-[3]" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional details */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                Additional Notes / Custom Explanation
              </label>
              <textarea
                rows={3}
                value={customReasonText}
                onChange={(e) => setCustomReasonText(e.target.value)}
                placeholder="E.g. Currently out of stock, expecting new batch tomorrow at 2 PM..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-slate-50/50 resize-none font-medium"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                disabled={submittingRejection}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                {submittingRejection ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

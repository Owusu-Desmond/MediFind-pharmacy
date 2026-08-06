"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { 
  ClipboardList, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  Clock,
  ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  const { 
    reservations, 
    medicines, 
    profile, 
    updateReservationStatus 
  } = useApp();

  // Compute metrics
  const totalReservations = reservations.length;
  const pendingReservations = reservations.filter((r) => r.status === "Pending");
  const confirmedReservations = reservations.filter((r) => r.status === "Confirmed");
  const activeCount = pendingReservations.length;

  const lowStockMeds = medicines.filter((m) => m.status === "Low Stock" || m.status === "Out of Stock");

  // Mock revenue
  const totalRevenue = reservations
    .filter((r) => r.status === "Picked Up" || r.status === "Confirmed")
    .reduce((sum, r) => sum + r.totalPrice, 0);

  // SVG Chart Calculation (7 days reservations)
  // Mock data for line chart
  const weeklyData = [
    { day: "Mon", count: 8 },
    { day: "Tue", count: 12 },
    { day: "Wed", count: 15 },
    { day: "Thu", count: 10 },
    { day: "Fri", count: 20 },
    { day: "Sat", count: 18 },
    { day: "Sun", count: 9 }
  ];
  
  const chartHeight = 160;
  const chartWidth = 500;
  const padding = 30;
  
  // Find max value to scale chart
  const maxVal = Math.max(...weeklyData.map(d => d.count), 25);
  
  // Calculate SVG line points
  const points = weeklyData.map((d, index) => {
    const x = padding + (index * (chartWidth - padding * 2)) / (weeklyData.length - 1);
    const y = chartHeight - padding - (d.count * (chartHeight - padding * 2)) / maxVal;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-900 to-primary p-6 rounded-2xl text-white shadow-lg shadow-teal-900/20">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight font-headline">
            Welcome Back, {profile.pharmacistName ? profile.pharmacistName.split(",")[0] : "Doctor"}!
          </h2>
          <p className="text-teal-100/80 text-xs mt-1 font-semibold">
            {profile.name} • Licensing Council Status: Active Verification
          </p>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 text-xs font-bold flex items-center gap-2 select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          Receiving Live Patient Bookings
        </div>
      </div>

      {/* Grid Statistics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Pending */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-transform duration-150">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</h4>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{pendingReservations.length}</span>
          </div>
        </div>

        {/* Card 2: Confirmed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-transform duration-150">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-primary flex items-center justify-center">
            <ClipboardList size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed Bookings</h4>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{confirmedReservations.length}</span>
          </div>
        </div>

        {/* Card 3: Out of Stock Warnings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-transform duration-150">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Warnings</h4>
            <span className="text-2xl font-black text-slate-800 mt-1 block">{lowStockMeds.length}</span>
          </div>
        </div>

        {/* Card 4: Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:scale-[1.01] transition-transform duration-150">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Sales (Est)</h4>
            <span className="text-2xl font-black text-slate-800 mt-1 block">GH¢ {totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Reservation Chart Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-800 text-md">Prescription Reservations Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Weekly overview of patient reservations</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <TrendingUp size={14} /> +24% vs Last Week
            </span>
          </div>

          {/* Render Pure SVG Line Chart */}
          <div className="w-full overflow-x-auto pt-2">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="#f1f5f9" strokeWidth={1} />
              <line x1={padding} y1={(chartHeight) / 2} x2={chartWidth - padding} y2={(chartHeight) / 2} stroke="#f1f5f9" strokeWidth={1} />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#e2e8f0" strokeWidth={1.5} />

              {/* Area under the line */}
              <path
                d={`M ${padding},${chartHeight - padding} ${points.replace(/,/g, " ")} L ${chartWidth - padding},${chartHeight - padding} Z`}
                fill="url(#gradient)"
                opacity="0.15"
              />

              {/* Reservation Line */}
              <polyline
                fill="none"
                stroke="#005C55"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />

              {/* Interactive Dots & Text Labels */}
              {weeklyData.map((d, index) => {
                const x = padding + (index * (chartWidth - padding * 2)) / (weeklyData.length - 1);
                const y = chartHeight - padding - (d.count * (chartHeight - padding * 2)) / maxVal;
                return (
                  <g key={d.day} className="group cursor-pointer">
                    <circle
                      cx={x}
                      cy={y}
                      r="5"
                      className="fill-white stroke-primary stroke-[3] transition-all group-hover:r-7"
                    />
                    <text
                      x={x}
                      y={y - 12}
                      textAnchor="middle"
                      className="text-[10px] font-extrabold fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    >
                      {d.count}
                    </text>
                    <text
                      x={x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      className="text-[10px] font-semibold fill-slate-400"
                    >
                      {d.day}
                    </text>
                  </g>
                );
              })}

              {/* Gradients */}
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#005C55" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Stock Status Box */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-800 text-md">Inventory Alerts</h3>
            <Link href="/inventory" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              Manage Catalog
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-56">
            {lowStockMeds.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                All medicines are sufficiently in stock!
              </div>
            ) : (
              lowStockMeds.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-700">{med.name} {med.dosage}</h4>
                    <span className="text-[10px] font-semibold text-slate-400">Batch: {med.batchNumber}</span>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      med.stockQuantity === 0
                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                        : "bg-amber-50 text-amber-700 border border-amber-100"
                    }`}>
                      {med.stockQuantity === 0 ? "Out of Stock" : `${med.stockQuantity} Left`}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pending Reservations Queue */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-800 text-md">Pending Prescription Bookings</h3>
            <p className="text-xs text-slate-400 mt-0.5">Approve or reject customer medicine reservations</p>
          </div>
          <Link href="/reservations" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
            Open Queue
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          {pendingReservations.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-semibold">
              No pending reservations. Excellent work!
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-4">Patient Details</th>
                  <th className="py-3 px-4">Requested Medicines</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Delivery Mode</th>
                  <th className="py-3 px-4 text-center">Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingReservations.map((res) => (
                  <tr key={res.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors text-sm">
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-800">{res.patientName}</p>
                      <p className="text-[11px] font-semibold text-slate-400">{res.patientPhone}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        {res.medicines.map((m, i) => (
                          <div key={i} className="text-xs font-semibold text-slate-600">
                            {m.name} <span className="text-slate-400">×{m.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-800">
                      GH¢ {res.totalPrice.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        res.fulfillmentMethod === "Delivery"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {res.fulfillmentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateReservationStatus(res.id, "Confirmed")}
                          title="Confirm Reservation"
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all shadow-sm border border-emerald-100"
                        >
                          <Check size={16} className="stroke-[2.5]" />
                        </button>
                        <button
                          onClick={() => updateReservationStatus(res.id, "Cancelled")}
                          title="Reject Reservation"
                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow-sm border border-rose-100"
                        >
                          <X size={16} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

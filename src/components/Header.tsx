"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Bell, Search, Power, Check, X, ShieldAlert } from "lucide-react";

export default function Header() {
  const { profile, updateProfile, notifications, markNotificationRead } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleStatus = () => {
    updateProfile({ isActive: !profile.isActive });
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm shadow-slate-100/40">
      {/* Search Input Placeholder (Sleek UI) */}
      <div className="relative w-80">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-slate-400" />
        </span>
        <input
          type="text"
          placeholder="Search medicines, orders, patients..."
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-150"
        />
      </div>

      {/* Right Side Options */}
      <div className="flex items-center gap-6">
        {/* Toggle Pharmacy Status */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60">
          <span className="text-xs font-semibold text-slate-500">Store Status:</span>
          <button
            onClick={toggleStatus}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 select-none shadow-sm ${
              profile.isActive
                ? "bg-emerald-500 text-white shadow-emerald-200"
                : "bg-red-500 text-white shadow-red-200"
            }`}
          >
            <Power size={12} className="stroke-[3]" />
            {profile.isActive ? "Online" : "Offline"}
          </button>
        </div>

        {/* Notifications Panel */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 py-3 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold text-primary">
                      {unreadCount} unread
                    </span>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto mt-2">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 flex gap-3 hover:bg-slate-50 transition-colors relative ${
                          !n.read ? "bg-teal-50/30" : ""
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs text-slate-800">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {n.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        </div>
                        {!n.read && (
                          <button
                            onClick={() => markNotificationRead(n.id)}
                            title="Mark as read"
                            className="w-5 h-5 rounded-full hover:bg-slate-200 flex items-center justify-center text-primary shrink-0 self-center"
                          >
                            <Check size={14} className="stroke-[2.5]" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Division border */}
        <div className="w-px h-8 bg-slate-200" />

        {/* Pharmacist Avatar Panel */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h3 className="text-sm font-bold text-slate-800 truncate max-w-40">
              {profile.pharmacistName || "Pharmacist"}
            </h3>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
              Dispenser
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-primary flex items-center justify-center font-bold text-md border border-teal-200 shadow-inner">
            {profile.pharmacistName ? profile.pharmacistName.split(" ").pop()?.charAt(0) : "P"}
          </div>
        </div>
      </div>
    </header>
  );
}

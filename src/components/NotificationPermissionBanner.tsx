"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing, CheckCircle2 } from "lucide-react";
import { browserNotifications } from "@/utils/browserNotifications";

export default function NotificationPermissionBanner() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [tested, setTested] = useState(false);

  useEffect(() => {
    setPermission(browserNotifications.getPermissionStatus());
  }, []);

  if (permission === "granted") {
    return null; // Already granted, no need to show prompt
  }

  if (permission === "denied") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-amber-600 shrink-0" />
          <span>Desktop notifications are currently blocked in your browser settings. Enable them to receive instant new order alerts.</span>
        </div>
      </div>
    );
  }

  const handleRequest = async () => {
    const res = await browserNotifications.requestPermission();
    setPermission(res);
    if (res === "granted") {
      browserNotifications.showNotification("MediFind Pharmacy Alerts Active", {
        body: "You will now receive instant desktop notifications for incoming reservations and prescription requests!",
        sound: true,
        soundType: "success",
      });
      setTested(true);
    }
  };

  return (
    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm shadow-teal-900/20">
          <BellRing size={20} className="animate-pulse" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wide">
            Never Miss a Prescription or Patient Order
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Turn on instant browser notifications & audio chimes for new reservations.
          </p>
        </div>
      </div>
      <button
        onClick={handleRequest}
        className="px-4 py-2 bg-primary hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-700/20 transition-all shrink-0 flex items-center gap-1.5"
      >
        <Bell size={14} /> Enable Desktop Alerts
      </button>
    </div>
  );
}

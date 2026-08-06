"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  LayoutDashboard, 
  Pill, 
  ClipboardList, 
  User, 
  LogOut,
  Activity
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { logout, profile } = useApp();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inventory Management", href: "/inventory", icon: Pill },
    { name: "Reservations", href: "/reservations", icon: ClipboardList },
    { name: "Pharmacy Profile", href: "/profile", icon: User },
  ];

  return (
    <aside className="w-64 bg-primary text-white flex flex-col min-h-screen border-r border-teal-800 shadow-xl select-none">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 gap-3 border-b border-teal-800/60 bg-teal-950/20">
        <div className="w-10 h-10 rounded-xl bg-teal-400 flex items-center justify-center text-teal-950 font-bold shadow-md shadow-teal-500/20">
          <Activity size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight font-headline">MediFind</h1>
          <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">Pharmacy Hub</span>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? "bg-teal-700/80 text-white shadow-md shadow-teal-950/30"
                  : "text-teal-100 hover:bg-teal-800/40 hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-teal-400 rounded-r-lg" />
              )}
              <item.icon 
                size={20} 
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-teal-300" : "text-teal-200"
                }`} 
              />
              <span className="font-semibold text-[15px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-teal-800/60 bg-teal-950/20">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center text-teal-200 font-bold text-sm uppercase">
            {profile.name ? profile.name.charAt(0) : "P"}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-teal-500 uppercase tracking-wide truncate">
              {profile.pharmacistName || "Pharmacist"}
            </h4>
            <p className="text-[11px] text-teal-300 truncate">{profile.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-teal-100 hover:bg-red-950/30 hover:text-red-300 hover:border-red-900/40 border border-transparent transition-all duration-200"
        >
          <LogOut size={18} className="text-teal-200 group-hover:text-red-300" />
          <span className="font-semibold text-[15px]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

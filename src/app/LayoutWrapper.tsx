"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Activity } from "lucide-react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const authRoutes = ["/", "/register", "/forgot-password"];
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!user && !isAuthRoute) {
      // Redirect to login if trying to access dashboard pages without auth
      router.replace("/");
    } else if (user && isAuthRoute) {
      // Redirect to dashboard if trying to access auth pages while logged in
      router.replace("/dashboard");
    }
  }, [user, pathname, router, mounted, isAuthRoute]);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Activity className="h-10 w-10 text-primary animate-pulse" />
          <p className="text-sm font-semibold text-slate-500">Loading MediFind...</p>
        </div>
      </div>
    );
  }

  // If not logged in and requesting dashboard page, show loading state while redirecting
  if (!user && !isAuthRoute) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Auth pages (Login, Register, Forgot Password) don't have sidebars
  if (isAuthRoute) {
    return <>{children}</>;
  }

  // Dashboard layout
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
          {children}
        </main>
      </div>
    </div>
  );
}

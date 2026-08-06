"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Activity, ShieldCheck, Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("central@ghanapharmacy.gov.gh");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      setLoading(false);
      router.push("/dashboard");
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to log in. Please check your credentials.");
    }
  };


  return (
    <div className="min-h-screen w-screen bg-slate-50 flex items-stretch overflow-hidden select-none">
      {/* Left Column: Form */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative z-10 border-r border-slate-100 shadow-xl">
        {/* Mobile Header Banner */}
        <div className="absolute top-8 left-8 sm:left-16 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Activity size={22} className="stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800 font-headline">MediFind</span>
        </div>

        {/* Login Box */}
        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
              Pharmacy Portal
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              Access your inventory and manage prescription reservations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <ShieldCheck className="text-red-500 shrink-0 mt-0.5" size={18} />
                <span className="text-xs font-semibold text-red-700">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Pharmacy Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="pharmacy@medifind.com"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-150 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-150 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/45"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-slate-500">
                Remember my login credentials
              </label>
            </div>

            {/* Sign in Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-teal-800 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-teal-700/20 hover:shadow-teal-700/35 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed select-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Registration Footer Link */}
          <div className="mt-8 text-center text-xs">
            <span className="text-slate-500 font-semibold">New pharmacy branch? </span>
            <Link href="/register" className="font-extrabold text-primary hover:underline">
              Register Branch Now
            </Link>
          </div>
        </div>
      </div>

      {/* Right Column: Hero Banner */}
      <div className="hidden lg:flex lg:w-[55%] bg-primary relative items-center justify-center px-12 py-24 select-none">
        {/* Subtle Decorative Overlay Elements */}
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-950 via-teal-900 to-primary/80 opacity-95 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-600/25 via-transparent to-transparent z-0" />
        
        {/* Grid dots backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] z-0" />

        {/* Content Box */}
        <div className="relative z-10 w-full max-w-lg text-white flex flex-col gap-8">
          <div>
            <span className="px-3.5 py-1.5 rounded-full bg-teal-400/20 border border-teal-400/30 text-teal-300 font-bold text-xs uppercase tracking-wider">
              Health Platform
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight mt-4 font-headline">
              Connecting Pharmacies & Patients Across Ghana
            </h1>
            <p className="text-teal-100/80 text-sm mt-3 leading-relaxed">
              MediFind Pharmacy Hub allows verified pharmaceutical dispensaries to catalog medicines, monitor stock levels in real-time, and process prescription pickups, serving thousands of citizens daily.
            </p>
          </div>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-teal-900/30 border border-teal-700/30 backdrop-blur-sm">
              <span className="text-3xl font-extrabold text-teal-300">100k+</span>
              <p className="text-xs font-semibold text-teal-100/60 mt-1">Prescriptions Fulfilled</p>
            </div>
            <div className="p-4 rounded-2xl bg-teal-900/30 border border-teal-700/30 backdrop-blur-sm">
              <span className="text-3xl font-extrabold text-teal-300">450+</span>
              <p className="text-xs font-semibold text-teal-100/60 mt-1">Partner Pharmacies</p>
            </div>
          </div>

          {/* Bottom Security Footer */}
          <div className="flex items-center gap-2 text-xs text-teal-200/60">
            <ShieldCheck size={16} className="text-teal-400" />
            <span>Regulated by the Pharmacy Council of Ghana</span>
          </div>
        </div>
      </div>
    </div>
  );
}

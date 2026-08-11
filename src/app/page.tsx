"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { 
  Activity, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  BadgeCheck, 
  Headphones, 
  Building2,
  CheckCircle2
} from "lucide-react";

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("central@ghanapharmacy.gov.gh");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all required fields.");
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
    <main className="min-h-screen bg-[#f8f9ff] text-slate-800 flex items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
      {/* Atmospheric Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[60%] bg-teal-100/60 rounded-full blur-[120px] opacity-50" />
        <div className="absolute -bottom-[10%] -left-[5%] w-[35%] h-[50%] bg-teal-200/50 rounded-full blur-[100px] opacity-40" />
      </div>

      {/* Main Login Card Shell */}
      <div className="w-full max-w-[1100px] grid md:grid-cols-2 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden relative z-10">
        
        {/* Left Side: Branding / Visual Area */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-[#005c55] text-white relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg height="100%" width="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="z-10">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-10 h-10 bg-teal-200/30 rounded flex items-center justify-center text-teal-100 border border-teal-200/30">
                <Activity size={24} className="stroke-[2.5]" />
              </div>
              <h1 className="text-xl font-black tracking-tight font-headline">MediFind Ghana</h1>
            </div>

            {/* Headline & Description */}
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-white leading-tight font-headline">
                Digital Healthcare for Every Community.
              </h2>
              <p className="text-sm text-teal-100/90 leading-relaxed max-w-sm">
                Streamline your inventory, manage prescriptions, and reach more patients with Ghana&apos;s most reliable pharmacy management suite.
              </p>
            </div>
          </div>

          {/* Testimonial / Social Proof Card */}
          <div className="mt-auto z-10 pt-8">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[#005c55] bg-teal-100 text-teal-900 flex items-center justify-center font-bold text-[10px]">
                    EM
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-[#005c55] bg-teal-200 text-teal-900 flex items-center justify-center font-bold text-[10px]">
                    +2k
                  </div>
                </div>
                <span className="text-xs font-bold tracking-wide text-teal-50">Trusted by 2,000+ Pharmacies</span>
              </div>
              <p className="text-xs italic text-teal-100/80 leading-normal">
                &ldquo;MediFind has revolutionized how we track stock across our Greater Accra branches.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-14 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h3 className="text-2xl font-black text-slate-900 mb-1.5 font-headline">Welcome Back</h3>
            <p className="text-xs font-semibold text-slate-500">Please enter your credentials to access the pharmacy dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-rose-500 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-rose-800">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="email">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@pharmacy.com"
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500" htmlFor="password">
                  PASSWORD
                </label>
                <Link href="/forgot-password" className="text-xs font-bold text-[#005c55] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-sm font-semibold text-slate-800 transition-all placeholder:text-slate-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-[#005c55] focus:ring-[#005c55]"
              />
              <label htmlFor="remember" className="ml-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Action */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded shadow-sm transition-all duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-75"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 py-1">
                <hr className="flex-grow border-slate-200" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">OR</span>
                <hr className="flex-grow border-slate-200" />
              </div>

              <button
                type="button"
                onClick={() => setEmail("central@ghanapharmacy.gov.gh")}
                className="w-full py-2.5 px-4 bg-white border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-xs"
              >
                <BadgeCheck size={16} className="text-[#005c55]" />
                Sign in with Demo Pharmacy Account
              </button>
            </div>
          </form>

          {/* Footer Register Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs font-semibold text-slate-500">
              New to MediFind Ghana?{" "}
              <Link href="/register" className="text-[#005c55] font-extrabold hover:underline ml-1">
                Register your pharmacy
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Support Floating Button */}
      <button 
        title="Support Center"
        onClick={() => alert("MediFind Pharmacy Support Line: +233 30 223 4455")}
        className="fixed bottom-6 right-6 w-12 h-12 bg-[#005c55] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-20"
      >
        <Headphones size={22} />
      </button>
    </main>
  );
}


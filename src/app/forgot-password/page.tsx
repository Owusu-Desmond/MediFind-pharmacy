"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { 
  Activity, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("central@ghanapharmacy.gov.gh");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetToken, setResetToken] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Step 1: Submit email to request password reset code
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email) {
      setError("Please enter your official pharmacy email address.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.forgotPassword(email);
      setResetToken(res.reset_token || "");
      setStep(2);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to process password reset request.");
    }
  };

  // Step 2: Submit new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters long.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(email, newPassword, resetToken);
      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Failed to reset password.");
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-50 flex items-stretch overflow-hidden select-none">
      
      {/* Left Column: Interactive Form */}
      <div className="w-full lg:w-[45%] bg-white flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative z-10 border-r border-slate-100 shadow-xl">
        
        {/* Header Branding */}
        <div className="absolute top-8 left-8 sm:left-16 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Activity size={22} className="stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-800 font-headline">MediFind Ghana</span>
        </div>

        {/* Content Box */}
        <div className="w-full max-w-md mx-auto">
          
          {success ? (
            /* Success View */
            <div className="text-center space-y-6 py-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} className="stroke-[2.5]" />
              </div>
              
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                  Password Reset Completed!
                </h2>
                <p className="text-xs font-semibold text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Your pharmacy account password has been updated successfully. You can now sign in with your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/"
                  className="w-full bg-primary hover:bg-teal-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-teal-700/20 hover:shadow-teal-700/35 transition-all duration-200 flex items-center justify-center gap-2 text-sm select-none"
                >
                  Return to Sign In
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            /* Form Views */
            <div>
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-primary font-extrabold text-xs mb-3 border border-teal-100">
                  <KeyRound size={14} /> Password Recovery
                </div>
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
                  {step === 1 ? "Reset Staff Password" : "Set New Password"}
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  {step === 1 
                    ? "Enter your registered pharmacy email address to authorize password reset." 
                    : `Enter your new secure password for ${email}.`}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 animate-in fade-in duration-150">
                  <ShieldCheck className="text-rose-500 shrink-0 mt-0.5" size={18} />
                  <span className="text-xs font-bold text-rose-700 leading-relaxed">{error}</span>
                </div>
              )}

              {step === 1 ? (
                /* STEP 1: Enter Email */
                <form onSubmit={handleRequestReset} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Registered Pharmacy Email Address
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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary hover:bg-teal-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-700/20 hover:shadow-teal-700/35 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed select-none"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Verify Account & Continue
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                      <ArrowLeft size={14} /> Back to Sign In
                    </Link>
                  </div>
                </form>
              ) : (
                /* STEP 2: Enter New Password */
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                        <Lock size={18} className="text-slate-400" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-11 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-150 bg-slate-50/50"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                        <Lock size={18} className="text-slate-400" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all duration-150 bg-slate-50/50"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-700/20 hover:shadow-emerald-700/35 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-75 disabled:cursor-not-allowed select-none"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Update Password Now
                        <CheckCircle2 size={16} />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      <ArrowLeft size={14} /> Back to Change Email
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>
      </div>

      {/* Right Column: Hero Graphic Banner */}
      <div className="hidden lg:flex lg:w-[55%] bg-primary relative items-center justify-center px-12 py-24 select-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-teal-950 via-teal-900 to-primary/80 opacity-95 z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-600/25 via-transparent to-transparent z-0" />
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] z-0" />

        <div className="relative z-10 w-full max-w-lg text-white flex flex-col gap-8">
          <div>
            <span className="px-3.5 py-1.5 rounded-full bg-teal-400/20 border border-teal-400/30 text-teal-300 font-bold text-xs uppercase tracking-wider">
              Account Security
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight mt-4 font-headline">
              Secure Access Control for Licensed Pharmacists
            </h1>
            <p className="text-teal-100/80 text-sm mt-3 leading-relaxed">
              MediFind enforces encrypted credential management so verified pharmacy dispensaries and clinical staff can safely access real-time patient prescription bookings.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-teal-900/40 border border-teal-700/40 backdrop-blur-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-300 flex items-center gap-2">
              <ShieldCheck size={16} /> Need Support Assistance?
            </h4>
            <p className="text-xs text-teal-100/80 leading-relaxed font-semibold">
              If your email is no longer active or your branch license code has expired, please contact the Pharmacy Council Admin desk at <span className="text-white underline">support@medifind.gov.gh</span>.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import { 
  Activity, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Store, 
  BadgeCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Upload, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Edit2, 
  HelpCircle,
  Clock,
  Navigation
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { updateProfile } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Upload States
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [licenseUrl, setLicenseUrl] = useState("");
  const [pharmacistCertUrl, setPharmacistCertUrl] = useState("");
  const [licenseFileName, setLicenseFileName] = useState("");
  const [certFileName, setCertFileName] = useState("");
  
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // Opening Hours Builder State
  const [scheduleDays, setScheduleDays] = useState("Mon - Sat");
  const [openTime, setOpenTime] = useState("08:00 AM");
  const [closeTime, setCloseTime] = useState("09:00 PM");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    gpsAddress: "",
    openingHours: "Mon - Sat: 08:00 AM - 09:00 PM",
    licenseNumber: "",
    pharmacistName: "",
    pharmacistId: "",
  });

  const handleScheduleChange = (days: string, open: string, close: string) => {
    setScheduleDays(days);
    setOpenTime(open);
    setCloseTime(close);
    if (days === "24/7") {
      setFormData((prev) => ({ ...prev, openingHours: "24/7" }));
    } else {
      setFormData((prev) => ({ ...prev, openingHours: `${days}: ${open} - ${close}` }));
    }
  };

  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = "Pharmacy name is required.";
      if (!formData.licenseNumber) newErrors.licenseNumber = "License number is required.";
      if (!formData.email) newErrors.email = "Contact email is required.";
      if (!formData.phone) newErrors.phone = "Phone number is required.";
      if (!formData.location) newErrors.location = "Physical business address is required.";
      if (!formData.gpsAddress) newErrors.gpsAddress = "Ghana Post GPS address is required.";
      if (!formData.openingHours) newErrors.openingHours = "Operating hours are required.";
    } else if (step === 2) {
      if (!licenseUrl) newErrors.licenseUrl = "Pharmacy Operating License document is required.";
    } else if (step === 3) {
      if (!declarationAgreed) newErrors.declaration = "You must agree to the declaration before submitting.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleLicenseFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLicense(true);
      const res = await api.uploadCertificate(file);
      setLicenseUrl(res.url);
      setLicenseFileName(file.name);
    } catch (err: any) {
      alert(err.message || "Failed to upload operating license document.");
    } finally {
      setUploadingLicense(false);
    }
  };

  const handleCertFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingCert(true);
      const res = await api.uploadCertificate(file);
      setPharmacistCertUrl(res.url);
      setCertFileName(file.name);
    } catch (err: any) {
      alert(err.message || "Failed to upload pharmacist certification document.");
    } finally {
      setUploadingCert(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);

    try {
      await api.registerPharmacy({
        name: formData.name,
        location: formData.location,
        license_number: formData.licenseNumber,
        pharmacist_name: formData.pharmacistName || "Dr. Pharmacist",
        pharmacist_id: formData.pharmacistId || "PH-CERT-880",
        phone: formData.phone,
        email: formData.email,
        delivery_offered: true,
        opening_hours: formData.openingHours,
        gps_address: formData.gpsAddress,
        certificate_url: licenseUrl || pharmacistCertUrl,
      });

      updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        licenseNumber: formData.licenseNumber,
        openingHours: formData.openingHours,
        gpsCoordinates: formData.gpsAddress,
        pharmacistName: formData.pharmacistName || "Dr. Pharmacist",
      });

      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      alert(err.message || "Registration failed. Please check your details and try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9ff] text-slate-800 flex items-center justify-center p-4 md:p-8 relative overflow-hidden select-none">
      {/* Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-teal-100/50 opacity-40 blur-[120px] rounded-full" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[40%] bg-teal-200/40 opacity-30 blur-[100px] rounded-full" />
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-[1000px] grid grid-cols-1 lg:grid-cols-12 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden relative z-10">
        
        {/* Left Side: Stepper & Context */}
        <div className="lg:col-span-4 bg-[#005c55] text-white p-8 md:p-10 flex flex-col justify-between border-r border-teal-800/40 relative overflow-hidden">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-teal-200/30 rounded flex items-center justify-center text-teal-100 border border-teal-200/30">
                <Activity size={24} className="stroke-[2.5]" />
              </div>
              <h1 className="text-xl font-black tracking-tight font-headline">MediFind Ghana</h1>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-200/80 mb-1">REGISTRATION PROGRESS</p>
                <h2 className="text-2xl font-extrabold font-headline">
                  {step === 1 ? "Business Details" : step === 2 ? "Document Upload" : "Final Review"}
                </h2>
                <p className="text-xs text-teal-100/70 font-semibold mt-1">Step {step} of 3</p>
              </div>

              {/* Progress Stepper List */}
              <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-teal-700/60">
                {/* Step 1 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center ${
                    step > 1 ? "bg-teal-300 text-teal-950" : step === 1 ? "bg-white ring-4 ring-teal-400/30" : "bg-teal-800"
                  }`}>
                    {step > 1 ? <Check size={10} className="stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#005c55]" />}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold tracking-wider uppercase ${step === 1 ? "text-white" : "text-teal-200/90"}`}>
                      ENTITY INFORMATION
                    </h3>
                    <p className="text-[11px] text-teal-100/60">Pharmacy details & ownership</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center ${
                    step > 2 ? "bg-teal-300 text-teal-950" : step === 2 ? "bg-white ring-4 ring-teal-400/30" : "bg-teal-800"
                  }`}>
                    {step > 2 ? <Check size={10} className="stroke-[3]" /> : <span className={`w-1.5 h-1.5 rounded-full ${step === 2 ? "bg-[#005c55]" : "bg-teal-700"}`} />}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold tracking-wider uppercase ${step === 2 ? "text-white" : "text-teal-200/90"}`}>
                      COMPLIANCE DOCUMENTS
                    </h3>
                    <p className="text-[11px] text-teal-100/60">Verify clinical authority</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center ${
                    step === 3 ? "bg-white ring-4 ring-teal-400/30" : "bg-teal-800"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${step === 3 ? "bg-[#005c55]" : "bg-teal-700"}`} />
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold tracking-wider uppercase ${step === 3 ? "text-white" : "text-teal-200/90"}`}>
                      FINAL REVIEW
                    </h3>
                    <p className="text-[11px] text-teal-100/60">Signature and submission</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted Network Footer Box */}
          <div className="hidden lg:block mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/15">
            <div className="flex items-center gap-2 mb-1.5 text-teal-100">
              <ShieldCheck size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">TRUSTED NETWORK</span>
            </div>
            <p className="text-[11px] text-teal-100/70 leading-relaxed">
              All documents are encrypted and reviewed within 24 business hours by our compliance team.
            </p>
          </div>
        </div>

        {/* Right Side: Form & Step Content */}
        <div className="lg:col-span-8 p-8 md:p-12 bg-white flex flex-col justify-center">
          
          {/* SUCCESS SCREEN */}
          {success ? (
            <div className="text-center py-10 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-teal-50 text-[#005c55] rounded-full flex items-center justify-center mx-auto border border-teal-100 shadow-lg shadow-teal-900/10">
                <CheckCircle2 size={44} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 font-headline">Application Submitted!</h2>
                <p className="text-sm font-semibold text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your pharmacy application for <span className="text-slate-800 font-bold">{formData.name}</span> has been received and is currently under compliance review.
                </p>
              </div>
              <div className="p-4 bg-teal-50/60 border border-teal-100 rounded-lg text-left max-w-md mx-auto space-y-2">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                  <ShieldCheck size={16} className="text-[#005c55]" />
                  <span>Next Steps (24-48 Hours)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our team will verify your operating license <span className="font-bold">({formData.licenseNumber})</span> against the Pharmacy Council registry. You will receive email updates at <span className="font-bold">{formData.email}</span>.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded shadow-sm text-sm transition-all"
                >
                  Go to Pharmacy Dashboard
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Progress Indicator */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#005c55]">Step {step} of 3</span>
                  <span className="text-xs font-bold text-slate-400">
                    {step === 1 ? "Business Details" : step === 2 ? "Document Upload" : "Final Review"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#005c55] transition-all duration-300 ease-out" 
                    style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
                  />
                </div>
              </div>

              {/* STEP 1: BUSINESS DETAILS */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 font-headline mb-1">Register your Pharmacy</h2>
                    <p className="text-xs font-semibold text-slate-500">Provide your official business information to get started with MediFind Ghana.</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                    {/* Pharmacy Name */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Pharmacy Name <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Store size={18} />
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Ridge City Pharmacy"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-sm font-semibold transition-all"
                        />
                      </div>
                      {errors.name && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.name}</p>}
                    </div>

                    {/* License Number & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          License Number <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <BadgeCheck size={18} />
                          </span>
                          <input
                            type="text"
                            required
                            value={formData.licenseNumber}
                            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                            placeholder="PH-GH-2026-991"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-sm font-semibold transition-all"
                          />
                        </div>
                        {errors.licenseNumber && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.licenseNumber}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Contact Email <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Mail size={18} />
                          </span>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="admin@pharmacy.com"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-sm font-semibold transition-all"
                          />
                        </div>
                        {errors.email && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    {/* Phone Number & Ghana Post GPS Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Phone Number <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Phone size={18} />
                          </span>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+233 30 223 4455"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-sm font-semibold transition-all"
                          />
                        </div>
                        {errors.phone && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.phone}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Ghana Post Digital GPS Address <span className="text-rose-500 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Navigation size={18} />
                          </span>
                          <input
                            type="text"
                            required
                            value={formData.gpsAddress}
                            onChange={(e) => setFormData({ ...formData, gpsAddress: e.target.value })}
                            placeholder="e.g. GA-183-9021"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-sm font-semibold transition-all"
                          />
                        </div>
                        {errors.gpsAddress && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.gpsAddress}</p>}
                      </div>
                    </div>

                    {/* Physical Business Address */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Physical Business Address <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-slate-400">
                          <MapPin size={18} />
                        </span>
                        <textarea
                          rows={2}
                          required
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="e.g. Ring Road Central, Near Ridge Hospital, Accra, Greater Accra"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-sm font-semibold transition-all resize-none"
                        />
                      </div>
                      {errors.location && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.location}</p>}
                    </div>

                    {/* Operating / Opening Hours Builder */}
                    <div className="space-y-2 pt-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Operating / Opening Hours <span className="text-rose-500 font-bold">*</span>
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Days</span>
                          <select
                            value={scheduleDays}
                            onChange={(e) => handleScheduleChange(e.target.value, openTime, closeTime)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
                          >
                            <option value="Mon - Sat">Mon - Sat</option>
                            <option value="Mon - Sun">Mon - Sun (Everyday)</option>
                            <option value="Mon - Fri">Mon - Fri (Weekdays)</option>
                            <option value="24/7">24/7 (Open Always)</option>
                          </select>
                        </div>

                        {scheduleDays !== "24/7" && (
                          <>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Opening Time</span>
                              <select
                                value={openTime}
                                onChange={(e) => handleScheduleChange(scheduleDays, e.target.value, closeTime)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
                              >
                                <option value="06:00 AM">06:00 AM</option>
                                <option value="07:00 AM">07:00 AM</option>
                                <option value="07:30 AM">07:30 AM</option>
                                <option value="08:00 AM">08:00 AM</option>
                                <option value="08:30 AM">08:30 AM</option>
                                <option value="09:00 AM">09:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Closing Time</span>
                              <select
                                value={closeTime}
                                onChange={(e) => handleScheduleChange(scheduleDays, openTime, e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
                              >
                                <option value="05:00 PM">05:00 PM</option>
                                <option value="06:00 PM">06:00 PM</option>
                                <option value="07:00 PM">07:00 PM</option>
                                <option value="08:00 PM">08:00 PM</option>
                                <option value="08:30 PM">08:30 PM</option>
                                <option value="09:00 PM">09:00 PM</option>
                                <option value="10:00 PM">10:00 PM</option>
                                <option value="11:00 PM">11:00 PM</option>
                                <option value="12:00 AM">12:00 AM (Midnight)</option>
                              </select>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="relative mt-2">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <Clock size={18} />
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.openingHours}
                          onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                          placeholder="e.g. Mon - Sat: 08:00 AM - 09:00 PM"
                          className="w-full pl-11 pr-4 py-2.5 bg-teal-50/50 border border-teal-200 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] text-xs font-bold text-[#005c55]"
                        />
                      </div>
                      {errors.openingHours && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.openingHours}</p>}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 space-y-3">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        Next Step
                        <ArrowRight size={16} />
                      </button>

                      <div className="text-center pt-2">
                        <Link href="/" className="text-xs font-bold text-slate-500 hover:text-[#005c55]">
                          Already registered? <span className="text-[#005c55] underline">Back to Login</span>
                        </Link>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 2: COMPLIANCE DOCUMENTS */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 font-headline mb-1">Upload Verification Documents</h2>
                    <p className="text-xs font-semibold text-slate-500">Please provide scans or digital copies of your legal credentials to proceed.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Upload Box 1: Pharmacy Operating License */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <span>PHARMACY OPERATING LICENSE</span>
                        <span className="text-rose-500 font-bold">REQUIRED</span>
                      </div>
                      <input
                        ref={licenseInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleLicenseFileUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => licenseInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-[#005c55] rounded-lg p-6 bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                      >
                        {licenseUrl ? (
                          <div className="flex items-center gap-3 bg-white p-3.5 rounded border border-teal-200 shadow-sm w-full">
                            <div className="w-10 h-10 rounded bg-teal-50 text-[#005c55] flex items-center justify-center shrink-0">
                              <FileText size={20} />
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                              <p className="font-bold text-xs text-slate-800 truncate">{licenseFileName || "Operating_License.pdf"}</p>
                              <p className="text-[10px] text-teal-700 font-bold mt-0.5">✓ Uploaded Successfully</p>
                            </div>
                            <span className="text-xs font-bold text-[#005c55] underline">Change</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-white text-[#005c55] border border-slate-200 flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
                              <Upload size={22} />
                            </div>
                            <p className="font-bold text-xs text-slate-800 mb-0.5">
                              {uploadingLicense ? "Uploading License..." : "Click to upload Pharmacy Operating License"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">Supports PDF, PNG, JPG (max 10MB)</p>
                          </>
                        )}
                      </div>
                      {errors.licenseUrl && <p className="text-[10px] text-rose-600 font-bold">{errors.licenseUrl}</p>}
                    </div>

                    {/* Upload Box 2: Pharmacist-in-Charge Cert */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <span>PHARMACIST-IN-CHARGE CERTIFICATION</span>
                        <span className="text-slate-400 font-semibold normal-case">(OPTIONAL)</span>
                      </div>
                      <input
                        ref={certInputRef}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleCertFileUpload}
                        className="hidden"
                      />
                      <div
                        onClick={() => certInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-[#005c55] rounded-lg p-6 bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                      >
                        {pharmacistCertUrl ? (
                          <div className="flex items-center gap-3 bg-white p-3.5 rounded border border-teal-200 shadow-sm w-full">
                            <div className="w-10 h-10 rounded bg-teal-50 text-[#005c55] flex items-center justify-center shrink-0">
                              <BadgeCheck size={20} />
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                              <p className="font-bold text-xs text-slate-800 truncate">{certFileName || "Pharmacist_Certification.pdf"}</p>
                              <p className="text-[10px] text-teal-700 font-bold mt-0.5">✓ Uploaded Successfully</p>
                            </div>
                            <span className="text-xs font-bold text-[#005c55] underline">Change</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 rounded-full bg-white text-[#005c55] border border-slate-200 flex items-center justify-center shadow-sm mb-3 group-hover:scale-105 transition-transform">
                              <BadgeCheck size={22} />
                            </div>
                            <p className="font-bold text-xs text-slate-800 mb-0.5">
                              {uploadingCert ? "Uploading Certification..." : "Click to upload Pharmacist-in-Charge Cert"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">Supports PDF, PNG, JPG (max 10MB)</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Pharmacist Name Input */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Pharmacist-in-Charge Name <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.pharmacistName}
                          onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
                          placeholder="e.g. Dr. Emmanuel Mensah"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-xs font-semibold"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Pharmacist License ID <span className="text-slate-400 font-normal normal-case">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={formData.pharmacistId}
                          onChange={(e) => setFormData({ ...formData, pharmacistId: e.target.value })}
                          placeholder="e.g. RPH-GH-882"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-[#005c55] focus:border-[#005c55] text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Information Note */}
                    <div className="flex items-start gap-3 p-3.5 bg-teal-50/70 border border-teal-100 rounded-lg text-teal-900 text-xs">
                      <HelpCircle size={18} className="text-[#005c55] shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-[11px] font-medium text-slate-600">
                        Ensure all uploaded certificates are current and legally valid in Ghana. Documents will be verified against the Pharmacy Council database.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-2.5 border border-slate-300 text-slate-700 font-bold rounded text-xs hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      PREVIOUS
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-2.5 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded text-xs shadow-sm flex items-center gap-1.5"
                    >
                      NEXT STEP
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: FINAL REVIEW & SUBMISSION */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 font-headline mb-1">Review & Submit Your Application</h2>
                    <p className="text-xs font-semibold text-slate-500">Please confirm that all details below are accurate before final submission.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Section 1 Card: Pharmacy Information */}
                    <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Store size={18} className="text-[#005c55]" />
                          <h3 className="font-extrabold text-slate-800 text-sm">Pharmacy Information</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex items-center gap-1 text-xs font-bold text-[#005c55] hover:underline"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Pharmacy Name</p>
                          <p className="font-extrabold text-slate-800 mt-0.5">{formData.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">License Number</p>
                          <p className="font-bold text-slate-800 mt-0.5">{formData.licenseNumber}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Email</p>
                          <p className="font-semibold text-slate-700 mt-0.5">{formData.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Phone Number</p>
                          <p className="font-semibold text-slate-700 mt-0.5">{formData.phone}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Ghana Post GPS Address</p>
                          <p className="font-extrabold text-[#005c55] mt-0.5">{formData.gpsAddress}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Opening Hours</p>
                          <p className="font-semibold text-slate-700 mt-0.5">{formData.openingHours}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Physical Business Address</p>
                          <p className="font-semibold text-slate-700 mt-0.5">{formData.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2 Card: Document Verification */}
                    <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-[#005c55]" />
                          <h3 className="font-extrabold text-slate-800 text-sm">Document Verification</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="flex items-center gap-1 text-xs font-bold text-[#005c55] hover:underline"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100 text-xs">
                          <div className="flex items-center gap-2.5">
                            <FileText size={16} className="text-[#005c55]" />
                            <span className="font-bold text-slate-800">Pharmacy Operating License</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-extrabold border border-teal-100">
                            ✓ READY
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100 text-xs">
                          <div className="flex items-center gap-2.5">
                            <BadgeCheck size={16} className="text-[#005c55]" />
                            <span className="font-bold text-slate-800">Pharmacist Certification</span>
                          </div>
                          {pharmacistCertUrl ? (
                            <span className="px-2.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-extrabold border border-teal-100">
                              ✓ READY
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-200/70 text-slate-500 text-[10px] font-semibold">
                              OPTIONAL (NOT PROVIDED)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Declaration Checkbox */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-start gap-3">
                        <input
                          id="declaration"
                          type="checkbox"
                          checked={declarationAgreed}
                          onChange={(e) => setDeclarationAgreed(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-[#005c55] focus:ring-[#005c55]"
                        />
                        <label htmlFor="declaration" className="text-xs text-slate-600 leading-relaxed font-semibold cursor-pointer select-none">
                          I certify that all information provided is accurate and truthful. I agree to the MediFind Terms of Service and Privacy Policy.
                        </label>
                      </div>
                      {errors.declaration && <p className="text-[10px] text-rose-600 font-bold pl-7">{errors.declaration}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-2.5 border border-slate-300 text-slate-700 font-bold rounded text-xs hover:bg-slate-50 flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      PREVIOUS
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-8 py-3 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-75"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Submit Application
                          <CheckCircle2 size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

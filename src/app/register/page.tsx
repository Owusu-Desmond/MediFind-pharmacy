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
  FileBadge2, 
  ShieldCheck, 
  Upload, 
  Eye 
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { updateProfile } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Store Profile
    name: "",
    email: "",
    phone: "",
    location: "",
    openingHours: "08:00 AM - 09:00 PM",
    gpsCoordinates: "",
    // Step 2: Credentials
    licenseNumber: "",
    pharmacistName: "",
    pharmacistId: "",
    certificateUploaded: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});


  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = "Pharmacy name is required.";
      if (!formData.email) newErrors.email = "Contact email is required.";
      if (!formData.phone) newErrors.phone = "Phone number is required.";
      if (!formData.location) newErrors.location = "Business address is required.";
    } else if (step === 2) {
      if (!formData.licenseNumber) newErrors.licenseNumber = "License number is required.";
      if (!formData.pharmacistName) newErrors.pharmacistName = "Pharmacist-in-charge name is required.";
      if (!formData.pharmacistId) newErrors.pharmacistId = "Pharmacist license number is required.";
      if (!formData.certificateUploaded) newErrors.certificateUploaded = "Please upload a copy of your pharmacy certificate.";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.registerPharmacy({
        name: formData.name,
        location: formData.location,
        license_number: formData.licenseNumber,
        pharmacist_name: formData.pharmacistName,
        pharmacist_id: formData.pharmacistId,
        phone: formData.phone,
        email: formData.email,
        delivery_offered: true,
        opening_hours: formData.openingHours,
        certificate_url: certificateUrl,
      });

      updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        licenseNumber: formData.licenseNumber,
        openingHours: formData.openingHours,
        pharmacistName: formData.pharmacistName,
        gpsCoordinates: formData.gpsCoordinates || "5.6037° N, 0.1870° W",
        isActive: false,
      });

      setLoading(false);
      setSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setErrors({ submit: err.message || "Failed to submit registration application" });
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const res = await api.uploadCertificate(file);
      setCertificateUrl(res.url);
      setFormData((prev) => ({ ...prev, certificateUploaded: true }));
    } catch (err: any) {
      setErrors((prev) => ({ ...prev, certificateUploaded: err.message || "Failed to upload file" }));
    } finally {
      setUploadLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-8 select-none">
      {/* Header Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
          <Activity size={22} className="stroke-[2.5]" />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-slate-800 font-headline">MediFind Ghana</span>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
        {/* Step Indicator Top Bar */}
        <div className="bg-slate-50/50 border-b border-slate-200/60 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border transition-all ${
              step >= 1 ? "bg-primary border-primary text-white" : "border-slate-300 text-slate-400"
            }`}>
              {step > 1 ? <Check size={14} className="stroke-[3]" /> : "1"}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              step === 1 ? "text-primary" : "text-slate-400"
            }`}>Store Profile</span>
          </div>

          <div className="w-8 h-px bg-slate-300" />

          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border transition-all ${
              step >= 2 
                ? "bg-primary border-primary text-white" 
                : "border-slate-300 text-slate-400"
            }`}>
              {step > 2 ? <Check size={14} className="stroke-[3]" /> : "2"}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              step === 2 ? "text-primary" : "text-slate-400"
            }`}>Credentials</span>
          </div>

          <div className="w-8 h-px bg-slate-300" />

          <div className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold border transition-all ${
              step === 3 ? "bg-primary border-primary text-white" : "border-slate-300 text-slate-400"
            }`}>
              3
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${
              step === 3 ? "text-primary" : "text-slate-400"
            }`}>Verification</span>
          </div>
        </div>

        {/* Form Body */}
        {success ? (
          /* Submission Success State */
          <div className="p-8 text-center flex flex-col items-center gap-6 py-12 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-inner">
              <ShieldCheck size={32} className="stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-2">
                Registration Submitted Successfully
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                Your pharmacy application has been recorded. The Ministry of Health & Pharmacy Council verification agents will review your credentials. You can access the portal once verified.
              </p>
            </div>
            <Link
              href="/"
              className="bg-primary hover:bg-teal-800 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-teal-700/20 transition-all duration-200 text-sm"
            >
              Return to Login Screen
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            {/* STEP 1: STORE PROFILE */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in-50 duration-150">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                    <Store className="text-primary" size={20} />
                    Pharmacy Branch Details
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Basic information about your physical store branch.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Pharmacy Store Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ghana National Pharmacy (East Legon)"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50 ${
                        errors.name ? "border-red-300 focus:border-red-500" : "border-slate-200"
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Official Contact Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. eastlegon@ghanapharmacy.com"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50 ${
                        errors.email ? "border-red-300 focus:border-red-500" : "border-slate-200"
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Official Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +233 24 123 4567"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50 ${
                        errors.phone ? "border-red-300 focus:border-red-500" : "border-slate-200"
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.phone}</p>}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Physical Location / Address
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. 14 Boundary Road, East Legon, Accra"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50 ${
                        errors.location ? "border-red-300 focus:border-red-500" : "border-slate-200"
                      }`}
                    />
                    {errors.location && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.location}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      GPS Address / Coordinates
                    </label>
                    <input
                      type="text"
                      value={formData.gpsCoordinates}
                      onChange={(e) => setFormData({ ...formData, gpsCoordinates: e.target.value })}
                      placeholder="e.g. GA-183-9932 or 5.6037, -0.1870"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Daily Opening Hours
                    </label>
                    <input
                      type="text"
                      value={formData.openingHours}
                      onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                      placeholder="e.g. 08:00 AM - 09:00 PM"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CREDENTIALS & LICENSING */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in-50 duration-150">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                    <FileBadge2 className="text-primary" size={20} />
                    Licensing & Clinical Staff
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Upload official licensing and provide clinical supervision details.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Pharmacy Council License Number
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      placeholder="e.g. PHA-GH-2026-9040"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50 ${
                        errors.licenseNumber ? "border-red-300 focus:border-red-500" : "border-slate-200"
                      }`}
                    />
                    {errors.licenseNumber && (
                      <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.licenseNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Supervising Pharmacist Name
                    </label>
                    <input
                      type="text"
                      value={formData.pharmacistName}
                      onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
                      placeholder="e.g. Dr. Jane Osei, PharmD"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50 ${
                        errors.pharmacistName ? "border-red-300 focus:border-red-500" : "border-slate-200"
                      }`}
                    />
                    {errors.pharmacistName && (
                      <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.pharmacistName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Pharmacist Registration ID
                    </label>
                    <input
                      type="text"
                      value={formData.pharmacistId}
                      onChange={(e) => setFormData({ ...formData, pharmacistId: e.target.value })}
                      placeholder="e.g. RPH-GH-8830"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/50 ${
                        errors.pharmacistId ? "border-red-300 focus:border-red-500" : "border-slate-200"
                      }`}
                    />
                    {errors.pharmacistId && (
                      <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.pharmacistId}</p>
                    )}
                  </div>

                  {/* Document Upload Component */}
                  <div className="col-span-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Upload Pharmacy Council Registration Certificate (PDF/Image)
                    </label>
                    <div className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                      formData.certificateUploaded
                        ? "border-emerald-300 bg-emerald-50/20"
                        : errors.certificateUploaded
                        ? "border-red-300 bg-red-50/20"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                    onClick={handleFileUpload}
                    >
                      {uploadLoading ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : formData.certificateUploaded ? (

                        <>
                          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <Check size={20} className="stroke-[2.5]" />
                          </div>
                          <span className="text-xs font-bold text-emerald-800">pharmacy_council_certificate.pdf uploaded</span>
                          <span className="text-[10px] text-emerald-600 font-semibold">Click to replace document</span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Upload size={20} />
                          </div>
                          <span className="text-xs font-bold text-slate-700">Click to upload file or drag & drop</span>
                          <span className="text-[10px] text-slate-400 font-semibold">Supports PDF, PNG, JPG (Max 5MB)</span>
                        </>
                      )}
                    </div>
                    {errors.certificateUploaded && (
                      <p className="text-red-500 text-[10px] mt-1.5 font-semibold">{errors.certificateUploaded}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: FINAL REVIEW */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in-50 duration-150">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="text-primary" size={20} />
                    Final Review of Application
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5">
                    Verify all business information is correct before submitting to the registrar.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Pharmacy Details Card */}
                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pharmacy Details</h4>
                    <div>
                      <p className="text-xs font-bold text-slate-700">{formData.name}</p>
                      <p className="text-[11px] text-slate-500">{formData.location}</p>
                      <p className="text-[11px] text-slate-500">GPS: {formData.gpsCoordinates || "Not Provided"}</p>
                      <p className="text-[11px] text-slate-500">Hours: {formData.openingHours}</p>
                    </div>
                  </div>

                  {/* Licensing Details Card */}
                  <div className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Licensing & Credentials</h4>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Council Lic: {formData.licenseNumber}</p>
                      <p className="text-[11px] text-slate-500">Pharmacist: {formData.pharmacistName}</p>
                      <p className="text-[11px] text-slate-500">Reg ID: {formData.pharmacistId}</p>
                      <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-1">
                        <Check size={12} className="stroke-[2.5]" /> Council Certificate Verified
                      </p>
                    </div>
                  </div>

                  {/* Declaration Alert */}
                  <div className="col-span-2 p-4 bg-teal-50 border border-teal-100 rounded-xl text-xs text-teal-900 leading-relaxed">
                    By submitting this registration request, you declare under penalty of perjury that all details provided are correct and that the pharmacy is regulated under the Health Professions Regulatory Bodies Act, 2013 (Act 857).
                  </div>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="pt-4 border-t border-slate-100 flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              ) : (
                <Link
                  href="/"
                  className="flex items-center gap-2 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all"
                >
                  <ArrowLeft size={16} />
                  Back to Sign In
                </Link>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-primary hover:bg-teal-800 text-white font-bold py-2 px-5 rounded-xl shadow-md shadow-teal-700/25 transition-all text-sm"
                >
                  Next Step
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-emerald-700/25 transition-all text-sm disabled:opacity-75"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Submit Application
                      <Check size={16} className="stroke-[2.5]" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

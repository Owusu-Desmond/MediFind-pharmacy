"use client";

import React, { useState, useRef, useEffect } from "react";
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
  Navigation,
  Crosshair,
  Truck,
  UserCheck,
  CreditCard,
  Building2,
  Wallet,
  Save,
  RotateCcw
} from "lucide-react";

const DRAFT_STORAGE_KEY = "medifind_pharmacy_registration_draft";

export default function RegisterPage() {
  const router = useRouter();
  const { updateProfile } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  
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
  const [declarationAgreed, setDeclarationAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    gpsAddress: "",
    lat: "",
    lng: "",
    openingHours: "Mon - Sat: 08:00 AM - 09:00 PM",
    deliveryOffered: true,
    licenseNumber: "",
    pharmacistName: "",
    pharmacistId: "",
    paymentAccountType: "mobile_money",
    mobileMoneyProvider: "MTN",
    mobileMoneyNumber: "",
    accountName: "",
    bankName: "",
    accountNumber: "",
  });

  // Restore draft on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.formData) {
            setFormData((prev) => ({ ...prev, ...parsed.formData }));
          }
          if (parsed.step && typeof parsed.step === "number" && parsed.step >= 1 && parsed.step <= 4) {
            setStep(parsed.step);
          }
          if (parsed.scheduleDays) setScheduleDays(parsed.scheduleDays);
          if (parsed.openTime) setOpenTime(parsed.openTime);
          if (parsed.closeTime) setCloseTime(parsed.closeTime);
          if (parsed.licenseUrl) setLicenseUrl(parsed.licenseUrl);
          if (parsed.pharmacistCertUrl) setPharmacistCertUrl(parsed.pharmacistCertUrl);
          if (parsed.licenseFileName) setLicenseFileName(parsed.licenseFileName);
          if (parsed.certFileName) setCertFileName(parsed.certFileName);
          if (parsed.declarationAgreed !== undefined) setDeclarationAgreed(parsed.declarationAgreed);
          setHasDraft(true);
        }
      }
    } catch (err) {
      console.error("Failed to restore registration draft:", err);
    } finally {
      setIsDraftRestored(true);
    }
  }, []);

  // Persist draft on state changes
  useEffect(() => {
    if (!isDraftRestored || success) return;
    try {
      if (typeof window !== "undefined") {
        const draft = {
          formData,
          step,
          scheduleDays,
          openTime,
          closeTime,
          licenseUrl,
          pharmacistCertUrl,
          licenseFileName,
          certFileName,
          declarationAgreed,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setHasDraft(true);
      }
    } catch (err) {
      console.error("Failed to save registration draft:", err);
    }
  }, [
    formData,
    step,
    scheduleDays,
    openTime,
    closeTime,
    licenseUrl,
    pharmacistCertUrl,
    licenseFileName,
    certFileName,
    declarationAgreed,
    isDraftRestored,
    success,
  ]);

  const handleClearDraft = () => {
    if (confirm("Are you sure you want to clear your saved draft and reset all fields?")) {
      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch (e) {}
      setFormData({
        name: "",
        email: "",
        phone: "",
        location: "",
        gpsAddress: "",
        lat: "",
        lng: "",
        openingHours: "Mon - Sat: 08:00 AM - 09:00 PM",
        deliveryOffered: true,
        licenseNumber: "",
        pharmacistName: "",
        pharmacistId: "",
        paymentAccountType: "mobile_money",
        mobileMoneyProvider: "MTN",
        mobileMoneyNumber: "",
        accountName: "",
        bankName: "",
        accountNumber: "",
      });
      setScheduleDays("Mon - Sat");
      setOpenTime("08:00 AM");
      setCloseTime("09:00 PM");
      setLicenseUrl("");
      setPharmacistCertUrl("");
      setLicenseFileName("");
      setCertFileName("");
      setDeclarationAgreed(false);
      setStep(1);
      setHasDraft(false);
    }
  };

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

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(6);
        const longitude = position.coords.longitude.toFixed(6);
        setFormData((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
        }));
        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
        alert(`Could not detect location: ${error.message}. You can enter coordinates manually.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Pharmacy name is required.";
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required.";
      if (!formData.email.trim()) newErrors.email = "Contact email is required.";
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required.";
      if (!formData.location.trim()) newErrors.location = "Physical business address is required.";
      if (!formData.gpsAddress.trim()) newErrors.gpsAddress = "Ghana Post GPS address is required.";
      if (!formData.openingHours.trim()) newErrors.openingHours = "Operating hours are required.";
      if (!formData.lat || !formData.lng) {
        newErrors.coordinates = "Coordinates are required for patient map navigation & distance calculations in the app.";
      }
    } else if (step === 2) {
      if (!formData.pharmacistName.trim()) newErrors.pharmacistName = "Superintendent Pharmacist name is required.";
      if (!formData.pharmacistId.trim()) newErrors.pharmacistId = "Pharmacist Council PIN is required.";
      if (formData.paymentAccountType === "mobile_money") {
        if (!formData.mobileMoneyNumber.trim()) newErrors.mobileMoneyNumber = "Mobile Money number is required.";
        if (!formData.accountName.trim()) newErrors.accountName = "Account name is required.";
      } else {
        if (!formData.bankName.trim()) newErrors.bankName = "Bank name is required.";
        if (!formData.accountNumber.trim()) newErrors.accountNumber = "Account number is required.";
        if (!formData.accountName.trim()) newErrors.accountName = "Account name is required.";
      }
    } else if (step === 3) {
      if (!licenseUrl) newErrors.licenseUrl = "Pharmacy Operating License document is required.";
    } else if (step === 4) {
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
        name: formData.name.trim(),
        location: formData.location.trim(),
        license_number: formData.licenseNumber.trim(),
        pharmacist_name: formData.pharmacistName.trim(),
        pharmacist_id: formData.pharmacistId.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        delivery_offered: formData.deliveryOffered,
        opening_hours: formData.openingHours.trim(),
        gps_address: formData.gpsAddress.trim(),
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        certificate_url: licenseUrl || pharmacistCertUrl,
        payment_account_type: formData.paymentAccountType,
        mobile_money_provider: formData.paymentAccountType === "mobile_money" ? formData.mobileMoneyProvider : null,
        mobile_money_number: formData.paymentAccountType === "mobile_money" ? formData.mobileMoneyNumber.trim() : null,
        bank_name: formData.paymentAccountType === "bank" ? formData.bankName.trim() : null,
        account_name: formData.accountName.trim(),
        account_number: formData.paymentAccountType === "bank" ? formData.accountNumber.trim() : formData.mobileMoneyNumber.trim(),
      });

      updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        location: formData.location.trim(),
        licenseNumber: formData.licenseNumber.trim(),
        openingHours: formData.openingHours.trim(),
        deliveryOffered: formData.deliveryOffered,
        gpsCoordinates: `${formData.lat || ""}, ${formData.lng || ""}`,
        pharmacistName: formData.pharmacistName.trim() || "Dr. Pharmacist",
        paymentAccountType: formData.paymentAccountType,
        mobileMoneyProvider: formData.mobileMoneyProvider,
        mobileMoneyNumber: formData.mobileMoneyNumber,
        accountName: formData.accountName,
      });

      try {
        if (typeof window !== "undefined") {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } catch (e) {}

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
      <div className="w-full max-w-[1050px] grid grid-cols-1 lg:grid-cols-12 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative z-10 my-6">
        
        {/* Left Side: Stepper & Context */}
        <div className="lg:col-span-4 bg-[#005c55] text-white p-8 md:p-10 flex flex-col justify-between border-r border-teal-800/40 relative overflow-hidden">
          <div>
            {/* Brand Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-teal-200/30 rounded-xl flex items-center justify-center text-teal-100 border border-teal-200/30 shadow-inner">
                <Activity size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight font-headline leading-none">MediFind</h1>
                <span className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Pharmacy Portal</span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-teal-200/80 mb-1">REGISTRATION PROGRESS</p>
                <h2 className="text-2xl font-extrabold font-headline">
                  {step === 1 ? "Location & Details" : step === 2 ? "Pharmacist & Payout" : step === 3 ? "Certificates" : "Final Review"}
                </h2>
                <p className="text-xs text-teal-100/70 font-semibold mt-1">Step {step} of 4</p>
              </div>

              {/* Progress Stepper List */}
              <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[2px] before:bg-teal-700/60">
                {/* Step 1 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center ${
                    step > 1 ? "bg-teal-300 text-teal-950" : step === 1 ? "bg-white ring-4 ring-teal-400/30" : "bg-teal-800"
                  }`}>
                    {step > 1 ? <Check size={10} className="stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-[#005c55]" />}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold tracking-wider uppercase ${step === 1 ? "text-white" : "text-teal-200/90"}`}>
                      1. LOCATION & STORE
                    </h3>
                    <p className="text-[11px] text-teal-100/60">Address, GPS & hours</p>
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
                      2. PHARMACIST & PAYOUT
                    </h3>
                    <p className="text-[11px] text-teal-100/60">Superintendent & MoMo</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center ${
                    step > 3 ? "bg-teal-300 text-teal-950" : step === 3 ? "bg-white ring-4 ring-teal-400/30" : "bg-teal-800"
                  }`}>
                    {step > 3 ? <Check size={10} className="stroke-[3]" /> : <span className={`w-1.5 h-1.5 rounded-full ${step === 3 ? "bg-[#005c55]" : "bg-teal-700"}`} />}
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold tracking-wider uppercase ${step === 3 ? "text-white" : "text-teal-200/90"}`}>
                      3. COMPLIANCE DOCS
                    </h3>
                    <p className="text-[11px] text-teal-100/60">Operating license scan</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative flex items-start gap-3">
                  <div className={`absolute -left-6 w-4 h-4 rounded-full flex items-center justify-center ${
                    step === 4 ? "bg-white ring-4 ring-teal-400/30" : "bg-teal-800"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${step === 4 ? "bg-[#005c55]" : "bg-teal-700"}`} />
                  </div>
                  <div>
                    <h3 className={`text-xs font-bold tracking-wider uppercase ${step === 4 ? "text-white" : "text-teal-200/90"}`}>
                      4. REVIEW & SUBMIT
                    </h3>
                    <p className="text-[11px] text-teal-100/60">Verify all information</p>
                  </div>
                </div>
              </div>

              {/* Draft auto-saved indicator */}
              {hasDraft && (
                <div className="pt-4 border-t border-teal-700/50 flex items-center justify-between">
                  <span className="text-[11px] text-teal-200 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={13} className="text-teal-300" /> Progress auto-saved
                  </span>
                  <button
                    type="button"
                    onClick={handleClearDraft}
                    className="text-[10px] text-teal-200/70 hover:text-rose-200 underline font-semibold transition-colors"
                  >
                    Reset form
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Trusted Network Footer Box */}
          <div className="hidden lg:block mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/15">
            <div className="flex items-center gap-2 mb-1.5 text-teal-100">
              <ShieldCheck size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">APP-READY DATA</span>
            </div>
            <p className="text-[11px] text-teal-100/70 leading-relaxed">
              Provides real-time GPS distance calculation, instant directions, and verified reservation stock for patients on the MediFind mobile app.
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
              <div className="p-5 bg-teal-50/60 border border-teal-100 rounded-xl text-left max-w-md mx-auto space-y-2">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                  <ShieldCheck size={16} className="text-[#005c55]" />
                  <span>Next Steps (24-48 Hours)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our compliance team will verify your operating license <span className="font-bold">({formData.licenseNumber})</span> against the Pharmacy Council registry. You will receive activation updates at <span className="font-bold">{formData.email}</span>.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded-xl shadow-sm text-sm transition-all"
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
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#005c55]">Step {step} of 4</span>
                  <span className="text-xs font-bold text-slate-400">
                    {step === 1 ? "Location & Store Details" : step === 2 ? "Pharmacist & Payout" : step === 3 ? "Document Upload" : "Final Review"}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#005c55] transition-all duration-300 ease-out" 
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
              </div>

              {/* STEP 1: BUSINESS & GEOLOCATION DETAILS */}
              {step === 1 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 font-headline mb-1">Pharmacy Location & Store</h2>
                    <p className="text-xs font-semibold text-slate-500">Provide official store details and exact coordinates so patients can find and navigate to you.</p>
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
                          placeholder="e.g. Ridge City Pharmacy - East Legon"
                          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005c55]/20 focus:border-[#005c55] text-sm font-semibold transition-all"
                        />
                      </div>
                      {errors.name && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.name}</p>}
                    </div>

                    {/* License Number & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Pharmacy License No. <span className="text-rose-500 font-bold">*</span>
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
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005c55]/20 focus:border-[#005c55] text-sm font-semibold transition-all"
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
                            placeholder="eastlegon@pharmacy.com"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005c55]/20 focus:border-[#005c55] text-sm font-semibold transition-all"
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
                            placeholder="+233 24 123 4567"
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005c55]/20 focus:border-[#005c55] text-sm font-semibold transition-all"
                          />
                        </div>
                        {errors.phone && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.phone}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Ghana Post Digital GPS <span className="text-rose-500 font-bold">*</span>
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
                            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005c55]/20 focus:border-[#005c55] text-sm font-semibold transition-all"
                          />
                        </div>
                        {errors.gpsAddress && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.gpsAddress}</p>}
                      </div>
                    </div>

                    {/* Physical Business Address */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Physical Street Address / Landmark <span className="text-rose-500 font-bold">*</span>
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
                          placeholder="e.g. Lagos Avenue, Opposite Shell Fuel Station, East Legon, Accra"
                          className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005c55]/20 focus:border-[#005c55] text-sm font-semibold transition-all resize-none"
                        />
                      </div>
                      {errors.location && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.location}</p>}
                    </div>

                    {/* GPS Coordinates (Latitude & Longitude) for Patient Map Navigation */}
                    <div className="p-4 bg-teal-50/70 border border-teal-200/80 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                            <Crosshair size={14} className="text-[#005c55]" />
                            Exact GPS Coordinates (Required for App Distance & Maps)
                          </p>
                          <p className="text-[11px] text-slate-500">Allows mobile app patients to calculate driving distance and get turn-by-turn directions.</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={detectingLocation}
                          className="px-3 py-1.5 bg-[#005c55] hover:bg-teal-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
                        >
                          {detectingLocation ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Crosshair size={13} />
                          )}
                          Auto-Detect Coordinates
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Latitude (e.g. 5.650523) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.lat}
                            onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                            placeholder="5.650523"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Longitude (e.g. -0.183421) <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.lng}
                            onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                            placeholder="-0.183421"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55] focus:outline-none"
                          />
                        </div>
                      </div>
                      {errors.coordinates && <p className="text-[10px] text-rose-600 font-bold">{errors.coordinates}</p>}
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
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
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
                                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
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
                                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
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
                          className="w-full pl-11 pr-4 py-2.5 bg-teal-50/50 border border-teal-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#005c55] text-xs font-bold text-[#005c55]"
                        />
                      </div>
                      {errors.openingHours && <p className="text-[10px] text-rose-600 font-bold mt-1">{errors.openingHours}</p>}
                    </div>

                    {/* Delivery Offered Toggle */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#005c55] flex items-center justify-center">
                          <Truck size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Offer Home Delivery for Reservations</p>
                          <p className="text-[11px] text-slate-500">Allow patients in the app to request home delivery for their medicine orders.</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.deliveryOffered}
                        onChange={(e) => setFormData({ ...formData, deliveryOffered: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-[#005c55] focus:ring-[#005c55] cursor-pointer"
                      />
                    </div>

                    {/* Actions */}
                    <div className="pt-4 space-y-3">
                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        Next: Pharmacist & Payout Details
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

              {/* STEP 2: PHARMACIST & PAYOUT SETUP */}
              {step === 2 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 font-headline mb-1">Superintendent & Payout Setup</h2>
                    <p className="text-xs font-semibold text-slate-500">Enter licensed pharmacist credentials and settlement account for online patient payments.</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} className="space-y-4">
                    {/* Pharmacist Details Card */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 pb-1 border-b border-slate-200">
                        <UserCheck size={16} className="text-[#005c55]" />
                        <span>Superintendent Pharmacist Credentials</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Pharmacist Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.pharmacistName}
                            onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
                            placeholder="e.g. Dr. Ama Mensah, R.Ph"
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55] focus:outline-none"
                          />
                          {errors.pharmacistName && <p className="text-[10px] text-rose-600 font-bold">{errors.pharmacistName}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Pharmacy Council PIN / ID <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.pharmacistId}
                            onChange={(e) => setFormData({ ...formData, pharmacistId: e.target.value })}
                            placeholder="e.g. PC-PIN-8809"
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55] focus:outline-none"
                          />
                          {errors.pharmacistId && <p className="text-[10px] text-rose-600 font-bold">{errors.pharmacistId}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Payment / MoMo Settlement Card */}
                    <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl space-y-3">
                      <div className="flex items-center justify-between pb-1 border-b border-teal-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
                          <Wallet size={16} className="text-[#005c55]" />
                          <span>Payout Settlement Account (Mobile Money / Bank)</span>
                        </div>
                      </div>

                      {/* Account Type Selection */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentAccountType: "mobile_money" })}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                            formData.paymentAccountType === "mobile_money"
                              ? "bg-[#005c55] text-white border-[#005c55] shadow-xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Phone size={14} />
                          Mobile Money (MoMo)
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, paymentAccountType: "bank" })}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                            formData.paymentAccountType === "bank"
                              ? "bg-[#005c55] text-white border-[#005c55] shadow-xs"
                              : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <Building2 size={14} />
                          Bank Account
                        </button>
                      </div>

                      {formData.paymentAccountType === "mobile_money" ? (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Network Provider <span className="text-rose-500">*</span>
                              </label>
                              <select
                                value={formData.mobileMoneyProvider}
                                onChange={(e) => setFormData({ ...formData, mobileMoneyProvider: e.target.value })}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
                              >
                                <option value="MTN">MTN Mobile Money</option>
                                <option value="VODAFONE">Telecel (Vodafone) Cash</option>
                                <option value="AIRTELTIGO">AT Money (AirtelTigo)</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                MoMo Phone Number <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="tel"
                                required
                                value={formData.mobileMoneyNumber}
                                onChange={(e) => setFormData({ ...formData, mobileMoneyNumber: e.target.value })}
                                placeholder="024 123 4567"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
                              />
                              {errors.mobileMoneyNumber && <p className="text-[10px] text-rose-600 font-bold">{errors.mobileMoneyNumber}</p>}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Registered Account Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.accountName}
                              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                              placeholder="e.g. Ridge City Pharmacy Ltd"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
                            />
                            {errors.accountName && <p className="text-[10px] text-rose-600 font-bold">{errors.accountName}</p>}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Bank Name <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                placeholder="e.g. GCB Bank / Ecobank"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
                              />
                              {errors.bankName && <p className="text-[10px] text-rose-600 font-bold">{errors.bankName}</p>}
                            </div>

                            <div className="space-y-1">
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Account Number <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                placeholder="102384910283"
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
                              />
                              {errors.accountNumber && <p className="text-[10px] text-rose-600 font-bold">{errors.accountNumber}</p>}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Account Holder Name <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.accountName}
                              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                              placeholder="e.g. Ridge City Pharmacy Ltd"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-[#005c55]"
                            />
                            {errors.accountName && <p className="text-[10px] text-rose-600 font-bold">{errors.accountName}</p>}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                      >
                        <ArrowLeft size={14} />
                        PREVIOUS
                      </button>
                      <button
                        type="submit"
                        className="px-8 py-3 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        NEXT: COMPLIANCE DOCUMENTS
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* STEP 3: COMPLIANCE DOCUMENTS */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 font-headline mb-1">Upload Compliance Documents</h2>
                    <p className="text-xs font-semibold text-slate-500">Upload official documentation required by Pharmacy Council Ghana for verification.</p>
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
                        className="border-2 border-dashed border-slate-300 hover:border-[#005c55] rounded-xl p-6 bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                      >
                        {licenseUrl ? (
                          <div className="flex items-center gap-3 bg-white p-3.5 rounded-lg border border-teal-200 shadow-sm w-full">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#005c55] flex items-center justify-center shrink-0">
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
                        <span className="text-slate-400 font-semibold normal-case">(OPTIONAL / RECOMMENDED)</span>
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
                        className="border-2 border-dashed border-slate-300 hover:border-[#005c55] rounded-xl p-6 bg-slate-50/50 hover:bg-teal-50/30 transition-all cursor-pointer flex flex-col items-center justify-center text-center group"
                      >
                        {pharmacistCertUrl ? (
                          <div className="flex items-center gap-3 bg-white p-3.5 rounded-lg border border-teal-200 shadow-sm w-full">
                            <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#005c55] flex items-center justify-center shrink-0">
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
                              {uploadingCert ? "Uploading Certification..." : "Click to upload Pharmacist PIN Certificate"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">Supports PDF, PNG, JPG (max 10MB)</p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Information Note */}
                    <div className="flex items-start gap-3 p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl text-teal-900 text-xs">
                      <HelpCircle size={18} className="text-[#005c55] shrink-0 mt-0.5" />
                      <p className="leading-relaxed text-[11px] font-medium text-slate-600">
                        Ensure all uploaded certificates are current and legally valid in Ghana. Documents will be verified against the Pharmacy Council database before store activation.
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                    >
                      <ArrowLeft size={14} />
                      PREVIOUS
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-8 py-3 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      NEXT: REVIEW & CONFIRM
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: FINAL REVIEW & SUBMISSION */}
              {step === 4 && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 font-headline mb-1">Review & Confirm Application</h2>
                    <p className="text-xs font-semibold text-slate-500">Please confirm all information is complete before submitting to the compliance team.</p>
                  </div>

                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                    {/* Section 1 Card: Store & Location */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Store size={16} className="text-[#005c55]" />
                          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Store & Location</h3>
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

                      <div className="grid grid-cols-2 gap-3 text-xs">
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
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Ghana Post GPS</p>
                          <p className="font-extrabold text-[#005c55] mt-0.5">{formData.gpsAddress}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Map Coordinates</p>
                          <p className="font-mono text-slate-700 mt-0.5">{formData.lat || "N/A"}, {formData.lng || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Opening Hours</p>
                          <p className="font-semibold text-slate-700 mt-0.5">{formData.openingHours}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Delivery Offered</p>
                          <p className="font-semibold text-teal-700 mt-0.5">{formData.deliveryOffered ? "Yes (Active)" : "Pickup Only"}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Street Address</p>
                          <p className="font-semibold text-slate-700 mt-0.5">{formData.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 2 Card: Pharmacist & Settlement */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <UserCheck size={16} className="text-[#005c55]" />
                          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Pharmacist & Settlement</h3>
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

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Superintendent Pharmacist</p>
                          <p className="font-bold text-slate-800 mt-0.5">{formData.pharmacistName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Pharmacist PIN</p>
                          <p className="font-bold text-slate-800 mt-0.5">{formData.pharmacistId}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Payout Type</p>
                          <p className="font-semibold text-slate-700 mt-0.5">
                            {formData.paymentAccountType === "mobile_money" ? `MoMo (${formData.mobileMoneyProvider})` : "Bank Account"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Account / Phone No.</p>
                          <p className="font-mono font-bold text-slate-800 mt-0.5">
                            {formData.paymentAccountType === "mobile_money" ? formData.mobileMoneyNumber : `${formData.bankName} - ${formData.accountNumber}`}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Account Name</p>
                          <p className="font-semibold text-slate-700 mt-0.5">{formData.accountName}</p>
                        </div>
                      </div>
                    </div>

                    {/* Section 3 Card: Document Verification */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#005c55]" />
                          <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">Document Verification</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="flex items-center gap-1 text-xs font-bold text-[#005c55] hover:underline"
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                          <div className="flex items-center gap-2.5">
                            <FileText size={16} className="text-[#005c55]" />
                            <span className="font-bold text-slate-800">Pharmacy Operating License</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-extrabold border border-teal-100">
                            ✓ READY
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                          <div className="flex items-center gap-2.5">
                            <BadgeCheck size={16} className="text-[#005c55]" />
                            <span className="font-bold text-slate-800">Pharmacist PIN Certification</span>
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
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-start gap-3">
                        <input
                          id="declaration"
                          type="checkbox"
                          checked={declarationAgreed}
                          onChange={(e) => setDeclarationAgreed(e.target.checked)}
                          className="mt-1 w-4 h-4 rounded border-slate-300 text-[#005c55] focus:ring-[#005c55] cursor-pointer"
                        />
                        <label htmlFor="declaration" className="text-xs text-slate-600 leading-relaxed font-semibold cursor-pointer select-none">
                          I certify that all information provided is accurate and truthful. I agree to the MediFind Terms of Service, Privacy Policy, and Pharmacy Council Ghana compliance standards.
                        </label>
                      </div>
                      {errors.declaration && <p className="text-[10px] text-rose-600 font-bold pl-7">{errors.declaration}</p>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-3 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 flex items-center gap-1.5 transition-all"
                    >
                      <ArrowLeft size={14} />
                      PREVIOUS
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="px-8 py-3 bg-[#005c55] hover:bg-teal-800 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-75"
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

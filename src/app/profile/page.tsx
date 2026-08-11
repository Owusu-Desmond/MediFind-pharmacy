"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { api } from "@/services/api";
import { 
  User, 
  MapPin, 
  Clock, 
  Truck, 
  FileText,
  Save,
  CheckCircle,
  Building,
  KeyRound,
  UserPlus,
  Users,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Loader2,
  ShieldCheck
} from "lucide-react";

interface StaffMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export default function ProfilePage() {
  const { profile, updateProfile } = useApp();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    openingHours: profile.openingHours,
    deliveryOffered: profile.deliveryOffered,
    gpsCoordinates: profile.gpsCoordinates || "",
    pharmacistName: profile.pharmacistName || "",
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Staff State
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: "", email: "", password: "", phone: "" });
  const [addingStaff, setAddingStaff] = useState(false);
  const [staffError, setStaffError] = useState("");

  const pharmacyId = profile.id || 1;

  // Fetch Staff List on Mount
  useEffect(() => {
    fetchStaff();
  }, [pharmacyId]);

  const fetchStaff = async () => {
    setLoadingStaff(true);
    try {
      const data = await api.getPharmacyStaff(pharmacyId);
      setStaffList(data);
    } catch (err) {
      console.error("Failed to fetch pharmacy staff:", err);
    } finally {
      setLoadingStaff(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);

    try {
      await updateProfile(formData);
      setSaveSuccess(true);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      alert(err.message || "Failed to update profile settings.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 4) {
      setPwError("New password must be at least 4 characters long.");
      return;
    }

    setChangingPw(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err: any) {
      setPwError(err.message || "Failed to change password. Please check your current password.");
    } finally {
      setChangingPw(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffError("");
    setAddingStaff(true);

    try {
      await api.addPharmacyStaff(pharmacyId, newStaff);
      setShowAddStaffModal(false);
      setNewStaff({ name: "", email: "", password: "", phone: "" });
      await fetchStaff();
    } catch (err: any) {
      setStaffError(err.message || "Failed to add staff member.");
    } finally {
      setAddingStaff(false);
    }
  };

  const handleDeleteStaff = async (staffId: number, staffName: string) => {
    if (!confirm(`Are you sure you want to remove ${staffName} from pharmacy staff?`)) return;
    try {
      await api.deletePharmacyStaff(pharmacyId, staffId);
      await fetchStaff();
    } catch (err: any) {
      alert(err.message || "Failed to delete staff member.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200 select-none pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight font-headline">Pharmacy Settings & Staff</h2>
        <p className="text-xs text-slate-400 mt-0.5">Manage your branch details, operating hours, staff accounts, and security settings</p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle className="text-emerald-600 shrink-0" size={18} />
          <span className="text-xs font-bold text-emerald-800">Pharmacy profile details updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Store & Contact details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="text-primary" size={16} />
            Branch Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Pharmacy Branch Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Supervising Pharmacist</label>
              <input
                type="text"
                required
                value={formData.pharmacistName}
                onChange={(e) => setFormData({ ...formData, pharmacistName: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Official Contact Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Opening Hours Schedule</label>
              <input
                type="text"
                required
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Location & Logistics */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="text-primary" size={16} />
            Location & Logistics
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Physical Location Address</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">GPS Coordinates / Digital Address</label>
              <input
                type="text"
                value={formData.gpsCoordinates}
                onChange={(e) => setFormData({ ...formData, gpsCoordinates: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm bg-slate-50/30 font-semibold text-slate-700"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Truck size={16} className="text-primary" /> Offer Home Delivery
                </h4>
                <p className="text-[11px] text-slate-400 font-semibold">Allow users to book delivery for prescription reservations.</p>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryOffered: !formData.deliveryOffered })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  formData.deliveryOffered ? "bg-primary" : "bg-slate-300"
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 shadow-sm transition-transform ${
                  formData.deliveryOffered ? "translate-x-6.5" : "translate-x-0.5"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-primary hover:bg-teal-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-teal-700/20 transition-all text-sm"
          >
            <Save size={16} />
            Save Profile Settings
          </button>
        </div>
      </form>

      {/* SECTION 3: PHARMACY STAFF MANAGEMENT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Users className="text-primary" size={16} />
            Pharmacy Staff Accounts
          </h3>
          <button
            type="button"
            onClick={() => setShowAddStaffModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-xs rounded-lg transition-all"
          >
            <UserPlus size={14} />
            Add Staff Member
          </button>
        </div>

        {loadingStaff ? (
          <div className="flex items-center justify-center py-6 text-slate-400 text-xs font-semibold gap-2">
            <Loader2 className="animate-spin" size={16} />
            Loading staff members...
          </div>
        ) : staffList.length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
            <Users className="mx-auto text-slate-300 mb-2" size={28} />
            <p className="text-xs font-bold text-slate-600">No additional staff members added yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;Add Staff Member&quot; to invite pharmacists or technicians.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {staffList.map((staff) => (
              <div key={staff.id} className="py-3 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-800">{staff.name}</span>
                    <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-100">
                      {staff.role}
                    </span>
                  </div>
                  <p className="text-slate-400 font-medium">{staff.email} {staff.phone ? `• ${staff.phone}` : ""}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteStaff(staff.id, staff.name)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove staff member"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 4: SECURITY & PASSWORD CHANGE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <KeyRound className="text-primary" size={16} />
          Change Account Password
        </h3>

        {pwSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            Your account password has been changed successfully!
          </div>
        )}

        {pwError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
            {pwError}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPw ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-700"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-700"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-semibold text-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changingPw}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all disabled:opacity-50"
            >
              {changingPw ? <Loader2 className="animate-spin" size={14} /> : <Lock size={14} />}
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* ADD STAFF MODAL */}
      {showAddStaffModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <UserPlus size={18} className="text-primary" />
                Add Pharmacy Staff Member
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {staffError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold">
                {staffError}
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Staff Member Name *</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Samuel K. Appiah"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="samuel@pharmacy.com"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="+233 24 000 1122"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Initial Account Password *</label>
                <input
                  type="password"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  placeholder="Password for initial login"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingStaff}
                  className="px-5 py-2 bg-primary hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {addingStaff ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

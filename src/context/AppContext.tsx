"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getToken, removeToken, ApiInventoryItem, ApiReservation, BackendNotification } from "@/services/api";
import { browserNotifications } from "@/utils/browserNotifications";

export interface Medicine {
  id: string; // string representation of Inventory ID
  medicineId?: number; // Central catalogue medicine ID
  name: string;
  genericName?: string;
  strength?: string;
  dosageForm?: string;
  routeOfAdministration?: string;
  dosage: string; // Dosage Strength (e.g. 500mg, 100mg/5ml)
  dosageInstructions?: string; // Detailed Schedule & Directions for use
  stockQuantity: number;
  price: number;
  description: string;
  precautions?: string;
  sideEffects?: string;
  tags?: string;
  imageUrl?: string;
  manufacturer: string;
  category?: string;
  batchNumber?: string;
  expiryDate?: string;
  isAvailable?: boolean;
  requiresPrescription?: boolean;
  status: "In Stock" | "Low Stock" | "Out of Stock" | "Unavailable";
}

export interface Reservation {
  id: string; // Ref number or string representation of ID
  rawId?: number;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  medicines: { name: string; quantity: number; price: number }[];
  totalPrice: number;
  fulfillmentMethod: "Pickup" | "Delivery";
  fulfillmentTime?: string;
  fulfillmentAddress?: string;
  paymentPreference?: string;
  paymentMethod?: "PAYSTACK" | "CASH" | string;
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "FAILED" | string;
  status:
    | "Pending"
    | "Confirmed"
    | "Approved"
    | "Preparing"
    | "Out for Delivery"
    | "Ready for Pickup"
    | "Delivered"
    | "Collected"
    | "Picked Up"
    | "Cancelled";
  notes?: string;
  rejectionReason?: string;
  reservationCode?: string;
  expiresAt?: string;
  paidAt?: string;
}

export interface PharmacyProfile {
  id?: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  licenseNumber: string;
  openingHours: string;
  deliveryOffered: boolean;
  isActive: boolean;
  gpsCoordinates?: string;
  pharmacistName?: string;
  paystackSubaccountCode?: string;
  paystackSubaccountStatus?: string;
  paymentAccountType?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  mobileMoneyProvider?: string;
  mobileMoneyNumber?: string;
  paymentAccountVerified?: boolean;
  imageUrl?: string;
  logoUrl?: string;
}

export interface Notification {
  id: string;
  numericId?: number;
  type: "info" | "success" | "warning";
  notificationType?: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority?: string;
  actionUrl?: string;
  referenceType?: string;
  referenceId?: string;
}

interface AppContextType {
  user: { email: string; name: string; id?: number } | null;
  medicines: Medicine[];
  reservations: Reservation[];
  profile: PharmacyProfile;
  notifications: Notification[];
  loading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  addMedicine: (med: Omit<Medicine, "id" | "status">) => Promise<void>;
  addFromCatalogue: (data: {
    medicineId: number;
    price: number;
    stockQuantity: number;
    batchNumber?: string;
    expiryDate?: string;
    isAvailable?: boolean;
  }) => Promise<void>;
  bulkAddFromCatalogue: (medicineIds: number[], defaultPrice?: number, defaultQuantity?: number) => Promise<{ added_count: number; skipped_count: number; message: string }>;
  updateMedicine: (id: string, med: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  updateReservationStatus: (id: string, status: Reservation["status"], reason?: string) => Promise<void>;
  markCashPaid: (id: string) => Promise<void>;
  updateProfile: (updatedProfile: Partial<PharmacyProfile>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultProfile: PharmacyProfile = {
  name: "Ghana National Pharmacy (Accra Central)",
  email: "central@ghanapharmacy.gov.gh",
  phone: "+233 30 223 4455",
  location: "Ring Road Central, Accra",
  licenseNumber: "PHA-GH-2026-8830",
  openingHours: "08:00 AM - 10:00 PM",
  deliveryOffered: true,
  isActive: true,
  gpsCoordinates: "5.5601° N, 0.2057° W",
  pharmacistName: "Dr. Emmanuel Mensah, PharmD",
  paystackSubaccountStatus: "PENDING",
  paymentAccountVerified: false,
};

const mapApiInventoryToMedicine = (inv: ApiInventoryItem): Medicine => {
  const stockQty = inv.stock_quantity ?? 0;
  let computedStatus: Medicine["status"] = "In Stock";
  if (inv.is_available === false) computedStatus = "Unavailable";
  else if (stockQty <= 0) computedStatus = "Out of Stock";
  else if (stockQty <= 20) computedStatus = "Low Stock";

  return {
    id: String(inv.id),
    medicineId: inv.medicine_id || inv.medicine?.id,
    name: inv.medicine?.name || "Unknown Medicine",
    genericName: inv.medicine?.generic_name || "",
    strength: inv.medicine?.strength || inv.medicine?.dosage || "",
    dosageForm: inv.medicine?.dosage_form || "Tablet",
    routeOfAdministration: inv.medicine?.route_of_administration || "Oral",
    dosage: inv.medicine?.strength || inv.medicine?.dosage || "500mg",
    dosageInstructions: inv.medicine?.dosage_instructions || "",
    stockQuantity: stockQty,
    price: inv.price ?? 0.0,
    status: computedStatus,
    isAvailable: inv.is_available ?? true,
    requiresPrescription: inv.medicine?.requires_prescription ?? false,
    description: inv.medicine?.description || "",
    precautions: inv.medicine?.precautions || "",
    sideEffects: inv.medicine?.side_effects || "",
    tags: inv.medicine?.tags || "",
    imageUrl: inv.medicine?.image_url || "",
    manufacturer: inv.medicine?.manufacturer || "Ridge Pharmacy",
    category: inv.medicine?.category || "General",
    batchNumber: inv.batch_number || `B-${inv.id}`,
    expiryDate: inv.expiry_date ? String(inv.expiry_date).split("T")[0] : "",
  };
};

const mapApiReservationToReservation = (res: ApiReservation): Reservation => {
  let mappedStatus: Reservation["status"] = "Pending";
  const rawStatus = (res.status || "").toLowerCase();
  if (rawStatus === "pending" || rawStatus.includes("review")) {
    mappedStatus = "Pending";
  } else if (rawStatus === "preparing") {
    mappedStatus = "Preparing";
  } else if (rawStatus === "out for delivery" || rawStatus.includes("out_for_delivery")) {
    mappedStatus = "Out for Delivery";
  } else if (rawStatus === "ready for pickup" || rawStatus === "ready") {
    mappedStatus = "Ready for Pickup";
  } else if (rawStatus === "delivered") {
    mappedStatus = "Delivered";
  } else if (rawStatus === "collected" || rawStatus === "picked up" || rawStatus === "completed") {
    mappedStatus = "Picked Up";
  } else if (rawStatus.includes("cancel") || rawStatus.includes("expired") || rawStatus.includes("rejected")) {
    mappedStatus = "Cancelled";
  } else if (rawStatus.includes("approved") || rawStatus.includes("confirmed") || rawStatus.includes("reserved") || rawStatus.includes("paid")) {
    mappedStatus = "Confirmed";
  }

  const firstMed = res.items?.[0]?.medicine?.name || "Prescription Item";
  const paymentMethod = res.payment_method || (res.payment_preference === "Pay Online" ? "PAYSTACK" : res.payment_preference === "Pay at Pharmacy" || res.payment_preference === "Pay on Delivery" ? "CASH" : undefined);
  const paymentStatus = res.payment_status || (res.status === "Paid" ? "PAID" : "UNPAID");

  return {
    id: res.ref_number || res.reservation_code || `RES-${res.id}`,
    rawId: res.id,
    patientName: res.patient?.name || `Patient #${res.patient_id}`,
    patientPhone: res.patient?.phone || "+233 55 456 7890",
    date: res.date ? String(res.date).split("T")[0] : new Date().toISOString().split("T")[0],
    time: "10:00 AM",
    medicines: (res.items || []).map((item) => ({
      name: item.medicine?.name || firstMed,
      quantity: item.quantity,
      price: item.price,
    })),
    totalPrice: res.total_price || 0.0,
    fulfillmentMethod: (res.fulfillment_method as any) === "Delivery" ? "Delivery" : "Pickup",
    fulfillmentTime: res.fulfillment_time || undefined,
    fulfillmentAddress: res.fulfillment_address || undefined,
    paymentPreference: res.payment_preference || (paymentMethod === "PAYSTACK" ? "Pay Online" : paymentMethod === "CASH" ? "Pay at Pharmacy" : undefined),
    paymentMethod,
    paymentStatus,
    status: mappedStatus,
    notes: res.notes || undefined,
    rejectionReason: res.rejection_reason || undefined,
    reservationCode: res.reservation_code || res.ref_number || `MF-${res.id}`,
    expiresAt: res.expires_at,
    paidAt: res.paid_at,
  };
};

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
  } catch {
    return "Recently";
  }
}

const mapApiNotificationToNotification = (item: BackendNotification): Notification => {
  let type: "info" | "success" | "warning" = "info";
  if (item.notification_type.includes("APPROVED") || item.notification_type.includes("SUCCESS")) {
    type = "success";
  } else if (item.notification_type.includes("ALERT") || item.notification_type.includes("REJECT") || item.notification_type.includes("SUSPEND")) {
    type = "warning";
  }

  return {
    id: String(item.id),
    numericId: item.id,
    type,
    notificationType: item.notification_type,
    title: item.title,
    message: item.message,
    time: formatRelativeTime(item.created_at),
    read: item.is_read,
    priority: item.priority,
    actionUrl: item.action_url,
    referenceType: item.reference_type,
    referenceId: item.reference_id,
  };
};

const CACHE_KEY = "pharmacy_app_cache";

interface AppCacheData {
  user: { email: string; name: string; id?: number } | null;
  profile: PharmacyProfile;
  medicines: Medicine[];
  reservations: Reservation[];
}

const saveCache = (data: Partial<AppCacheData>) => {
  if (typeof window === "undefined") return;
  try {
    const existingRaw = localStorage.getItem(CACHE_KEY);
    const existing = existingRaw ? JSON.parse(existingRaw) : {};
    const updated = { ...existing, ...data };
    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save cache to localStorage:", err);
  }
};

const getCache = (): AppCacheData | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearCache = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_KEY);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; name: string; id?: number } | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [profile, setProfile] = useState<PharmacyProfile>(defaultProfile);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBackendData = useCallback(async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoading(true);
      }

      // Concurrently fetch User, Pharmacy Profile, Reservations, and Notifications
      const [meRes, pharmacyRes, resListRes, notifsRes] = await Promise.allSettled([
        api.getMe(),
        api.getMyPharmacy(),
        api.getPharmacyReservations(),
        api.getNotifications(),
      ]);

      if (meRes.status === "rejected") {
        throw meRes.reason;
      }

      const me = meRes.value;
      const userData = { email: me.email, name: me.name, id: me.id };
      setUser(userData);

      let pharmacyProfile = defaultProfile;
      let fetchedMedicines: Medicine[] = [];

      if (pharmacyRes.status === "fulfilled" && pharmacyRes.value) {
        const pharmacy = pharmacyRes.value;
        pharmacyProfile = {
          id: pharmacy.id,
          name: pharmacy.name,
          email: pharmacy.email || me.email,
          phone: pharmacy.phone || me.phone || "+233 30 223 4455",
          location: pharmacy.location,
          licenseNumber: pharmacy.license_number,
          openingHours: pharmacy.opening_hours || "08:00 AM - 10:00 PM",
          deliveryOffered: pharmacy.delivery_offered ?? true,
          isActive: pharmacy.status === "Approved",
          pharmacistName: pharmacy.pharmacist_name || me.name,
          imageUrl: pharmacy.image_url || undefined,
          logoUrl: pharmacy.logo_url || undefined,
        };
        setProfile(pharmacyProfile);

        try {
          const invList = await api.getPharmacyInventory(pharmacy.id);
          fetchedMedicines = invList.map(mapApiInventoryToMedicine);
          setMedicines(fetchedMedicines);
        } catch (invErr) {
          console.warn("[AppProvider] Failed to load inventory:", invErr);
        }
      }

      let fetchedReservations: Reservation[] = [];
      if (resListRes.status === "fulfilled") {
        fetchedReservations = resListRes.value.map(mapApiReservationToReservation);
        setReservations(fetchedReservations);
      }

      if (notifsRes.status === "fulfilled") {
        setNotifications((notifsRes.value.items || []).map(mapApiNotificationToNotification));
      }

      saveCache({
        user: userData,
        profile: pharmacyProfile,
        medicines: fetchedMedicines,
        reservations: fetchedReservations,
      });
    } catch (err) {
      console.warn("[AppProvider] Failed to load data from backend API:", err);
      removeToken();
      clearCache();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const cached = getCache();
      if (cached && cached.user) {
        setUser(cached.user);
        if (cached.profile) setProfile(cached.profile);
        if (cached.medicines) setMedicines(cached.medicines);
        if (cached.reservations) setReservations(cached.reservations);
        setLoading(false);

        loadBackendData({ silent: true });
      } else {
        loadBackendData();
      }
    } else {
      clearCache();
      setLoading(false);
    }
  }, [loadBackendData]);

  // Periodic notification polling every 15 seconds with Web Push and audio chime alerts
  useEffect(() => {
    let prevUnreadIds = new Set<string>();
    let isFirstFetch = true;

    const checkNotifications = async () => {
      const token = getToken();
      if (!token) return;

      try {
        const res = await api.getNotifications(false, 30);
        const mapped = (res.items || []).map(mapApiNotificationToNotification);
        setNotifications(mapped);

        const currentUnread = mapped.filter((n) => !n.read);

        if (!isFirstFetch) {
          // Check for any new unread notification that arrived since last poll
          for (const item of currentUnread) {
            if (!prevUnreadIds.has(item.id)) {
              // Trigger real OS Desktop Notification + Audio Chime
              const isOrder =
                item.title.toLowerCase().includes("reservation") ||
                item.title.toLowerCase().includes("order") ||
                item.title.toLowerCase().includes("prescription");

              browserNotifications.showNotification(item.title, {
                body: item.message,
                id: item.id,
                sound: true,
                soundType: isOrder ? "order" : "alert",
                url: item.actionUrl || "/reservations",
              });
            }
          }
        }

        prevUnreadIds = new Set(currentUnread.map((n) => n.id));
        isFirstFetch = false;
      } catch (e) {
        // silent fail on network glitch
      }
    };

    // Initial check
    checkNotifications();

    const interval = setInterval(checkNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await api.login(email, password || "password");
      await loadBackendData();
      return true;
    } catch (err: any) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    api.logout();
    clearCache();
    setUser(null);
    setMedicines([]);
    setReservations([]);
  };

  const addMedicine = async (med: Omit<Medicine, "id" | "status">) => {
    if (!profile.id) return;
    try {
      const created = await api.addInventoryItem(profile.id, {
        name: med.name,
        generic_name: med.genericName,
        strength: med.strength || med.dosage,
        dosage_form: med.dosageForm || "Tablet",
        route_of_administration: med.routeOfAdministration || "Oral",
        dosage: med.dosage || med.strength,
        dosage_instructions: med.dosageInstructions,
        category: med.category,
        description: med.description,
        manufacturer: med.manufacturer,
        precautions: med.precautions,
        side_effects: med.sideEffects,
        tags: med.tags,
        image_url: med.imageUrl,
        requires_prescription: med.requiresPrescription ?? false,
        batch_number: med.batchNumber,
        stock_quantity: med.stockQuantity,
        price: med.price,
        expiry_date: med.expiryDate,
        is_available: med.isAvailable ?? true,
      });

      const newMed = mapApiInventoryToMedicine(created);
      setMedicines((prev) => [newMed, ...prev]);

      if (newMed.stockQuantity <= 20) {
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            type: newMed.stockQuantity === 0 ? "warning" : "info",
            title: newMed.stockQuantity === 0 ? "Out of Stock Warning" : "Low Stock Alert",
            message: `${newMed.name} has been added with ${newMed.stockQuantity} remaining packs.`,
            time: "Just now",
            read: false,
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      console.error("Failed to add medicine:", err);
      throw err;
    }
  };

  const addFromCatalogue = async (data: {
    medicineId: number;
    price: number;
    stockQuantity: number;
    batchNumber?: string;
    expiryDate?: string;
    isAvailable?: boolean;
  }) => {
    if (!profile.id) return;
    try {
      const created = await api.addInventoryFromCatalogue(profile.id, {
        medicine_id: data.medicineId,
        price: data.price,
        stock_quantity: data.stockQuantity,
        batch_number: data.batchNumber,
        expiry_date: data.expiryDate,
        is_available: data.isAvailable ?? true,
      });

      const newMed = mapApiInventoryToMedicine(created);
      setMedicines((prev) => [newMed, ...prev.filter((m) => m.id !== newMed.id)]);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: "success",
          title: "Medicine Added to Inventory",
          message: `${newMed.name} (${newMed.strength || newMed.dosage}) added to your active stock.`,
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error("Failed to add from catalogue:", err);
      throw err;
    }
  };

  const bulkAddFromCatalogue = async (
    medicineIds: number[],
    defaultPrice: number = 15.0,
    defaultQuantity: number = 50
  ) => {
    if (!profile.id) throw new Error("Pharmacy profile not loaded");
    try {
      const res = await api.bulkAddInventoryFromCatalogue(profile.id, {
        medicine_ids: medicineIds,
        default_price: defaultPrice,
        default_quantity: defaultQuantity,
      });

      if (res.added_items && res.added_items.length > 0) {
        const mapped = res.added_items.map(mapApiInventoryToMedicine);
        const addedIds = new Set(mapped.map((m) => m.id));
        setMedicines((prev) => [...mapped, ...prev.filter((m) => !addedIds.has(m.id))]);
      }

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: res.added_count > 0 ? "success" : "info",
          title: "Bulk Add Complete",
          message: res.message,
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);

      return res;
    } catch (err: any) {
      console.error("Failed to bulk add medicines:", err);
      throw err;
    }
  };

  const updateMedicine = async (id: string, updatedFields: Partial<Medicine>) => {
    if (!profile.id) return;
    const inventoryId = parseInt(id, 10);
    if (isNaN(inventoryId)) return;

    try {
      const updated = await api.updateInventoryItem(profile.id, inventoryId, {
        name: updatedFields.name,
        dosage: updatedFields.dosage,
        dosage_instructions: updatedFields.dosageInstructions,
        category: updatedFields.category,
        description: updatedFields.description,
        manufacturer: updatedFields.manufacturer,
        precautions: updatedFields.precautions,
        side_effects: updatedFields.sideEffects,
        tags: updatedFields.tags,
        image_url: updatedFields.imageUrl,
        batch_number: updatedFields.batchNumber,
        stock_quantity: updatedFields.stockQuantity,
        price: updatedFields.price,
        expiry_date: updatedFields.expiryDate,
        is_available: updatedFields.isAvailable,
      });

      const mapped = mapApiInventoryToMedicine(updated);
      setMedicines((prev) => prev.map((m) => (m.id === id ? mapped : m)));
    } catch (err: any) {
      console.error("Failed to update medicine:", err);
      throw err;
    }
  };


  const deleteMedicine = async (id: string) => {
    if (!profile.id) return;
    const inventoryId = parseInt(id, 10);
    if (isNaN(inventoryId)) return;

    try {
      await api.deleteInventoryItem(profile.id, inventoryId);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      console.error("Failed to delete medicine:", err);
      throw err;
    }
  };

  const markCashPaid = async (id: string) => {
    const resItem = reservations.find((r) => r.id === id || String(r.rawId) === id);
    const targetNumericId = resItem?.rawId || parseInt(id.replace(/\D/g, ""), 10);
    if (!targetNumericId) return;

    try {
      await api.markCashPaid(targetNumericId);
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id || String(r.rawId) === String(targetNumericId)
            ? { ...r, status: "Picked Up", paymentStatus: "PAID", paymentMethod: "CASH" }
            : r
        )
      );

      // Refresh inventory as stock levels were deducted
      if (profile.id) {
        const invList = await api.getPharmacyInventory(profile.id);
        setMedicines(invList.map(mapApiInventoryToMedicine));
      }

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: "success",
          title: "Cash Payment Confirmed",
          message: `Cash payment for reservation ${id} was marked as PAID and completed.`,
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error("Failed to mark cash paid:", err);
      throw err;
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation["status"], reason?: string) => {
    const resItem = reservations.find((r) => r.id === id || String(r.rawId) === id);
    const targetNumericId = resItem?.rawId || parseInt(id.replace(/\D/g, ""), 10);
    if (!targetNumericId) return;

    try {
      await api.updateReservationStatus(targetNumericId, status, reason);
      setReservations((prev) =>
        prev.map((r) => (r.id === id || String(r.rawId) === String(targetNumericId) ? { ...r, status, rejectionReason: reason || r.rejectionReason } : r))
      );

      // Refresh inventory as stock levels may change when confirmed
      if (profile.id) {
        const invList = await api.getPharmacyInventory(profile.id);
        setMedicines(invList.map(mapApiInventoryToMedicine));
      }

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: status === "Confirmed" ? "success" : status === "Cancelled" ? "warning" : "info",
          title: `Reservation ${status}`,
          message: `Reservation ${id} has been marked as ${status.toLowerCase()}.`,
          time: "Just now",
          read: false,
        },
        ...prev,
      ]);
    } catch (err: any) {
      console.error("Failed to update reservation status:", err);
      throw err;
    }
  };

  const updateProfile = async (updatedFields: Partial<PharmacyProfile>) => {
    if (profile.id) {
      try {
        await api.updatePharmacy(profile.id, {
          name: updatedFields.name,
          location: updatedFields.location,
          license_number: updatedFields.licenseNumber,
          pharmacist_name: updatedFields.pharmacistName,
          phone: updatedFields.phone,
          email: updatedFields.email,
          opening_hours: updatedFields.openingHours,
          delivery_offered: updatedFields.deliveryOffered,
          image_url: updatedFields.imageUrl,
          logo_url: updatedFields.logoUrl,
        });
      } catch (err: any) {
        console.error("Failed to update pharmacy profile:", err);
        throw err;
      }
    }
    setProfile((prev) => ({ ...prev, ...updatedFields }));
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    const numericId = Number(id);
    if (!isNaN(numericId)) {
      try {
        await api.markNotificationRead(numericId);
      } catch (err) {
        console.error("Failed to mark notification read on backend:", err);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsRead();
    } catch (err) {
      console.error("Failed to mark all notifications read on backend:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        medicines,
        reservations,
        profile,
        notifications,
        loading,
        login,
        logout,
        addMedicine,
        addFromCatalogue,
        bulkAddFromCatalogue,
        updateMedicine,
        deleteMedicine,
        updateReservationStatus,
        markCashPaid,
        updateProfile,
        markNotificationRead,
        markAllNotificationsRead,
        refreshData: loadBackendData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};


export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};

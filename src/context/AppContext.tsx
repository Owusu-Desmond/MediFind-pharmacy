"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getToken, ApiInventoryItem, ApiReservation } from "@/services/api";

export interface Medicine {
  id: string; // string representation of Inventory ID
  name: string;
  dosage: string;
  batchNumber: string;
  stockQuantity: number;
  price: number;
  category: string;
  expiryDate: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  description: string;
  manufacturer: string;
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
  paymentPreference: string;
  status: "Pending" | "Confirmed" | "Picked Up" | "Cancelled";
  notes?: string;
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
}

interface Notification {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
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
  updateMedicine: (id: string, med: Partial<Medicine>) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  updateReservationStatus: (id: string, status: Reservation["status"]) => Promise<void>;
  updateProfile: (updatedProfile: Partial<PharmacyProfile>) => Promise<void>;
  markNotificationRead: (id: string) => void;
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
};

const mapApiInventoryToMedicine = (inv: ApiInventoryItem): Medicine => {
  const stockQty = inv.stock_quantity ?? 0;
  let computedStatus: Medicine["status"] = "In Stock";
  if (stockQty <= 0) computedStatus = "Out of Stock";
  else if (stockQty <= 20) computedStatus = "Low Stock";

  return {
    id: String(inv.id),
    name: inv.medicine?.name || "Unknown Medicine",
    dosage: inv.medicine?.dosage || "",
    batchNumber: inv.batch_number || `B-${inv.id}`,
    stockQuantity: stockQty,
    price: inv.price ?? 0.0,
    category: inv.medicine?.category || "General",
    expiryDate: inv.expiry_date ? String(inv.expiry_date).split("T")[0] : "2028-12-31",
    status: computedStatus,
    description: inv.medicine?.description || "",
    manufacturer: inv.medicine?.manufacturer || "Pharma Ghana Ltd",
  };
};

const mapApiReservationToReservation = (res: ApiReservation): Reservation => {
  let mappedStatus: Reservation["status"] = "Pending";
  const rawStatus = (res.status || "").toLowerCase();
  if (rawStatus.includes("approved") || rawStatus.includes("confirmed")) {
    mappedStatus = "Confirmed";
  } else if (rawStatus.includes("collected") || rawStatus.includes("picked up") || rawStatus.includes("delivered")) {
    mappedStatus = "Picked Up";
  } else if (rawStatus.includes("cancelled") || rawStatus.includes("rejected")) {
    mappedStatus = "Cancelled";
  }

  const dt = res.date ? new Date(res.date) : new Date();
  const dateStr = dt.toISOString().split("T")[0];
  const timeStr = dt.toTimeString().slice(0, 5);

  return {
    id: res.ref_number || `RES-${res.id}`,
    rawId: res.id,
    patientName: res.patient?.name || `Patient #${res.patient_id}`,
    patientPhone: res.patient?.phone || "+233 55 456 7890",
    date: dateStr,
    time: timeStr,
    medicines: (res.items || []).map((item) => ({
      name: item.medicine?.dosage ? `${item.medicine.name} ${item.medicine.dosage}` : (item.medicine?.name || "Medicine"),
      quantity: item.quantity,
      price: item.price,
    })),
    totalPrice: res.total_price || 0.0,
    fulfillmentMethod: (res.fulfillment_method as any) === "Delivery" ? "Delivery" : "Pickup",
    fulfillmentTime: res.fulfillment_time || undefined,
    fulfillmentAddress: res.fulfillment_address || undefined,
    paymentPreference: res.payment_preference || "Mobile Money (MTN MoMo)",
    status: mappedStatus,
    notes: res.notes || undefined,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ email: string; name: string; id?: number } | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [profile, setProfile] = useState<PharmacyProfile>(defaultProfile);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBackendData = useCallback(async () => {
    try {
      const me = await api.getMe();
      setUser({ email: me.email, name: me.name, id: me.id });

      const pharmacy = await api.getMyPharmacy();
      if (pharmacy) {
        setProfile({
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
        });

        // Load inventory for this pharmacy
        const invList = await api.getPharmacyInventory(pharmacy.id);
        setMedicines(invList.map(mapApiInventoryToMedicine));
      }

      // Load reservations
      const resList = await api.getPharmacyReservations();
      setReservations(resList.map(mapApiReservationToReservation));
    } catch (err) {
      console.warn("[AppProvider] Failed to load data from backend API:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      loadBackendData();
    } else {
      setLoading(false);
    }
  }, [loadBackendData]);

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
    setUser(null);
    setMedicines([]);
    setReservations([]);
  };

  const addMedicine = async (med: Omit<Medicine, "id" | "status">) => {
    if (!profile.id) return;
    try {
      const created = await api.addInventoryItem(profile.id, {
        name: med.name,
        dosage: med.dosage,
        category: med.category,
        description: med.description,
        manufacturer: med.manufacturer,
        batch_number: med.batchNumber,
        stock_quantity: med.stockQuantity,
        price: med.price,
        expiry_date: med.expiryDate,
      });

      const newMed = mapApiInventoryToMedicine(created);
      setMedicines((prev) => [newMed, ...prev]);

      if (newMed.stockQuantity <= 20) {
        setNotifications((prev) => [
          {
            id: `notif-${Date.now()}`,
            type: newMed.stockQuantity === 0 ? "warning" : "info",
            title: newMed.stockQuantity === 0 ? "Out of Stock Warning" : "Low Stock Alert",
            message: `${newMed.name} ${newMed.dosage} has been added with ${newMed.stockQuantity} remaining packs.`,
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

  const updateMedicine = async (id: string, updatedFields: Partial<Medicine>) => {
    if (!profile.id) return;
    const inventoryId = parseInt(id, 10);
    if (isNaN(inventoryId)) return;

    try {
      const updated = await api.updateInventoryItem(profile.id, inventoryId, {
        name: updatedFields.name,
        dosage: updatedFields.dosage,
        category: updatedFields.category,
        description: updatedFields.description,
        manufacturer: updatedFields.manufacturer,
        batch_number: updatedFields.batchNumber,
        stock_quantity: updatedFields.stockQuantity,
        price: updatedFields.price,
        expiry_date: updatedFields.expiryDate,
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

  const updateReservationStatus = async (id: string, status: Reservation["status"]) => {
    const resItem = reservations.find((r) => r.id === id || String(r.rawId) === id);
    const targetNumericId = resItem?.rawId || parseInt(id.replace(/\D/g, ""), 10);
    if (!targetNumericId) return;

    try {
      await api.updateReservationStatus(targetNumericId, status);
      setReservations((prev) =>
        prev.map((r) => (r.id === id || String(r.rawId) === String(targetNumericId) ? { ...r, status } : r))
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
        });
      } catch (err: any) {
        console.error("Failed to update pharmacy profile:", err);
        throw err;
      }
    }
    setProfile((prev) => ({ ...prev, ...updatedFields }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
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
        updateMedicine,
        deleteMedicine,
        updateReservationStatus,
        updateProfile,
        markNotificationRead,
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

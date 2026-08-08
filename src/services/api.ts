const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const TOKEN_KEY = "pharmacy_token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((err: { msg: string }) => err.msg).join(", ");
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export interface ApiInventoryItem {
  id: number;
  pharmacy_id: number;
  medicine_id: number;
  batch_number?: string;
  stock_quantity: number;
  price: number;
  expiry_date?: string;
  status: string;
  medicine: {
    id: number;
    name: string;
    generic_name?: string;
    dosage?: string;
    category?: string;
    description?: string;
    manufacturer?: string;
  };
}

export interface ApiReservationItem {
  id: number;
  quantity: number;
  price: number;
  medicine: {
    id: number;
    name: string;
    dosage?: string;
  };
}

export interface ApiReservation {
  id: number;
  patient_id: number;
  pharmacy_id: number;
  date: string;
  fulfillment_method?: string;
  fulfillment_address?: string;
  fulfillment_time?: string;
  payment_preference?: string;
  status: string;
  total_price: number;
  notes?: string;
  ref_number?: string;
  patient?: {
    name: string;
    phone?: string;
  };
  items: ApiReservationItem[];
}

export const api = {
  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const data = await fetchApi<{ access_token: string; token_type: string }>(
      "/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );
    if (data.access_token) {
      setToken(data.access_token);
    }
    return data;
  },

  async logout() {
    removeToken();
  },

  async forgotPassword(email: string) {
    return fetchApi<{ message: string; reset_token: string; email: string }>(
      "/api/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  },

  async resetPassword(email: string, newPassword: string, resetToken?: string) {
    return fetchApi<{ message: string }>(
      "/api/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify({ email, new_password: newPassword, reset_token: resetToken }),
      }
    );
  },


  async getMe() {
    return fetchApi<{
      id: number;
      email: string;
      name: string;
      role: string;
      phone?: string;
      location?: string;
    }>("/api/auth/me");
  },

  async uploadCertificate(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    return fetchApi<{ url: string; filename: string }>(
      "/api/pharmacies/upload-certificate",
      {
        method: "POST",
        body: formData,
      }
    );
  },

  async registerPharmacy(pharmacyData: {
    name: string;
    location: string;
    license_number: string;
    pharmacist_name?: string;
    pharmacist_id?: string;
    phone?: string;
    email?: string;
    delivery_offered?: boolean;
    opening_hours?: string;
    certificate_url?: string;
  }) {
    return fetchApi("/api/pharmacies/", {
      method: "POST",
      body: JSON.stringify(pharmacyData),
    });
  },

  async getMyPharmacy() {
    return fetchApi<{
      id: number;
      name: string;
      location: string;
      license_number: string;
      pharmacist_name?: string;
      pharmacist_id?: string;
      phone?: string;
      email?: string;
      status: string;
      delivery_offered: boolean;
      opening_hours?: string;
      lat?: number;
      lng?: number;
      certificate_url?: string;
    }>("/api/pharmacies/my-pharmacy");
  },

  async updatePharmacy(
    pharmacyId: number,
    pharmacyData: Partial<{
      name: string;
      location: string;
      license_number: string;
      pharmacist_name: string;
      pharmacist_id: string;
      phone: string;
      email: string;
      delivery_offered: boolean;
      opening_hours: string;
      lat: number;
      lng: number;
      certificate_url: string;
    }>
  ) {
    return fetchApi(`/api/pharmacies/${pharmacyId}`, {
      method: "PUT",
      body: JSON.stringify(pharmacyData),
    });
  },

  async getPharmacyInventory(pharmacyId: number) {
    return fetchApi<ApiInventoryItem[]>(`/api/pharmacies/${pharmacyId}/inventory`);
  },

  async addInventoryItem(
    pharmacyId: number,
    itemData: {
      name: string;
      dosage?: string;
      category?: string;
      description?: string;
      manufacturer?: string;
      batch_number?: string;
      stock_quantity: number;
      price: number;
      expiry_date?: string;
    }
  ) {
    return fetchApi<ApiInventoryItem>(`/api/pharmacies/${pharmacyId}/inventory`, {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  },

  async updateInventoryItem(
    pharmacyId: number,
    inventoryId: number,
    itemData: Partial<{
      name: string;
      dosage: string;
      category: string;
      description: string;
      manufacturer: string;
      batch_number: string;
      stock_quantity: number;
      price: number;
      expiry_date: string;
    }>
  ) {
    return fetchApi<ApiInventoryItem>(`/api/pharmacies/${pharmacyId}/inventory/${inventoryId}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  },

  async deleteInventoryItem(pharmacyId: number, inventoryId: number) {
    return fetchApi<{ message: string }>(`/api/pharmacies/${pharmacyId}/inventory/${inventoryId}`, {
      method: "DELETE",
    });
  },

  async getPharmacyReservations() {
    return fetchApi<ApiReservation[]>("/api/reservations/");
  },

  async updateReservationStatus(reservationId: number, status: string) {
    return fetchApi(`/api/reservations/${reservationId}/status?status=${encodeURIComponent(status)}`, {
      method: "PATCH",
    });
  },
};

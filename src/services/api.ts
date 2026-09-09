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
    dosage_instructions?: string;
    category?: string;
    description?: string;
    manufacturer?: string;
    precautions?: string;
    side_effects?: string;
    tags?: string;
    image_url?: string;
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
  payment_method?: string;
  payment_status?: string;
  total_price: number;
  notes?: string;
  rejection_reason?: string;
  ref_number?: string;
  reservation_code?: string;
  expires_at?: string;
  paid_at?: string;
  cash_payment_confirmed_at?: string;
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

  async getMe() {
    return fetchApi<{
      id: number;
      email: string;
      name: string;
      phone?: string;
      location?: string;
      role: string;
      status: string;
    }>("/api/auth/me");
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

  async registerPharmacy(formData: any) {
    return fetchApi<any>("/api/pharmacies/", {
      method: "POST",
      body: JSON.stringify(formData),
    });
  },

  async uploadCertificate(file: File) {
    const data = new FormData();
    data.append("file", file);
    return fetchApi<{ url: string; filename: string }>("/api/pharmacies/upload-certificate", {
      method: "POST",
      body: data,
    });
  },

  async getSignedUrl(objectPath: string) {
    return fetchApi<{ signed_url: string; expires_in: number }>(
      `/api/pharmacies/signed-url?object_path=${encodeURIComponent(objectPath)}`
    );
  },

  async uploadMedicineImage(file: File) {
    const data = new FormData();
    data.append("file", file);
    return fetchApi<{ url: string; filename: string }>("/api/pharmacies/upload-medicine-image", {
      method: "POST",
      body: data,
    });
  },

  async getMyPharmacy() {
    return fetchApi<any>("/api/pharmacies/my-pharmacy");
  },

  async updatePharmacy(pharmacyId: number, pharmacyData: any) {
    return fetchApi<any>(`/api/pharmacies/${pharmacyId}`, {
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
      dosage_instructions?: string;
      category?: string;
      description?: string;
      manufacturer?: string;
      precautions?: string;
      side_effects?: string;
      tags?: string;
      image_url?: string;
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
      dosage_instructions: string;
      category: string;
      description: string;
      manufacturer: string;
      precautions: string;
      side_effects: string;
      tags: string;
      image_url: string;
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

  async updateReservationStatus(reservationId: number, status: string, reason?: string) {
    let url = `/api/reservations/${reservationId}/status?status=${encodeURIComponent(status)}`;
    if (reason) {
      url += `&reason=${encodeURIComponent(reason)}`;
    }
    return fetchApi(url, {
      method: "PATCH",
    });
  },

  async markCashPaid(reservationId: number | string) {
    return fetchApi<{
      success: boolean;
      message: string;
      reservation_id: number;
      reservation_status: string;
      payment_status: string;
      payment_method: string;
      amount: number;
    }>(`/api/reservations/${reservationId}/mark-cash-paid`, {
      method: "POST",
    });
  },

  async getBanks() {
    return fetchApi<Array<{ name: string; code: string; type: string }>>("/api/payments/banks");
  },

  async setupSubaccount(
    pharmacyId: number,
    payoutData: {
      payment_account_type: string;
      bank_name?: string;
      bank_code?: string;
      account_name: string;
      account_number: string;
      mobile_money_provider?: string;
      mobile_money_number?: string;
    }
  ) {
    return fetchApi<{
      pharmacy_id: number;
      paystack_subaccount_code?: string;
      paystack_subaccount_status: string;
      payment_account_type?: string;
      bank_name?: string;
      account_name?: string;
      account_number_masked?: string;
      mobile_money_provider?: string;
      payment_account_verified: boolean;
      message?: string;
    }>(`/api/pharmacies/${pharmacyId}/paystack/subaccount`, {
      method: "POST",
      body: JSON.stringify(payoutData),
    });
  },

  async getSubaccount(pharmacyId: number) {
    return fetchApi<{
      pharmacy_id: number;
      paystack_subaccount_code?: string;
      paystack_subaccount_status: string;
      payment_account_type?: string;
      bank_name?: string;
      account_name?: string;
      account_number_masked?: string;
      mobile_money_provider?: string;
      payment_account_verified: boolean;
    }>(`/api/pharmacies/${pharmacyId}/paystack/subaccount`);
  },

  async changePassword(currentPassword: string, newPassword: string) {
    return fetchApi<{ message: string }>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  },

  async getPharmacyStaff(pharmacyId: number) {
    return fetchApi<Array<{ id: number; user_id: number; name: string; email: string; phone?: string; role: string }>>(
      `/api/pharmacies/${pharmacyId}/staff`
    );
  },

  async addPharmacyStaff(pharmacyId: number, staffData: { name: string; email: string; password: string; phone?: string }) {
    return fetchApi<{ id: number; user_id: number; name: string; email: string; phone?: string; role: string }>(
      `/api/pharmacies/${pharmacyId}/staff`,
      {
        method: "POST",
        body: JSON.stringify(staffData),
      }
    );
  },

  async deletePharmacyStaff(pharmacyId: number, staffId: number) {
    return fetchApi<{ message: string }>(`/api/pharmacies/${pharmacyId}/staff/${staffId}`, {
      method: "DELETE",
    });
  },
};

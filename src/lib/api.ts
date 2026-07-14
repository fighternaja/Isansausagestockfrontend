const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function refreshToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && token) {
    const newToken = await refreshToken();
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new ApiError(res.status, error.error || "Request failed", error.details);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiFetch<{ user: User; accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    logout: () =>
      apiFetch("/auth/logout", { method: "POST" }),
    me: () => apiFetch<User>("/auth/me"),
    register: (data: RegisterData) =>
      apiFetch<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  rawMaterials: {
    list: () => apiFetch<RawMaterial[]>("/raw-materials"),
    get: (id: string) => apiFetch<RawMaterial>(`/raw-materials/${id}`),
    create: (data: RawMaterialInput) =>
      apiFetch<RawMaterial>("/raw-materials", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<RawMaterialInput>) =>
      apiFetch<RawMaterial>(`/raw-materials/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch(`/raw-materials/${id}`, { method: "DELETE" }),
    adjust: (id: string, quantity: number, reason: string) =>
      apiFetch<RawMaterial>(`/raw-materials/${id}/adjust`, {
        method: "POST",
        body: JSON.stringify({ quantity, reason }),
      }),
  },
  products: {
    list: () => apiFetch<Product[]>("/products"),
    get: (id: string) => apiFetch<Product>(`/products/${id}`),
    preview: (id: string, quantity: number) =>
      apiFetch<ProductionPreview>(
        `/products/${id}/preview?quantity=${quantity}`
      ),
    create: (data: ProductInput) =>
      apiFetch<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<ProductInput>) =>
      apiFetch<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch(`/products/${id}`, { method: "DELETE" }),
  },
  production: {
    list: (page = 1) =>
      apiFetch<Paginated<ProductionBatch>>(`/production?page=${page}`),
    preview: (productId: string, quantity: number) =>
      apiFetch<ProductionPreview>(
        `/production/preview?productId=${productId}&quantity=${quantity}`
      ),
    create: (data: { productId: string; quantityProduced: number }) =>
      apiFetch<ProductionBatch>("/production", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  dashboard: {
    stats: (days = 30) =>
      apiFetch<DashboardStats>(`/dashboard/stats?days=${days}`),
    auditLogs: (page = 1) =>
      apiFetch<Paginated<AuditLog>>(`/dashboard/audit-logs?page=${page}`),
    notifications: (unreadOnly = false) =>
      apiFetch<Notification[]>(
        `/dashboard/notifications?unreadOnly=${unreadOnly}`
      ),
    notificationCount: () =>
      apiFetch<{ count: number }>("/dashboard/notifications/count"),
    markRead: (id: string) =>
      apiFetch(`/dashboard/notifications/${id}/read`, { method: "PATCH" }),
    markAllRead: () =>
      apiFetch("/dashboard/notifications/read-all", { method: "PATCH" }),
  },
};

export type UserRole = "ADMIN" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minStockAlert: number;
  costPerUnit: number;
  isLowStock?: boolean;
}

export interface RawMaterialInput {
  name: string;
  unit: string;
  quantity?: number;
  minStockAlert: number;
  costPerUnit: number;
}

export interface RecipeItem {
  rawMaterialId: string;
  quantityPerUnit: number;
  rawMaterialName?: string;
  unit?: string;
}

export interface Product {
  id: string;
  name: string;
  recipe: RecipeItem[];
  quantity: number;
  minStockAlert: number;
  expiryDays: number;
  isLowStock?: boolean;
}

export interface ProductInput {
  name: string;
  recipe: RecipeItem[];
  quantity?: number;
  minStockAlert: number;
  expiryDays: number;
}

export interface ProductionPreview {
  productId: string;
  productName: string;
  quantityProduced: number;
  requirements: {
    rawMaterialId: string;
    rawMaterialName: string;
    unit: string;
    quantityRequired: number;
    quantityAvailable: number;
    sufficient: boolean;
    cost: number;
  }[];
  totalCost: number;
  costPerUnit: number;
  allSufficient: boolean;
}

export interface ProductionBatch {
  id: string;
  productId: string;
  quantityProduced: number;
  producedAt: string;
  cost: number;
  costPerUnit?: number;
  product: Product;
  user: { id: string; name: string };
}

export interface DashboardStats {
  summary: {
    totalRevenue: number;
    totalProductionCost: number;
    profit: number;
    orderCount: number;
    batchCount: number;
    lowStockCount: number;
  };
  dailySales: { date: string; amount: number }[];
  monthlySales: { month: string; amount: number }[];
  stockOverview: {
    rawMaterials: {
      id: string;
      name: string;
      quantity: number;
      unit: string;
      minStockAlert: number;
      isLowStock: boolean;
    }[];
    products: {
      id: string;
      name: string;
      quantity: number;
      minStockAlert: number;
      isLowStock: boolean;
    }[];
  };
  topSellingProducts: {
    productId: string;
    name: string;
    totalSold: number;
  }[];
  lowStockAlerts: {
    type: "RAW_MATERIAL" | "PRODUCT";
    name: string;
    quantity: number;
    unit: string;
  }[];
}

export interface AuditLog {
  id: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValue: unknown;
  newValue: unknown;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

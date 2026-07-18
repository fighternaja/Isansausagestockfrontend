export type UserRole = 'admin' | 'user'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  must_change_password: boolean
  is_active: boolean
  created_at?: string
}

export interface Product {
  id: string
  name: string
  category: string | null
  unit: string
  quantity: number
  min_threshold: number | null
  created_at?: string
  updated_at?: string
}

export interface StockLog {
  id: string
  product_id: string
  user_id: string
  change_amount: number
  action_type: string
  quantity_before: number
  quantity_after: number
  note: string | null
  created_at: string
  profiles?: { full_name: string | null; email: string }
  products?: { name: string; unit: string }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiFetch<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Request failed')
  }
  return data as T
}

export { API_URL }

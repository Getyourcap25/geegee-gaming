import type { Database, RequestStatus } from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type District = Database["public"]["Tables"]["districts"]["Row"];
export type Request = Database["public"]["Tables"]["requests"]["Row"];

export type UserRole = "admin" | "client";

// Request met joined product + district naam
export interface RequestWithRelations extends Request {
  product: Pick<Product, "id" | "name" | "slug">;
  district: Pick<District, "id" | "name">;
  creator?: Pick<Profile, "id" | "full_name" | "email">;
}

// Dashboard stats
export interface DashboardStats {
  total: number;
  pending: number;
  approved: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  conflicts: number;
}

// Beschikbaarheid per product
export interface ProductAvailability {
  product: Product;
  totalInventory: number;
  reserved: number;
  available: number;
  hasConflict: boolean;
}

// Filter state voor aanvragentabel
export interface RequestFilters {
  search: string;
  status: RequestStatus | "all";
  districtId: string | "all";
  productId: string | "all";
}

// Form data voor nieuwe aanvraag
export interface NewRequestFormData {
  product_id: string;
  quantity: number;
  district_id: string;
  location: string;
  requested_by_name: string;
  requested_by_email: string;
  requested_by_phone: string;
  organization: string;
  preferred_date: string;
  end_date: string;
  notes: string;
}

// Form data voor admin bewerking
export interface EditRequestFormData {
  status: RequestStatus;
  quantity: number;
  preferred_date: string;
  end_date: string;
  internal_notes: string;
  assigned_to_user_id: string | null;
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "Openstaand",
  approved: "Goedgekeurd",
  scheduled: "Gepland",
  completed: "Afgerond",
  cancelled: "Geannuleerd",
};

export const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  scheduled: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-600",
};

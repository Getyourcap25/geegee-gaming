import { createClient } from "@/lib/supabase/server";
import { datesOverlap } from "@/lib/utils";
import type {
  RequestWithRelations,
  DashboardStats,
  ProductAvailability,
  RequestFilters,
} from "@/types/app";
import type { RequestStatus } from "@/types/database";

// ============================================================
// PRODUCTS
// ============================================================

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw new Error(`Producten ophalen mislukt: ${error.message}`);
  return data;
}

// ============================================================
// DISTRICTS
// ============================================================

export async function getDistricts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("districts")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(`Wijken ophalen mislukt: ${error.message}`);
  return data;
}

// ============================================================
// REQUESTS
// ============================================================

const REQUEST_SELECT = `
  *,
  product:products(id, name, slug),
  district:districts(id, name),
  creator:profiles!created_by_user_id(id, full_name, email)
`;

export async function getRequests(
  filters?: Partial<RequestFilters>
): Promise<RequestWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("requests")
    .select(REQUEST_SELECT)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.districtId && filters.districtId !== "all") {
    query = query.eq("district_id", filters.districtId);
  }
  if (filters?.productId && filters.productId !== "all") {
    query = query.eq("product_id", filters.productId);
  }
  if (filters?.search) {
    const s = filters.search.trim();
    query = query.or(
      `reference_code.ilike.%${s}%,requested_by_name.ilike.%${s}%,location.ilike.%${s}%,organization.ilike.%${s}%`
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`Aanvragen ophalen mislukt: ${error.message}`);
  return (data ?? []) as unknown as RequestWithRelations[];
}

export async function getRequestById(
  id: string
): Promise<RequestWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select(REQUEST_SELECT)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as RequestWithRelations;
}

// ============================================================
// DASHBOARD STATS
// ============================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("requests")
    .select("status, product_id, quantity, preferred_date, end_date");

  if (error) throw new Error(`Stats ophalen mislukt: ${error.message}`);

  const rows = data ?? [];

  const stats: DashboardStats = {
    total: rows.length,
    pending: 0,
    approved: 0,
    scheduled: 0,
    completed: 0,
    cancelled: 0,
    conflicts: 0,
  };

  for (const row of rows) {
    const s = row.status as RequestStatus;
    if (s in stats) {
      (stats[s] as number)++;
    }
  }

  // Conflicten: producten ophalen voor voorraadcontrole
  const products = await getProducts();
  const activeRows = rows.filter(
    (r) => r.status === "approved" || r.status === "scheduled"
  );

  let conflictCount = 0;
  for (const product of products) {
    const productRows = activeRows.filter((r) => r.product_id === product.id);
    for (let i = 0; i < productRows.length; i++) {
      for (let j = i + 1; j < productRows.length; j++) {
        const a = productRows[i];
        const b = productRows[j];
        if (
          datesOverlap(
            a.preferred_date,
            a.end_date,
            b.preferred_date,
            b.end_date
          )
        ) {
          const totalOverlap = a.quantity + b.quantity;
          if (totalOverlap > product.inventory_total) {
            conflictCount++;
          }
        }
      }
    }
  }
  stats.conflicts = conflictCount;

  return stats;
}

// ============================================================
// BESCHIKBAARHEID
// ============================================================

export async function getProductAvailability(
  checkStart?: string,
  checkEnd?: string
): Promise<ProductAvailability[]> {
  const supabase = await createClient();

  const products = await getProducts();

  // Actieve aanvragen (goedgekeurd of gepland)
  const { data: activeRequests, error } = await supabase
    .from("requests")
    .select("product_id, quantity, preferred_date, end_date, status")
    .in("status", ["approved", "scheduled"]);

  if (error)
    throw new Error(`Beschikbaarheid ophalen mislukt: ${error.message}`);

  const rows = activeRequests ?? [];

  return products.map((product) => {
    const productRows = rows.filter((r) => r.product_id === product.id);

    // Filter op overlappende periode als checkStart/checkEnd opgegeven
    const overlapping = checkStart && checkEnd
      ? productRows.filter((r) =>
          datesOverlap(r.preferred_date, r.end_date, checkStart, checkEnd)
        )
      : productRows;

    const reserved = overlapping.reduce((sum, r) => sum + r.quantity, 0);
    const available = product.inventory_total - reserved;

    // Conflict: overlappende paren die samen boven voorraad komen
    let hasConflict = false;
    for (let i = 0; i < productRows.length; i++) {
      for (let j = i + 1; j < productRows.length; j++) {
        const a = productRows[i];
        const b = productRows[j];
        if (
          datesOverlap(
            a.preferred_date,
            a.end_date,
            b.preferred_date,
            b.end_date
          )
        ) {
          if (a.quantity + b.quantity > product.inventory_total) {
            hasConflict = true;
          }
        }
      }
    }

    return {
      product,
      totalInventory: product.inventory_total,
      reserved,
      available,
      hasConflict,
    };
  });
}

// ============================================================
// PROFILES (admin only)
// ============================================================

export async function getAdminProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, organization")
    .eq("role", "admin")
    .order("full_name");

  if (error) throw new Error(`Profielen ophalen mislukt: ${error.message}`);
  return data ?? [];
}

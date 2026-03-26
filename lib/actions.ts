"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { RequestStatus } from "@/types/database";

export interface UpdateRequestPayload {
  id: string;
  status: RequestStatus;
  quantity: number;
  preferred_date: string;
  end_date: string;
  internal_notes: string | null;
}

export async function updateRequest(
  payload: UpdateRequestPayload
): Promise<{ error: string | null }> {
  // Server-side auth check
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase
    .from("requests")
    .update({
      status: payload.status,
      quantity: payload.quantity,
      preferred_date: payload.preferred_date,
      end_date: payload.end_date,
      internal_notes: payload.internal_notes,
    })
    .eq("id", payload.id);

  if (error) return { error: error.message };

  revalidatePath("/beheer");
  revalidatePath("/aanvragen");
  revalidatePath("/");

  return { error: null };
}

// ============================================================
// PRODUCT BEHEER
// ============================================================

export async function updateProductInventory(
  productId: string,
  inventoryTotal: number
): Promise<{ error: string | null }> {
  await requireAdmin();

  if (inventoryTotal < 0)
    return { error: "Voorraad kan niet negatief zijn." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .update({ inventory_total: inventoryTotal })
    .eq("id", productId);

  if (error) return { error: error.message };

  revalidatePath("/beheer");
  revalidatePath("/planning");
  revalidatePath("/");

  return { error: null };
}

export async function addProductAdjustment(payload: {
  productId: string;
  quantity: number;   // negatief voor aftrek, positief voor toevoeging
  reason: string;
  userId: string;
}): Promise<{ error: string | null }> {
  await requireAdmin();

  if (!payload.reason.trim())
    return { error: "Reden is verplicht." };

  if (payload.quantity === 0)
    return { error: "Aantal mag niet 0 zijn." };

  const supabase = await createClient();

  const { error } = await supabase.from("product_adjustments").insert({
    product_id: payload.productId,
    quantity: payload.quantity,
    reason: payload.reason.trim(),
    created_by_user_id: payload.userId,
  });

  if (error) return { error: error.message };

  revalidatePath("/beheer");
  revalidatePath("/planning");
  revalidatePath("/");

  return { error: null };
}

export async function updateProductAdjustment(payload: {
  id: string;
  quantity: number;
  reason: string;
}): Promise<{ error: string | null }> {
  await requireAdmin();

  if (!payload.reason.trim()) return { error: "Reden is verplicht." };
  if (payload.quantity === 0) return { error: "Aantal mag niet 0 zijn." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("product_adjustments")
    .update({ quantity: payload.quantity, reason: payload.reason.trim() })
    .eq("id", payload.id);

  if (error) return { error: error.message };

  revalidatePath("/beheer");
  revalidatePath("/planning");
  revalidatePath("/");

  return { error: null };
}

export async function deleteProductAdjustment(
  adjustmentId: string
): Promise<{ error: string | null }> {
  await requireAdmin();

  const supabase = await createClient();

  const { error } = await supabase
    .from("product_adjustments")
    .delete()
    .eq("id", adjustmentId);

  if (error) return { error: error.message };

  revalidatePath("/beheer");
  revalidatePath("/planning");
  revalidatePath("/");

  return { error: null };
}

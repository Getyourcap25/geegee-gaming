"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { RequestStatus } from "@/types/database";
import {
  sendNewRequestAdminEmail,
  sendNewRequestConfirmationEmail,
  sendStatusUpdateEmail,
} from "@/lib/email";

export interface UpdateRequestPayload {
  id: string;
  status: RequestStatus;
  quantity: number;
  preferred_date: string;
  end_date: string;
  internal_notes: string | null;
  // Voor mail — meegeven vanuit de dialog
  previousStatus: RequestStatus;
  requestedByEmail: string;
  requestedByName: string;
  productName: string;
  districtName: string;
  notes: string | null;
  referenceCode: string;
}

export async function updateRequest(
  payload: UpdateRequestPayload
): Promise<{ error: string | null }> {
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

  // Stuur mail als status gewijzigd is
  if (payload.status !== payload.previousStatus) {
    try {
      await sendStatusUpdateEmail({
        referenceCode: payload.referenceCode,
        requestedByName: payload.requestedByName,
        requestedByEmail: payload.requestedByEmail,
        productName: payload.productName,
        quantity: payload.quantity,
        districtName: payload.districtName,
        preferredDate: payload.preferred_date,
        endDate: payload.end_date,
        newStatus: payload.status,
        notes: payload.notes,
      });
    } catch (mailErr) {
      // Mail fout mag de opslag niet blokkeren
      console.error("Mail versturen mislukt:", mailErr);
    }
  }

  revalidatePath("/beheer");
  revalidatePath("/aanvragen");
  revalidatePath("/");

  return { error: null };
}

// ============================================================
// NIEUWE AANVRAAG indienen (server action)
// ============================================================

export interface SubmitRequestPayload {
  product_id: string;
  quantity: number;
  district_id: string;
  location: string;
  requested_by_name: string;
  requested_by_email: string;
  requested_by_phone: string | null;
  organization: string | null;
  preferred_date: string;
  end_date: string;
  notes: string | null;
  // Voor mail
  productName: string;
  districtName: string;
}

export async function submitRequest(
  payload: SubmitRequestPayload
): Promise<{ error: string | null; referenceCode?: string }> {
  const { userId } = await requireAuth();

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("requests")
    .insert({
      product_id: payload.product_id,
      quantity: payload.quantity,
      district_id: payload.district_id,
      location: payload.location,
      requested_by_name: payload.requested_by_name,
      requested_by_email: payload.requested_by_email,
      requested_by_phone: payload.requested_by_phone,
      organization: payload.organization,
      preferred_date: payload.preferred_date,
      end_date: payload.end_date,
      notes: payload.notes,
      created_by_user_id: userId,
    })
    .select("reference_code")
    .single();

  if (error) return { error: error.message };

  const referenceCode = data.reference_code;

  // Mails versturen (niet-blokkerend)
  try {
    await Promise.all([
      sendNewRequestAdminEmail({
        referenceCode,
        requestedByName: payload.requested_by_name,
        requestedByEmail: payload.requested_by_email,
        requestedByPhone: payload.requested_by_phone,
        organization: payload.organization,
        productName: payload.productName,
        quantity: payload.quantity,
        districtName: payload.districtName,
        location: payload.location,
        preferredDate: payload.preferred_date,
        endDate: payload.end_date,
        notes: payload.notes,
      }),
      sendNewRequestConfirmationEmail({
        referenceCode,
        requestedByName: payload.requested_by_name,
        requestedByEmail: payload.requested_by_email,
        productName: payload.productName,
        quantity: payload.quantity,
        districtName: payload.districtName,
        location: payload.location,
        preferredDate: payload.preferred_date,
        endDate: payload.end_date,
      }),
    ]);
  } catch (mailErr) {
    console.error("Mail versturen mislukt:", mailErr);
  }

  revalidatePath("/aanvragen");
  revalidatePath("/");

  return { error: null, referenceCode };
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

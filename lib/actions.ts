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

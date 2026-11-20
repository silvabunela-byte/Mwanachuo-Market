import { supabase } from "@/lib/supabase";
import type { Listing } from "@/types/database";

export type ManageStatus = "ok" | "invalid" | "locked";

export interface ManageLoginResult {
  status: ManageStatus;
  listings: Listing[];
}

export interface ListingEditInput {
  listingId: string;
  phone: string;
  pin: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  campus: string;
  seller: string;
  newPhone: string;
  images: string[];
}

function toStatus(value: unknown): ManageStatus {
  return value === "ok" || value === "locked" ? value : "invalid";
}

/** Kuingia kwa namba ya WhatsApp + PIN; hurudisha matangazo ya mtumiaji. */
export async function manageLogin(
  phone: string,
  pin: string
): Promise<ManageLoginResult> {
  const { data, error } = await supabase.rpc("manage_login", {
    p_phone: phone,
    p_pin: pin,
  });
  if (error) throw new Error(error.message);
  const d = (data ?? {}) as { status?: unknown; listings?: unknown };
  const status = toStatus(d.status);
  return {
    status,
    listings:
      status === "ok" && Array.isArray(d.listings)
        ? (d.listings as Listing[])
        : [],
  };
}

export async function manageUpdate(
  input: ListingEditInput
): Promise<ManageStatus> {
  const { data, error } = await supabase.rpc("manage_update_listing", {
    p_listing_id: input.listingId,
    p_phone: input.phone,
    p_pin: input.pin,
    p_title: input.title,
    p_description: input.description,
    p_price: input.price,
    p_category: input.category,
    p_condition: input.condition,
    p_campus: input.campus,
    p_seller: input.seller,
    p_new_phone: input.newPhone,
    p_images: input.images,
  });
  if (error) throw new Error(error.message);
  return toStatus(data);
}

export async function manageDelete(
  listingId: string,
  phone: string,
  pin: string
): Promise<ManageStatus> {
  const { data, error } = await supabase.rpc("manage_delete_listing", {
    p_listing_id: listingId,
    p_phone: phone,
    p_pin: pin,
  });
  if (error) throw new Error(error.message);
  return toStatus(data);
}

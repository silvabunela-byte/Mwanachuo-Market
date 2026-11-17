import { supabase } from "@/lib/supabase";
import { STORAGE_BUCKET } from "@/lib/config";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Hupakia picha kwenye bucket `product-images` na kurudisha public URL. */
export async function uploadImage(
  file: File,
  folder = "listings"
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error(`"${file.name}" si picha.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`"${file.name}" ni kubwa kuliko MB 5.`);
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
  if (error) throw new Error(`Imeshindwa kupakia picha: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

import { supabase } from "./supabase";

export const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
export const MAX_MB = 5;

export async function uploadReference(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Use a JPG, PNG or WEBP image");
  if (file.size > MAX_MB * 1024 * 1024) throw new Error(`Image must be under ${MAX_MB} MB`);
  const ext = file.type.split("/")[1];
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("reference-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from("reference-images").getPublicUrl(path).data.publicUrl;
}

import { supabase } from "./supabase";

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const OK = ["image/jpeg", "image/png", "image/webp"];

export async function uploadImage(file: File, folder: "products" | "categories"): Promise<string> {
  if (!OK.includes(file.type)) throw new Error("Use JPG, PNG or WEBP images");
  if (file.size > 5 * 1024 * 1024) throw new Error("Each image must be under 5 MB");
  const path = `${folder}/${crypto.randomUUID()}.${file.type.split("/")[1]}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
}

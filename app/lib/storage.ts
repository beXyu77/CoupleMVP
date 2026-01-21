import { supabase } from "./supabase";

export const publicAvatarUrl = (pathOrUrl: string | null | undefined) => {
  if (!pathOrUrl) return null;

  // If already a full URL, return it.
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;

  // Otherwise treat it as storage path
  const { data } = supabase.storage.from("avatars").getPublicUrl(pathOrUrl);
  return data.publicUrl;
};
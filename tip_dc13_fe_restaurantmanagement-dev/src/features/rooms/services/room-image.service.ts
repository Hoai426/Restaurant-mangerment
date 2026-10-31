import { supabase } from "@/lib/supabase/client";
import { validateImageFile } from "@/utils/image-validation";

/**
 * Uploads a room image to Supabase Storage with an optimized short filename
 * to ensure the resulting public URL stays <= 100 characters.
 * This guarantees compatibility with backend RoomUpdateRequest (@Size(max = 100))
 * without needing backend modifications.
 */
export async function uploadRoomImage(file: File): Promise<string> {
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const rawExt = file.name.split(".").pop() || "jpg";
  // Normalize jpeg to jpg to save 1 character
  const extension = rawExt.toLowerCase() === "jpeg" ? "jpg" : rawExt.toLowerCase();

  // Generate short unique filename: base36 timestamp (8 chars) + 4-char random (4 chars) + .ext (4 chars) = ~16 chars
  const shortId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  const filePath = `rooms/${shortId}.${extension}`;

  const { error } = await supabase.storage
    .from("room-images")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("room-images").getPublicUrl(filePath);

  return data.publicUrl;
}

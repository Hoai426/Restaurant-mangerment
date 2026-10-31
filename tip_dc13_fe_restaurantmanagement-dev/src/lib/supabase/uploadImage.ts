import { supabase } from "@/lib/supabase/client";
import { validateImageFile } from "@/utils/image-validation";

export interface UploadImageOptions {
  /** Tên bucket Supabase Storage (ví dụ: "dish-images", "room-images") */
  bucket: string;
  /** Tên folder trong bucket (ví dụ: "dishes", "rooms") */
  folder: string;
}

/**
 * Shared Supabase image upload utility.
 *
 * Validates file type and size, generates a UUID filename,
 * uploads to the specified bucket/folder, and returns the public URL.
 *
 * Usage:
 *   uploadImage(file, { bucket: "dish-images", folder: "dishes" })
 *   uploadImage(file, { bucket: "room-images", folder: "rooms" })
 */
export async function uploadImage(
  file: File,
  options: UploadImageOptions
): Promise<string> {
  const { bucket, folder } = options;

  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const extension = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${extension}`;
  const filePath = `${folder}/${fileName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return data.publicUrl;
}

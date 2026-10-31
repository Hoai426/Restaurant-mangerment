export interface ImageValidationOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const DEFAULT_MAX_SIZE_MB = 5;

/**
 * Validates an image file for supported MIME types and size limit.
 * Returns an error message string if invalid, or null if valid.
 */
export function validateImageFile(
  file: File,
  options?: ImageValidationOptions
): string | null {
  const maxSizeMB = options?.maxSizeMB ?? DEFAULT_MAX_SIZE_MB;
  const allowedTypes = options?.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

  if (!file.type.startsWith("image/") || !allowedTypes.includes(file.type)) {
    return "Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP).";
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `Dung lượng hình ảnh không được vượt quá ${maxSizeMB}MB.`;
  }

  return null;
}

/**
 * Checks whether an image URL should bypass Next.js image optimization
 * (e.g., local blob previews or Supabase public storage URLs that are already CDN-served).
 */
export function isDirectUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith("blob:") || url.includes(".supabase.co/storage/v1/object/public/");
}

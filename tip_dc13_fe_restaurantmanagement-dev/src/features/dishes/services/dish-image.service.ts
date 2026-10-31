import { uploadImage } from '@/lib/supabase/uploadImage'

export function uploadDishImage(file: File): Promise<string> {
  return uploadImage(file, { bucket: 'dish-images', folder: 'dishes' })
}

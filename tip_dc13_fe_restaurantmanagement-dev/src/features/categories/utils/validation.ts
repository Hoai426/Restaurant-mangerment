import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên danh mục không được để trống")
    .max(100, "Tên danh mục tối đa 100 ký tự"),
  description: z
    .string()
    .trim()
    .max(255, "Mô tả tối đa 255 ký tự")
    .optional(),
});

export type CategoryCreateFormData = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên danh mục không được để trống")
    .max(100, "Tên danh mục tối đa 100 ký tự"),
  description: z
    .string()
    .trim()
    .max(255, "Mô tả tối đa 255 ký tự")
    .optional(),
});

export type CategoryUpdateFormData = z.infer<typeof categoryUpdateSchema>;


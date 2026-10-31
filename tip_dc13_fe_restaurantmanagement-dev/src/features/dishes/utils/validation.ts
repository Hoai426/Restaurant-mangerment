import { z } from "zod";

export const dishCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên món ăn không được để trống")
    .max(150, "Tên món ăn tối đa 150 ký tự"),
  price: z
    .number({ message: "Giá món ăn phải lớn hơn 0" })
    .gt(0, "Giá món ăn phải lớn hơn 0"),
  categoryIds: z
    .array(z.number())
    .min(1, "Vui lòng chọn ít nhất một danh mục"),
  description: z
    .string()
    .trim()
    .max(65535, "Mô tả quá dài")
    .optional(),
});

export type DishCreateFormData = z.infer<typeof dishCreateSchema>;

export const dishUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Tên món ăn không được để trống")
    .max(150, "Tên món ăn tối đa 150 ký tự"),
  price: z
    .number({ message: "Giá món ăn phải lớn hơn 0" })
    .gt(0, "Giá món ăn phải lớn hơn 0"),
  categoryIds: z
    .array(z.number())
    .min(1, "Vui lòng chọn ít nhất một danh mục"),
  description: z
    .string()
    .trim()
    .max(65535, "Mô tả quá dài")
    .optional(),
  imageUrl: z
    .string()
    .max(500, "Đường dẫn ảnh tối đa 500 ký tự")
    .optional(),
});

export type DishUpdateFormData = z.infer<typeof dishUpdateSchema>;

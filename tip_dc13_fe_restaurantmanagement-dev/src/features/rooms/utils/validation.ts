import { z } from "zod";

export const roomCreateSchema = z.object({
  categoryId: z
    .number({
      message: "Vui lòng chọn loại phòng",
    })
    .refine((val) => !Number.isNaN(val), {
      message: "Vui lòng chọn loại phòng",
    })
    .refine(Number.isInteger, {
      message: "Mã loại phòng phải là số nguyên",
    }),
  name: z
    .string()
    .trim()
    .min(1, "Tên phòng không được để trống")
    .max(100, "Tên phòng tối đa 100 ký tự"),
  description: z
    .string()
    .trim()
    .max(100, "Mô tả tối đa 100 ký tự")
    .optional(),
});

export type RoomCreateFormData = z.infer<typeof roomCreateSchema>;

export const roomUpdateSchema = z.object({
  categoryId: z
    .number({
      message: "Vui lòng chọn loại phòng hợp lệ",
    })
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "Vui lòng chọn loại phòng hợp lệ",
    })
    .refine((val) => val === undefined || Number.isInteger(val), {
      message: "Mã loại phòng phải là số nguyên",
    })
    .optional(),
  name: z
    .string()
    .trim()
    .max(100, "Tên phòng tối đa 100 ký tự")
    .optional(),
  description: z
    .string()
    .trim()
    .max(100, "Mô tả tối đa 100 ký tự")
    .optional(),
});

export type RoomUpdateFormData = z.infer<typeof roomUpdateSchema>;

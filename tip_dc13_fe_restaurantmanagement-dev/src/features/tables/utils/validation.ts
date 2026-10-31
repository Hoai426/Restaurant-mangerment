import { z } from "zod";

export const tableBaseSchema = z.object({
  roomId: z
    .number({
      message: "Vui lòng chọn phòng ăn",
    })
    .int("Mã phòng phải là số nguyên")
    .positive("Vui lòng chọn phòng ăn"),
  tableNumber: z
    .string({
      message: "Số bàn không được để trống",
    })
    .trim()
    .min(1, "Số bàn không được để trống")
    .max(20, "Số bàn tối đa 20 ký tự"),
  capacity: z
    .number({
      message: "Sức chứa không được để trống",
    })
    .int("Sức chứa phải là số nguyên")
    .positive("Sức chứa phải lớn hơn 0"),
});

export const tableCreateSchema = tableBaseSchema;
export type TableCreateFormData = z.infer<typeof tableCreateSchema>;

export const tableUpdateSchema = tableBaseSchema.partial();
export type TableUpdateFormData = z.infer<typeof tableUpdateSchema>;

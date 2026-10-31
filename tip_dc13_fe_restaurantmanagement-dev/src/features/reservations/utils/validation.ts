import { z } from "zod";
import type { ReservationUpdateRequest } from "@/types/reservation";

export function getLocalTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const reservationCreateSchema = z
  .object({
    tableIds: z
      .array(z.number().int().positive())
      .min(1, "Vui lòng chọn ít nhất một bàn ăn"),
    customerPhone: z
      .string()
      .trim()
      .min(1, "Số điện thoại không được để trống")
      .max(20, "Số điện thoại tối đa 20 ký tự"),
    customerName: z
      .string()
      .trim()
      .min(1, "Tên khách hàng không được để trống")
      .max(100, "Tên khách hàng tối đa 100 ký tự"),
    reservationDate: z
      .string()
      .min(1, "Vui lòng chọn ngày đặt bàn")
      .refine(
        (val) => val >= getLocalTodayString(),
        "Ngày đặt bàn phải từ hôm nay trở đi"
      ),
    startTime: z
      .string()
      .min(1, "Vui lòng chọn giờ bắt đầu")
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
    endTime: z
      .string()
      .min(1, "Vui lòng chọn giờ kết thúc")
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Định dạng giờ không hợp lệ (HH:mm)"),
    numberOfGuests: z
      .number({ message: "Số lượng khách phải là số hợp lệ" })
      .int("Số lượng khách phải là số nguyên")
      .min(1, "Số lượng khách tối thiểu là 1 người"),
    note: z
      .string()
      .trim()
      .max(500, "Ghi chú tối đa 500 ký tự")
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return data.endTime > data.startTime;
    },
    {
      message: "Giờ kết thúc phải sau giờ bắt đầu",
      path: ["endTime"],
    }
  );

export type ReservationCreateFormData = z.infer<typeof reservationCreateSchema>;

export const reservationUpdateSchema = reservationCreateSchema;

export type ReservationUpdateFormData = z.infer<typeof reservationUpdateSchema>;

export interface NormalizedReservationData {
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  numberOfGuests: number;
  note: string | null;
  tableIds: number[];
}

export function areTableIdSetsEqual(a: number[], b: number[]): boolean {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size !== setB.size) return false;
  for (const id of setA) {
    if (!setB.has(id)) return false;
  }
  return true;
}

export function buildDirtyPatchPayload(
  formData: ReservationUpdateFormData,
  initialData: NormalizedReservationData
): ReservationUpdateRequest | null {
  const payload: ReservationUpdateRequest = {};

  if (formData.customerName.trim() !== initialData.customerName.trim()) {
    payload.customerName = formData.customerName.trim();
  }

  if (formData.customerPhone.trim() !== initialData.customerPhone.trim()) {
    payload.customerPhone = formData.customerPhone.trim();
  }

  if (formData.reservationDate !== initialData.reservationDate) {
    payload.reservationDate = formData.reservationDate;
  }

  if (formData.startTime !== initialData.startTime) {
    payload.startTime = formData.startTime;
  }

  if (formData.endTime !== initialData.endTime) {
    payload.endTime = formData.endTime;
  }

  if (Number(formData.numberOfGuests) !== Number(initialData.numberOfGuests)) {
    payload.numberOfGuests = Number(formData.numberOfGuests);
  }

  const currentNote = formData.note?.trim() || null;
  const initialNote = initialData.note?.trim() || null;
  if (currentNote !== initialNote) {
    payload.note = currentNote;
  }

  if (!areTableIdSetsEqual(formData.tableIds, initialData.tableIds)) {
    payload.tableIds = Array.from(new Set(formData.tableIds));
  }

  if (Object.keys(payload).length === 0) {
    return null;
  }

  return payload;
}

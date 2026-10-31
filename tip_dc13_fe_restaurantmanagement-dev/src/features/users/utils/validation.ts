import { z } from "zod";


// Common Regex
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const phoneRegex = /^[0-9]{10,11}$/;

// Shared Password Validation
// RM-15 requirement: 8+ chars, uppercase, lowercase, number, special char.
export const passwordSchema = z
  .string()
  .min(1, { message: "Mật khẩu không được để trống" })
  .min(8, { message: "Mật khẩu phải có ít nhất 8 ký tự" })
  .max(100, { message: "Mật khẩu tối đa 100 ký tự" })
  .regex(/[A-Z]/, { message: "Phải có chữ hoa" })
  .regex(/[a-z]/, { message: "Phải có chữ thường" })
  .regex(/[0-9]/, { message: "Phải có số" })
  .regex(/[\W_]/, { message: "Phải có ký tự đặc biệt" });

// Shared Username Validation (only English alphabet letters A-Z, a-z, 3-50 chars)
export const usernameSchema = z
  .string()
  .min(1, { message: "Tên đăng nhập không được để trống" })
  .min(3, { message: "Tên đăng nhập phải có độ dài từ 3–50 ký tự" })
  .max(50, { message: "Tên đăng nhập phải có độ dài từ 3–50 ký tự" })
  .regex(/^[A-Za-z]+$/, {
    message: "Tên đăng nhập chỉ được chứa chữ cái A-Z hoặc a-z",
  });

// Schema for Create User (RM-14 preserved payload)
export const userCreateSchema = z.object({
  username: usernameSchema,
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Họ và tên không được để trống" })
    .max(100, { message: "Họ tên tối đa 100 ký tự" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không hợp lệ" })
    .max(100, { message: "Email tối đa 100 ký tự" }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Số điện thoại không được để trống" })
    .regex(phoneRegex, { message: "Số điện thoại phải gồm 10 đến 11 chữ số" }),
  password: passwordSchema,
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"] as const, {
    message: "Vai trò không hợp lệ",
  }),
  isActive: z.boolean(),
});

// Schema for Edit User (Admin changing other users' non-password fields)
export const userEditSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Họ và tên không được để trống" })
    .max(100, { message: "Họ tên tối đa 100 ký tự" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không hợp lệ" })
    .max(100, { message: "Email tối đa 100 ký tự" }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Số điện thoại không được để trống" })
    .regex(phoneRegex, { message: "Số điện thoại phải gồm 10 đến 11 chữ số" }),
  role: z.enum(["ADMIN", "STAFF", "CUSTOMER"] as const, {
    message: "Vai trò không hợp lệ",
  }),
  isActive: z.boolean(),
});

// Schema for Profile (User changing their own basic info)
export const userProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: "Họ và tên không được để trống" })
    .max(100, { message: "Họ tên tối đa 100 ký tự" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email không được để trống" })
    .email({ message: "Email không hợp lệ" })
    .max(100, { message: "Email tối đa 100 ký tự" }),
  phone: z
    .string()
    .trim()
    .min(1, { message: "Số điện thoại không được để trống" })
    .regex(phoneRegex, { message: "Số điện thoại phải gồm 10 đến 11 chữ số" }),
});

// Schema for Change Password
export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, { message: "Vui lòng xác nhận mật khẩu" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

// Shared runtime helper for Change Password checklist (UX realtime display)
export function getPasswordUnmetCriteria(password: string): string | null {
  if (!password) return null;
  const criteria = [
    { label: "Ít nhất 8 ký tự", met: password.length >= 8 },
    { label: "Có chữ hoa", met: /[A-Z]/.test(password) },
    { label: "Có chữ thường", met: /[a-z]/.test(password) },
    { label: "Có số", met: /[0-9]/.test(password) },
    { label: "Có ký tự đặc biệt", met: /[\W_]/.test(password) },
  ];
  const unmet = criteria.find((c) => !c.met);
  return unmet ? unmet.label : null;
}

// Schema for Self Change Password (RM-20)
export const changeMyPasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { message: "Mật khẩu hiện tại không được để trống" }),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { message: "Vui lòng xác nhận mật khẩu mới" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Xác nhận mật khẩu không khớp",
    path: ["confirmPassword"],
  });

// Shared runtime helper for Password Strength Meter (UX realtime display)
export function getPasswordStrength(pw: string): { level: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { level: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[\W_]/.test(pw)) score++; // Updated regex to match the RM-15 requirements correctly
  if (score === 1) return { level: 1, label: "Yếu" };
  if (score === 2) return { level: 2, label: "Trung bình" };
  if (score === 3) return { level: 3, label: "Mạnh" };
  return { level: 1, label: "Yếu" };
}

// Schema for Customer Registration (RM-13)
export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, { message: "Tên đăng nhập không được để trống" })
      .min(3, { message: "Tên đăng nhập phải có độ dài từ 3–50 ký tự" })
      .max(50, { message: "Tên đăng nhập phải có độ dài từ 3–50 ký tự" }),
    fullName: z
      .string()
      .trim()
      .min(1, { message: "Họ và tên không được để trống" })
      .max(100, { message: "Họ tên tối đa 100 ký tự" }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Email không được để trống" })
      .email({ message: "Email không hợp lệ" })
      .max(100, { message: "Email tối đa 100 ký tự" }),
    phone: z
      .string()
      .trim()
      .min(1, { message: "Số điện thoại không được để trống" })
      .regex(phoneRegex, { message: "Số điện thoại phải gồm 10 đến 11 chữ số" }),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, { message: "Vui lòng nhập lại mật khẩu" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại không khớp",
    path: ["confirmPassword"],
  });


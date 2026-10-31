import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string({
      error: "NEXT_PUBLIC_API_URL là bắt buộc",
    })
    .trim()
    .min(1, "NEXT_PUBLIC_API_URL không được để trống")
    .url("NEXT_PUBLIC_API_URL phải là một URL hợp lệ"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string({
      error: "NEXT_PUBLIC_SUPABASE_URL là bắt buộc",
    })
    .trim()
    .min(1, "NEXT_PUBLIC_SUPABASE_URL không được để trống")
    .url("NEXT_PUBLIC_SUPABASE_URL phải là một URL hợp lệ"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string({
      error: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY là bắt buộc",
    })
    .trim()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY không được để trống"),
});

// Explicit property access allows Next.js compiler to inline NEXT_PUBLIC_* variables into client bundles
const rawEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
};

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const issues = parsed.error.issues;
  const formattedErrors = issues
    .map((issue) => `  ❌ [${issue.path.join(".") || "ENV"}]: ${issue.message}`)
    .join("\n");

  const errorMessage = `\n==================================================\n[ENV CONFIG ERROR] Biến môi trường không hợp lệ hoặc bị thiếu:\n${formattedErrors}\n==================================================\n`;

  console.error(errorMessage);
  throw new Error(errorMessage);
}

export const env = {
  API_URL: parsed.data.NEXT_PUBLIC_API_URL,
  SUPABASE_URL: parsed.data.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY: parsed.data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
} as const;

export type Env = typeof env;

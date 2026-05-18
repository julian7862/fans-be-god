import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少 6 個字元'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
  displayName: z.string().min(1, '請輸入顯示名稱'),
  password: z.string().min(6, '密碼至少 6 個字元'),
  confirmPassword: z.string().min(6, '請再次輸入密碼'),
}).refine(data => data.password === data.confirmPassword, {
  message: '兩次密碼不一致',
  path: ['confirmPassword'],
})

export type SignupInput = z.infer<typeof signupSchema>

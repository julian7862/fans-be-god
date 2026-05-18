import { z } from 'zod'

export const createGroupSchema = z.object({
  name: z.string().min(1, '請輸入小組名稱').max(50, '名稱不可超過 50 字'),
  description: z.string().max(200, '描述不可超過 200 字').optional(),
})

export type CreateGroupInput = z.infer<typeof createGroupSchema>

export const inviteMemberSchema = z.object({
  email: z.string().email('請輸入有效的 Email'),
})

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>

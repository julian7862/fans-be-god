'use server'

import { createClient } from '@/lib/supabase/server'
import { createGroup, inviteMember } from '@/lib/group/service'
import { createGroupSchema, inviteMemberSchema } from '@/lib/validation/groupSchema'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createGroupAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const parsed = createGroupSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || undefined,
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const result = await createGroup(parsed.data.name, parsed.data.description, user.id, supabase)

  if (!result.success) return { error: result.error }

  revalidatePath('/groups')
  redirect(`/groups/${result.data.id}`)
}

export async function inviteMemberAction(groupId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '請先登入' }

  const parsed = inviteMemberSchema.safeParse({
    email: formData.get('email'),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const result = await inviteMember(groupId, parsed.data.email, user.id, supabase)

  if (!result.success) return { error: result.error }

  revalidatePath(`/groups/${groupId}`)
  return { success: true, message: result.data.message }
}

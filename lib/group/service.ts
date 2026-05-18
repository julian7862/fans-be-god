import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Group, GroupMemberWithUser, GroupWithMemberCount } from '@/types/group'

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createGroup(
  name: string,
  description: string | undefined,
  userId: string,
  supabase?: SupabaseClient
): Promise<Result<Group>> {
  const client = supabase ?? await createClient()

  const { data: group, error: groupError } = await client
    .from('groups')
    .insert({ name, description: description ?? null, owner_id: userId })
    .select()
    .single()

  if (groupError) return { success: false, error: groupError.message }

  const { error: memberError } = await client
    .from('group_members')
    .insert({ group_id: group.id, user_id: userId, role: 'owner' })

  if (memberError) return { success: false, error: memberError.message }

  return { success: true, data: group }
}

export async function getGroupsForUser(
  userId: string,
  supabase?: SupabaseClient
): Promise<Result<GroupWithMemberCount[]>> {
  const client = supabase ?? await createClient()

  // Single RPC call — replaces 3 sequential queries
  // Falls back to multi-query approach if RPC doesn't exist yet
  const { data, error } = await client.rpc('get_groups_for_user', { p_user_id: userId })

  if (error) {
    // Fallback: if RPC not deployed yet, use parallel queries
    if (error.code === '42883') {
      return getGroupsForUserFallback(userId, client)
    }
    return { success: false, error: error.message }
  }

  return { success: true, data: (data ?? []) as GroupWithMemberCount[] }
}

async function getGroupsForUserFallback(
  userId: string,
  client: SupabaseClient
): Promise<Result<GroupWithMemberCount[]>> {
  const { data: memberships, error: memError } = await client
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)

  if (memError) return { success: false, error: memError.message }

  const groupIds = memberships.map(m => m.group_id)
  if (groupIds.length === 0) return { success: true, data: [] }

  const [groupsResult, countsResult] = await Promise.all([
    client.from('groups').select('*').in('id', groupIds).order('created_at', { ascending: false }),
    client.from('group_members').select('group_id').in('group_id', groupIds),
  ])

  if (groupsResult.error) return { success: false, error: groupsResult.error.message }
  if (countsResult.error) return { success: false, error: countsResult.error.message }

  const countMap = new Map<string, number>()
  for (const row of countsResult.data) {
    countMap.set(row.group_id, (countMap.get(row.group_id) ?? 0) + 1)
  }

  return {
    success: true,
    data: groupsResult.data.map(g => ({ ...g, member_count: countMap.get(g.id) ?? 0 })),
  }
}

export async function getGroupById(
  groupId: string,
  userId: string,
  supabase?: SupabaseClient
): Promise<Result<GroupWithMemberCount>> {
  const client = supabase ?? await createClient()

  const { data: membership } = await client
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (!membership) return { success: false, error: '你沒有權限查看此小組' }

  const { data: group, error: groupError } = await client
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single()

  if (groupError) return { success: false, error: groupError.message }

  const { count } = await client
    .from('group_members')
    .select('*', { count: 'exact', head: true })
    .eq('group_id', groupId)

  return {
    success: true,
    data: { ...group, member_count: count ?? 0 },
  }
}

export async function getGroupMembers(
  groupId: string,
  supabase?: SupabaseClient
): Promise<Result<GroupMemberWithUser[]>> {
  const client = supabase ?? await createClient()

  const { data, error } = await client
    .from('group_members')
    .select('*, users(display_name, email, avatar_url)')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true })

  if (error) return { success: false, error: error.message }

  return { success: true, data: data as GroupMemberWithUser[] }
}

export async function inviteMember(
  groupId: string,
  email: string,
  inviterUserId: string,
  supabase?: SupabaseClient
): Promise<Result<{ message: string }>> {
  const client = supabase ?? await createClient()

  const { data: inviterMembership } = await client
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', inviterUserId)
    .single()

  if (!inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
    return { success: false, error: '只有 Owner 或 Admin 可以邀請成員' }
  }

  const { data: targetUser } = await client
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!targetUser) {
    return { success: false, error: '找不到此 Email 的使用者，請確認對方已註冊' }
  }

  const { data: existing } = await client
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', targetUser.id)
    .single()

  if (existing) {
    return { success: false, error: '此成員已在小組中' }
  }

  const { error } = await client
    .from('group_members')
    .insert({ group_id: groupId, user_id: targetUser.id, role: 'member' })

  if (error) return { success: false, error: error.message }

  return { success: true, data: { message: '成員邀請成功' } }
}


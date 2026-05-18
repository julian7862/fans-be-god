import { describe, it, expect } from 'vitest'
import { createGroupSchema, inviteMemberSchema } from '@/lib/validation/groupSchema'

describe('createGroupSchema', () => {
  it('passes with name only', () => {
    const result = createGroupSchema.safeParse({ name: '投資小組' })
    expect(result.success).toBe(true)
  })

  it('passes with name and description', () => {
    const result = createGroupSchema.safeParse({ name: '投資小組', description: '我們的小組' })
    expect(result.success).toBe(true)
  })

  it('fails with empty name', () => {
    const result = createGroupSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('fails with name exceeding 50 chars', () => {
    const result = createGroupSchema.safeParse({ name: 'a'.repeat(51) })
    expect(result.success).toBe(false)
  })

  it('fails with description exceeding 200 chars', () => {
    const result = createGroupSchema.safeParse({ name: '投資小組', description: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })
})

describe('inviteMemberSchema', () => {
  it('passes with valid email', () => {
    const result = inviteMemberSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', () => {
    const result = inviteMemberSchema.safeParse({ email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('fails with empty email', () => {
    const result = inviteMemberSchema.safeParse({ email: '' })
    expect(result.success).toBe(false)
  })
})

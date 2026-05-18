import { describe, it, expect } from 'vitest'
import { loginSchema, signupSchema } from '@/lib/validation/authSchema'

describe('loginSchema', () => {
  it('passes with valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '123456' })
    expect(result.success).toBe(true)
  })

  it('fails with invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: '123456' })
    expect(result.success).toBe(false)
  })

  it('fails with empty email', () => {
    const result = loginSchema.safeParse({ email: '', password: '123456' })
    expect(result.success).toBe(false)
  })

  it('fails with short password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '123' })
    expect(result.success).toBe(false)
  })

  it('fails with empty password', () => {
    const result = loginSchema.safeParse({ email: 'test@example.com', password: '' })
    expect(result.success).toBe(false)
  })
})

describe('signupSchema', () => {
  const valid = {
    email: 'test@example.com',
    displayName: 'Test User',
    password: '123456',
    confirmPassword: '123456',
  }

  it('passes with valid data', () => {
    const result = signupSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('fails when passwords do not match', () => {
    const result = signupSchema.safeParse({ ...valid, confirmPassword: 'different' })
    expect(result.success).toBe(false)
  })

  it('fails with empty displayName', () => {
    const result = signupSchema.safeParse({ ...valid, displayName: '' })
    expect(result.success).toBe(false)
  })

  it('fails with short password', () => {
    const result = signupSchema.safeParse({ ...valid, password: '12', confirmPassword: '12' })
    expect(result.success).toBe(false)
  })
})

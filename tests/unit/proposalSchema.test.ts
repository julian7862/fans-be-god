import { describe, it, expect } from 'vitest'
import { createProposalSchema } from '@/lib/validation/proposalSchema'

describe('createProposalSchema', () => {
  const validBase = {
    ticker: '2330',
    stockName: '台積電',
    investmentThesis: '這是一個超過二十個字的買進邏輯說明，用來通過驗證',
    targetPrice: 1000,
    stopLossPrice: 800,
  }

  it('passes with all required fields + stopLossPrice', () => {
    const result = createProposalSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('passes with exitCondition instead of stopLossPrice', () => {
    const result = createProposalSchema.safeParse({
      ...validBase,
      stopLossPrice: undefined,
      exitCondition: '跌破月線出場',
    })
    expect(result.success).toBe(true)
  })

  it('fails when both stopLossPrice and exitCondition are missing', () => {
    const result = createProposalSchema.safeParse({
      ...validBase,
      stopLossPrice: undefined,
      exitCondition: undefined,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = result.error.flatten().fieldErrors
      expect(issues.exitCondition).toBeDefined()
    }
  })

  it('fails when ticker is empty', () => {
    const result = createProposalSchema.safeParse({ ...validBase, ticker: '' })
    expect(result.success).toBe(false)
  })

  it('fails when investmentThesis is too short', () => {
    const result = createProposalSchema.safeParse({ ...validBase, investmentThesis: '太短了' })
    expect(result.success).toBe(false)
  })

  it('fails when targetPrice is 0', () => {
    const result = createProposalSchema.safeParse({ ...validBase, targetPrice: 0 })
    expect(result.success).toBe(false)
  })

  it('fails when targetPrice is negative', () => {
    const result = createProposalSchema.safeParse({ ...validBase, targetPrice: -100 })
    expect(result.success).toBe(false)
  })

  it('fails when targetPrice is NaN', () => {
    const result = createProposalSchema.safeParse({ ...validBase, targetPrice: NaN })
    expect(result.success).toBe(false)
  })

  it('handles NaN stopLossPrice as undefined (optional)', () => {
    const result = createProposalSchema.safeParse({
      ...validBase,
      stopLossPrice: NaN,
      exitCondition: '跌破支撐出場',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.stopLossPrice).toBeUndefined()
    }
  })

  it('handles undefined proposalPrice gracefully', () => {
    const result = createProposalSchema.safeParse({
      ...validBase,
      proposalPrice: undefined,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.proposalPrice).toBeUndefined()
    }
  })

  it('handles NaN proposalPrice as undefined', () => {
    const result = createProposalSchema.safeParse({
      ...validBase,
      proposalPrice: NaN,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.proposalPrice).toBeUndefined()
    }
  })

  it('handles NaN expectedHoldingDays as undefined', () => {
    const result = createProposalSchema.safeParse({
      ...validBase,
      expectedHoldingDays: NaN,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.expectedHoldingDays).toBeUndefined()
    }
  })

  it('passes valid expectedHoldingDays', () => {
    const result = createProposalSchema.safeParse({
      ...validBase,
      expectedHoldingDays: 90,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.expectedHoldingDays).toBe(90)
    }
  })

  it('handles string inputs from FormData (server action scenario)', () => {
    // Server action converts strings to numbers before parsing
    // This test verifies the schema rejects raw strings
    const result = createProposalSchema.safeParse({
      ...validBase,
      targetPrice: '1000' as unknown,
    })
    // String '1000' should fail since schema expects number
    expect(result.success).toBe(false)
  })
})

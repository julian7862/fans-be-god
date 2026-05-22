import { z } from 'zod'

const optionalPositiveNumber = z
  .union([z.number(), z.nan()])
  .optional()
  .transform(v => (typeof v === 'number' && !isNaN(v) && v > 0) ? v : undefined)

const requiredPositiveNumber = z
  .union([z.number(), z.nan()])
  .refine(v => typeof v === 'number' && !isNaN(v) && v > 0, { message: '必須大於 0' })

export const createProposalSchema = z.object({
  ticker: z.string().min(1, '請輸入股票代號'),
  stockName: z.string().min(1, '請輸入股票名稱'),
  market: z.string().optional(),
  proposalPrice: optionalPositiveNumber,
  investmentThesis: z.string().min(20, '買進邏輯至少需要 20 個字'),
  targetPrice: requiredPositiveNumber,
  stopLossPrice: optionalPositiveNumber,
  exitCondition: z.string().optional(),
  expectedHoldingDays: z.union([z.number(), z.nan()]).optional().transform(v => (typeof v === 'number' && !isNaN(v) && v > 0) ? v : undefined),
}).refine(
  data => data.stopLossPrice || data.exitCondition,
  { message: '請至少填寫停損價或退出條件', path: ['exitCondition'] }
)

export type CreateProposalInput = z.input<typeof createProposalSchema>
export type CreateProposalOutput = z.infer<typeof createProposalSchema>

export const updateProposalSchema = z.object({
  ticker: z.string().min(1).optional(),
  stockName: z.string().min(1).optional(),
  market: z.string().optional(),
  proposalPrice: optionalPositiveNumber,
  investmentThesis: z.string().min(20).optional(),
  targetPrice: optionalPositiveNumber,
  stopLossPrice: optionalPositiveNumber,
  exitCondition: z.string().optional(),
  expectedHoldingDays: z.union([z.number(), z.nan()]).optional().transform(v => (typeof v === 'number' && !isNaN(v) && v > 0) ? v : undefined),
})

export type UpdateProposalInput = z.infer<typeof updateProposalSchema>
export type UpdateProposalFormInput = z.input<typeof updateProposalSchema>

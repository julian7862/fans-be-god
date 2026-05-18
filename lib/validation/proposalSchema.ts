import { z } from 'zod'

export const createProposalSchema = z.object({
  ticker: z.string().min(1, '請輸入股票代號'),
  stockName: z.string().min(1, '請輸入股票名稱'),
  market: z.string().optional(),
  proposalPrice: z.number().positive('提案價格必須大於 0').optional(),
  investmentThesis: z.string().min(20, '買進邏輯至少需要 20 個字'),
  targetPrice: z.number().positive('目標價必須大於 0'),
  stopLossPrice: z.number().positive('停損價必須大於 0').optional(),
  exitCondition: z.string().optional(),
  expectedHoldingDays: z.number().int().positive().optional(),
}).refine(
  data => data.stopLossPrice || data.exitCondition,
  { message: '請至少填寫停損價或退出條件', path: ['exitCondition'] }
)

export type CreateProposalInput = z.infer<typeof createProposalSchema>

export const updateProposalSchema = createProposalSchema.partial()

export type UpdateProposalInput = z.infer<typeof updateProposalSchema>

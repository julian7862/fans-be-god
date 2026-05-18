type TradeLot = {
  action: 'buy' | 'sell'
  price: number
  quantity: number
}

export function calculateSingleReturnPct(buyPrice: number, sellPrice: number): number {
  if (buyPrice === 0) return 0
  return ((sellPrice - buyPrice) / buyPrice) * 100
}

export function calculateAverageBuyCost(lots: TradeLot[]): number {
  const buyLots = lots.filter(lot => lot.action === 'buy')
  const totalAmount = buyLots.reduce((sum, lot) => sum + lot.price * lot.quantity, 0)
  const totalQuantity = buyLots.reduce((sum, lot) => sum + lot.quantity, 0)
  if (totalQuantity === 0) return 0
  return totalAmount / totalQuantity
}

export function calculateUnrealizedReturnPct(
  currentPrice: number,
  averageBuyCost: number
): number {
  if (averageBuyCost === 0) return 0
  return ((currentPrice - averageBuyCost) / averageBuyCost) * 100
}

export function calculateRealizedReturnPct(
  realizedPnl: number,
  investedCost: number
): number {
  if (investedCost === 0) return 0
  return (realizedPnl / investedCost) * 100
}

export function calculateAnnualizedReturnPct(
  holdingReturnPct: number,
  holdingDays: number
): number {
  if (holdingDays <= 0) return 0
  const decimalReturn = holdingReturnPct / 100
  const annualized = Math.pow(1 + decimalReturn, 365 / holdingDays) - 1
  return annualized * 100
}

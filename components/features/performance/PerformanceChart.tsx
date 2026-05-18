'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent } from '@/components/ui/card'

export type PerformanceChartData = {
  date: string
  returnPct: number
}

interface PerformanceChartProps {
  groupName: string
  data: PerformanceChartData[]
  currentReturnPct: number
}

export function PerformanceChart({ groupName, data, currentReturnPct }: PerformanceChartProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-white dark:bg-slate-950 p-6">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReturn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#000000" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                label={{ value: '報酬率 (%)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#000000' }}
                formatter={(value) => {
                  if (typeof value === 'number') {
                    return `${value.toFixed(2)}%`
                  }
                  return value
                }}
              />
              <Area
                type="monotone"
                dataKey="returnPct"
                stroke="#000000"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorReturn)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 dark:bg-slate-900">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{groupName}</p>
          <p className="text-2xl font-bold text-black dark:text-white">
            {currentReturnPct.toFixed(2)}%
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

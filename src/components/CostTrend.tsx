import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DailyData } from '../types'
import { fmtDate, fmtCost } from '../lib/format'

interface CostTrendProps {
  dates: string[]
  daily: Record<string, DailyData>
}

interface TooltipPayload {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-text-secondary mb-1">{label}</p>
      <p className="text-accent-purple font-semibold">{fmtCost(payload[0].value)}</p>
    </div>
  )
}

export function CostTrend({ dates, daily }: CostTrendProps) {
  const chartData = dates.map((d) => ({
    date: fmtDate(d),
    cost: daily[d]?.cost ?? 0,
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        일별 비용 추이
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval={Math.max(0, Math.floor(dates.length / 10) - 1)}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => '$' + v.toFixed(0)}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cost"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#costGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#8b5cf6' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

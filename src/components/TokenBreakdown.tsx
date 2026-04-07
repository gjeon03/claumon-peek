import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DailyData } from '../types'
import { fmtDate, fmtTokens, fmtAxisY } from '../lib/format'

interface TokenBreakdownProps {
  dates: string[]
  daily: Record<string, DailyData>
}

interface TooltipPayload {
  name: string
  value: number
  color: string
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
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {fmtTokens(p.value)}
        </p>
      ))}
    </div>
  )
}

export function TokenBreakdown({ dates, daily }: TokenBreakdownProps) {
  const chartData = dates.map((d) => ({
    date: fmtDate(d),
    '입력': daily[d]?.input_tokens ?? 0,
    '출력': daily[d]?.output_tokens ?? 0,
    '캐시 읽기': daily[d]?.cache_read_tokens ?? 0,
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        일별 토큰 추이
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="inputGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="cacheGrad" x1="0" y1="0" x2="0" y2="1">
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
            tickFormatter={fmtAxisY}
            width={44}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#6b7280', paddingTop: 8 }}
          />
          <Area
            type="monotone"
            dataKey="입력"
            stroke="#60a5fa"
            strokeWidth={1.5}
            fill="url(#inputGrad)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="출력"
            stroke="#34d399"
            strokeWidth={1.5}
            fill="url(#outputGrad)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="캐시 읽기"
            stroke="#8b5cf6"
            strokeWidth={1.5}
            fill="url(#cacheGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

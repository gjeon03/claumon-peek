import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { DailyData } from '../types'
import { fmtDate, fmtNum } from '../lib/format'

interface ActivityChartProps {
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
          {p.name}: {fmtNum(p.value)}
        </p>
      ))}
    </div>
  )
}

export function ActivityChart({ dates, daily }: ActivityChartProps) {
  const chartData = dates.map((d) => ({
    date: fmtDate(d),
    '세션': daily[d]?.sessions ?? 0,
    '메시지': daily[d]?.messages ?? 0,
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        일별 활동 — 세션 &amp; 메시지
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ top: 4, right: 48, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            interval={Math.max(0, Math.floor(dates.length / 10) - 1)}
          />
          <YAxis
            yAxisId="sessions"
            orientation="left"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <YAxis
            yAxisId="messages"
            orientation="right"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, color: '#6b7280', paddingTop: 8 }}
          />
          <Bar
            yAxisId="sessions"
            dataKey="세션"
            fill="#8b5cf6"
            opacity={0.8}
            radius={[2, 2, 0, 0]}
            maxBarSize={20}
          />
          <Line
            yAxisId="messages"
            type="monotone"
            dataKey="메시지"
            stroke="#34d399"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#34d399' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

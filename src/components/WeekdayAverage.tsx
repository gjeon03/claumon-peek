import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { WeekdayAvg } from '../types'

const DAY_MAP: Record<string, string> = {
  Monday: '월',
  Tuesday: '화',
  Wednesday: '수',
  Thursday: '목',
  Friday: '금',
  Saturday: '토',
  Sunday: '일',
}

interface WeekdayAverageProps {
  weekdayAvg: WeekdayAvg[]
}

export function WeekdayAverage({ weekdayAvg }: WeekdayAverageProps) {
  const data = weekdayAvg.map((d) => ({
    day: DAY_MAP[d.day] ?? d.day,
    sessions: parseFloat(d.sessions.toFixed(1)),
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        요일별 평균
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: '#1e1b2e',
              border: '1px solid rgba(139,92,246,0.3)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#e2e0ff' }}
            itemStyle={{ color: '#a78bfa' }}
            formatter={(v: number) => [v, '평균 세션']}
          />
          <Bar
            dataKey="sessions"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

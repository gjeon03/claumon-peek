import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LabelList,
  Cell,
} from 'recharts'
import { fmtCost } from '../lib/format'

const COLORS = [
  '#8b5cf6', '#a78bfa', '#7c3aed', '#6d28d9',
  '#9333ea', '#c084fc', '#7e22ce', '#4f46e5',
  '#818cf8', '#6366f1', '#a855f7', '#d946ef',
]

interface ProjectBreakdownProps {
  projects: [string, { sessions: number; cost: number; tokens: number; messages: number }][]
}

export function ProjectBreakdown({ projects }: ProjectBreakdownProps) {
  const top12 = projects.slice(0, 12)
  const data = top12.map(([name, stats]) => ({
    name: name.length > 20 ? name.slice(0, 18) + '…' : name,
    cost: stats.cost,
    costLabel: fmtCost(stats.cost),
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        프로젝트별 비용 — TOP 12
      </p>
      <ResponsiveContainer width="100%" height={340}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 72, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--c-border-soft)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: 'var(--c-text-secondary)' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => fmtCost(v)}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={140}
            tick={{ fontSize: 11, fill: '#c4b5fd' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: 'var(--c-card)',
              border: '1px solid var(--c-border)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--c-text)' }}
            itemStyle={{ color: '#a78bfa' }}
            formatter={(v: number) => [fmtCost(v), '비용']}
          />
          <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
            <LabelList
              dataKey="costLabel"
              position="right"
              style={{ fontSize: 11, fill: 'var(--c-text-secondary)' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface CommandFrequencyProps {
  commands: [string, number][]
}

export function CommandFrequency({ commands }: CommandFrequencyProps) {
  const top15 = commands.slice(0, 15)
  const data = top15.map(([name, count]) => ({ name: `/${name}`, count }))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        자주 사용하는 명령어 — TOP 15
      </p>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 11, fill: '#c4b5fd' }}
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
            formatter={(v: number) => [v, '횟수']}
          />
          <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

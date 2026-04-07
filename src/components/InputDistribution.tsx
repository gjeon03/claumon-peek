import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface InputDistributionProps {
  dist: Record<string, number>
}

export function InputDistribution({ dist }: InputDistributionProps) {
  const data = Object.entries(dist).map(([bucket, count]) => ({
    bucket: `${bucket}자`,
    count,
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        입력 길이 분포
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="bucket"
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
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
              border: '1px solid rgba(96,165,250,0.3)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#e2e0ff' }}
            itemStyle={{ color: '#60a5fa' }}
            formatter={(v: number) => [v, '개']}
          />
          <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

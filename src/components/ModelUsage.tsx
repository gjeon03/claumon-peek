import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { AnalyticsData } from '../types'
import { fmtNum } from '../lib/format'

interface ModelUsageProps {
  data: AnalyticsData
}

const MODEL_COLORS: Record<string, string> = {
  Opus: '#c084fc',
  Sonnet: '#60a5fa',
  'Sonnet 4.5': '#34d399',
  Haiku: '#fbbf24',
}

const DEFAULT_COLOR = '#94a3b8'

interface CustomTooltipProps {
  active?: boolean
  payload?: { name: string; value: number }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs">
      <p className="text-text-primary font-semibold">{payload[0].name}</p>
      <p className="text-text-secondary">{fmtNum(payload[0].value)} calls</p>
    </div>
  )
}

export function ModelUsage({ data }: ModelUsageProps) {
  const chartData = Object.entries(data.model_usage).map(([name, entry]) => ({
    name,
    value: entry.count,
  }))

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">
        모델별 사용량
      </p>
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={MODEL_COLORS[entry.name] ?? DEFAULT_COLOR}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-3 flex-1">
          {chartData.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MODEL_COLORS[entry.name] ?? DEFAULT_COLOR }}
                />
                <span className="text-xs text-text-primary">{entry.name}</span>
              </div>
              <span className="text-xs text-text-secondary font-mono">
                {fmtNum(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

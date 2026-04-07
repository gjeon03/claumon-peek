import { useEffect, useState } from 'react'
import type { AnalyticsData, Period } from './types'
import { sliceDates } from './lib/filter'
import { Header } from './components/Header'
import { TodaySummary } from './components/TodaySummary'
import { SummaryCards } from './components/SummaryCards'
import { Highlights } from './components/Highlights'
import { CostTrend } from './components/CostTrend'
import { ModelUsage } from './components/ModelUsage'
import { TokenBreakdown } from './components/TokenBreakdown'
import { CostEfficiency } from './components/CostEfficiency'
import { ActivityChart } from './components/ActivityChart'
import { WeekdayAverage } from './components/WeekdayAverage'
import { Heatmap } from './components/Heatmap'
import { WeeklyTimeline } from './components/WeeklyTimeline'
import { ConcurrentSessions } from './components/ConcurrentSessions'
import { TopSessions } from './components/TopSessions'
import { ToolUsage } from './components/ToolUsage'
import { CommandFrequency } from './components/CommandFrequency'
import { ProjectBreakdown } from './components/ProjectBreakdown'
import { InputDistribution } from './components/InputDistribution'
import { CacheStats } from './components/CacheStats'
import { ShareCard } from './components/ShareCard'

export default function App() {
  const [rawData, setRawData] = useState<AnalyticsData | null>(null)
  const [period, setPeriod] = useState<Period>('1M')
  const [account, setAccount] = useState<string>('all')
  const [showShare, setShowShare] = useState(false)

  useEffect(() => {
    fetch('/data.json')
      .then((r) => r.json())
      .then((d: AnalyticsData) => setRawData(d))
      .catch(console.error)
  }, [])

  if (!rawData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary" style={{ background: '#0b0b11' }}>
        Loading...
      </div>
    )
  }

  // Switch data source based on account selection
  const data = account === 'all' || !rawData.account_data[account]
    ? rawData
    : rawData.account_data[account]

  const accounts = rawData.accounts ?? []

  const filteredDates = sliceDates(data.dates, period)
  const dateRange: [string, string] = [
    data.dates[0] ?? '',
    data.dates[data.dates.length - 1] ?? '',
  ]

  return (
    <div className="min-h-screen" style={{ background: '#0b0b11', color: '#e8eaf0' }}>
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <Header
          period={period}
          setPeriod={setPeriod}
          dateRange={dateRange}
          onShare={() => setShowShare(true)}
          accounts={accounts}
          account={account}
          setAccount={setAccount}
        />

        <TodaySummary data={data} />

        <div className="mt-4">
          <SummaryCards data={data} period={period} />
        </div>

        <div className="mt-6">
          <Highlights
            highlights={data.highlights}
            streak={data.streak}
            totalCost={data.total_cost}
            cacheSavings={data.cache_savings}
          />
        </div>

        <div className="mt-6">
          <CostTrend dates={filteredDates} daily={data.daily} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <ModelUsage data={data} />
          <TokenBreakdown dates={filteredDates} daily={data.daily} />
        </div>

        <div className="mt-6">
          <CostEfficiency dates={filteredDates} daily={data.daily} />
        </div>

        <div className="mt-6">
          <ActivityChart dates={filteredDates} daily={data.daily} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <WeekdayAverage weekdayAvg={data.weekday_avg} />
          <Heatmap heatmap={data.heatmap} />
        </div>

        <div className="mt-6">
          <WeeklyTimeline timeline={data.weekly_timeline} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <ConcurrentSessions concurrent={data.concurrent} />
          <TopSessions sessions={data.top_sessions} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <ToolUsage tools={data.tool_usage} />
          <CommandFrequency commands={data.command_frequency} />
        </div>

        <div className="mt-6">
          <ProjectBreakdown projects={data.project_stats} />
        </div>

        <div className="mt-6">
          <InputDistribution dist={data.input_length_dist} />
        </div>

        <div className="mt-6">
          <CacheStats data={{
            cache_read: data.total_cache_read_tokens,
            cache_write: data.total_cache_write_tokens,
            hit_rate: data.cache_hit_rate,
            savings: data.cache_savings,
          }} />
        </div>

        <div className="text-center text-text-muted text-xs mt-12 pb-8">
          ClauMon Peek · Built by analyzing ~/.claude/ local data
        </div>
      </div>

      {showShare && <ShareCard data={data} onClose={() => setShowShare(false)} />}
    </div>
  )
}

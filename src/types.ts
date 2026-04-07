export interface DailyData {
  cost: number
  input_tokens: number
  output_tokens: number
  cache_read_tokens: number
  cache_write_tokens: number
  sessions: number
  messages: number
  tools: number
  cost_per_message: number
}

export interface Highlights {
  most_expensive_day: { date: string; cost: number }
  longest_session: { duration_min: number; project: string; date: string }
  busiest_hour: { weekday: string; hour: number; count: number }
  cache_vs_cost: boolean
  favorite_model: { model: string; pct: number }
}

export interface Streak {
  current: number
  longest: number
  longest_start: string
  longest_end: string
}

export interface ModelUsageEntry {
  count: number
  cost: number
}

export interface ModelBreakdown {
  model: string
  input_tokens: number
  output_tokens: number
  cache_read: number
  cache_write: number
  cost: number
}

export interface TopSession {
  duration_min: number
  project: string
  date: string
  cost: number
  messages: number
}

export interface WeekdayAvg {
  day: string
  sessions: number
  messages: number
  cost: number
}

export interface TimelineEntry {
  date: string
  start_hour: number
  end_hour: number
  project: string
  concurrent: number
}

export interface PeriodComparison {
  sessions: { current: number; previous: number; pct: number }
  cost: { current: number; previous: number; pct: number }
  messages: { current: number; previous: number; pct: number }
}

export interface AnalyticsData {
  total_cost: number
  total_input_tokens: number
  total_output_tokens: number
  total_cache_write_tokens: number
  total_cache_read_tokens: number
  total_sessions: number
  total_messages: number
  total_tools: number
  total_duration_min: number
  avg_duration_min: number
  session_count_with_duration: number
  cache_hit_rate: number
  cache_savings: number

  dates: string[]
  daily: Record<string, DailyData>
  daily_models: Record<string, Record<string, number>>
  heatmap: number[][]
  model_usage: Record<string, ModelUsageEntry>
  model_breakdown: ModelBreakdown[]
  tool_usage: [string, number][]
  project_stats: [string, { sessions: number; cost: number; tokens: number; messages: number }][]
  top_sessions: TopSession[]
  weekday_avg: WeekdayAvg[]
  weekly_timeline: TimelineEntry[]
  concurrent: Record<string, number>
  command_frequency: [string, number][]
  input_length_dist: Record<string, number>
  period_comparison: Record<string, PeriodComparison>
  highlights: Highlights
  streak: Streak
}

export type Period = '1W' | '1M' | '3M' | 'ALL'

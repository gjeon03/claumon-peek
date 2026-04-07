import type { Period } from '../types'
import type { Theme } from '../lib/theme'

const PERIODS: Period[] = ['1W', '1M', '3M', 'ALL']

const THEME_CYCLE: Theme[] = ['system', 'light', 'dark']

const THEME_ICON: Record<Theme, string> = {
  dark: '🌙',
  light: '☀️',
  system: '💻',
}

const THEME_LABEL: Record<Theme, string> = {
  dark: '다크',
  light: '라이트',
  system: '시스템',
}

interface HeaderProps {
  period: Period
  setPeriod: (p: Period) => void
  dateRange: [string, string]
  onShare?: () => void
  accounts?: string[]
  account?: string
  setAccount?: (a: string) => void
  theme: Theme
  setTheme: (t: Theme) => void
}

export function Header({ period, setPeriod, dateRange, onShare, accounts, account, setAccount, theme, setTheme }: HeaderProps) {
  const [start, end] = dateRange
  const hasMultipleAccounts = accounts && accounts.length > 1

  function cycleTheme() {
    const idx = THEME_CYCLE.indexOf(theme)
    const next = THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]
    setTheme(next)
  }

  return (
    <div className="flex justify-between items-start pb-5 mb-6 border-b border-border">
      <div>
        <h1 className="text-2xl font-bold">
          <span className="text-text-primary">ClauMon</span>
          <span className="text-accent-purple">Peek</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          {start} ~ {end}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {hasMultipleAccounts && setAccount && (
          <select
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-card border border-border text-text-primary appearance-none cursor-pointer"
          >
            <option value="all">전체</option>
            {accounts.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        )}
        <button
          onClick={cycleTheme}
          title={`현재: ${THEME_LABEL[theme]} — 클릭하여 전환`}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-card border border-border text-text-secondary hover:text-text-primary hover:border-border transition-colors"
        >
          {THEME_ICON[theme]} {THEME_LABEL[theme]}
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-accent-purple/15 text-accent-purple border border-accent-purple/30 hover:bg-accent-purple/25 transition-colors"
          >
            공유 카드
          </button>
        )}
        <div className="flex gap-1 bg-card border border-border rounded-full p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={
                p === period
                  ? 'px-4 py-1.5 text-xs font-semibold rounded-full bg-accent-purple text-white transition-colors'
                  : 'px-4 py-1.5 text-xs font-semibold rounded-full text-text-secondary hover:text-text-primary transition-colors'
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

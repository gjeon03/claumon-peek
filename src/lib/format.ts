export function fmtCost(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

export function fmtTokens(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

export function fmtDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}분`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const h = hours % 24
    return `${days}일 ${h}시간`
  }
  return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`
}

export function fmtDate(iso: string): string {
  const parts = iso.split('-')
  return parts[1] + '/' + parts[2]
}

export function fmtPct(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(1)}%`
}

export function fmtAxisY(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + 'B'
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M'
  if (v >= 1e3) return (v / 1e3).toFixed(0) + 'K'
  return String(v)
}

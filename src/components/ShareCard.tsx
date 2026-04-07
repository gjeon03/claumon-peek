import type { AnalyticsData } from '../types'
import { fmtCost, fmtNum } from '../lib/format'

interface ShareCardProps {
  data: AnalyticsData
  onClose: () => void
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 11, color: '#6b7280' }}>{label}</span>
      <span style={{ fontSize: 16, fontWeight: 700, color: '#e5e7eb' }}>{value}</span>
    </div>
  )
}

export function ShareCard({ data, onClose }: ShareCardProps) {
  async function handleDownload() {
    const html2canvas = (await import('html2canvas')).default
    const el = document.getElementById('share-card')
    if (!el) return
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: null })
    const link = document.createElement('a')
    link.download = 'claumon-peek-2026.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          id="share-card"
          style={{
            width: 640,
            height: 360,
            background: 'linear-gradient(135deg, #0b0b11 0%, #1a1a2e 100%)',
            borderRadius: 16,
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          <div>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', margin: 0 }}>
              나의 Claude Code 2026
            </h2>
            <div
              style={{
                width: 48, height: 3,
                background: 'linear-gradient(to right, #8b5cf6, #3b82f6)',
                borderRadius: 2, marginTop: 8,
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px' }}>
            <StatItem label="총 세션" value={fmtNum(data.total_sessions)} />
            <StatItem label="총 비용" value={fmtCost(data.total_cost)} />
            <StatItem label="총 메시지" value={fmtNum(data.total_messages)} />
            <StatItem label="최애 모델" value={data.highlights?.favorite_model?.model ?? '—'} />
            <StatItem label="연속 사용" value={`${data.streak?.current ?? 0}일`} />
            <StatItem label="총 사용 시간" value={`${Math.floor(data.total_duration_min / 60 / 24)}일`} />
          </div>

          <p style={{ fontSize: 12, color: '#4b5563', margin: 0 }}>ClauMon Peek</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="text-sm font-semibold bg-accent-purple text-white rounded-lg px-5 py-2 hover:opacity-90 transition-opacity"
          >
            이미지 저장
          </button>
          <button
            onClick={onClose}
            className="text-sm font-medium text-text-secondary border border-border rounded-lg px-5 py-2 hover:bg-card transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  )
}

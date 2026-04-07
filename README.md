# ClauMon Peek

`~/.claude/` 로컬 데이터를 분석해서 Claude Code 사용 통계를 보여주는 대시보드.

## 실행

```bash
pnpm install
pnpm dev        # 데이터 파싱 + dev server 실행
```

`pnpm dev` 하나로 `~/.claude/` 디렉토리의 세션 데이터를 파싱하고 대시보드를 띄웁니다.

## 주요 통계

- 일별 비용 추이 / 토큰 사용량
- 모델별 사용 비율 (Opus, Sonnet, Haiku)
- 메시지당 비용 효율
- 요일별 평균 / 시간대 히트맵
- 주간 타임라인 (Gantt)
- 동시 세션 분석
- 프로젝트별 비용 TOP 12
- 자주 사용하는 명령어 TOP 15
- 입력 길이 분포
- 연속 사용일 / 하이라이트
- 공유 카드 이미지 생성

## 기술 스택

- **데이터 파싱**: Python (`analyze.py` → `public/data.json`)
- **프론트엔드**: Vite + React + TypeScript + Tailwind CSS v4 + Recharts

## 개인정보

`public/data.json`은 `.gitignore`로 제외되어 있습니다. 각 사용자의 로컬 데이터는 본인 머신에서만 생성되고 외부로 전송되지 않습니다.

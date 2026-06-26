/** 결과 통계 아이콘 (currentColor 상속) */
const Icons = {
  check: (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  ),
  x: (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" />
    </svg>
  ),
  up: (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  down: (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  ),
};

/**
 * 퀴즈 결과 요약 카드 — 총점(원) + 정답/오답/향상도 + 직전 주차 비교 메시지.
 * 표시용 leaf(전부 props). 향상도 = score − 직전 주차 점수(없으면 비교 불가).
 */
export default function QuizResultSummary({
  score,
  correctCount,
  totalCount,
  previousScore,
  improvement,
}: {
  score: number;
  correctCount: number;
  totalCount: number;
  previousScore: number | null;
  improvement: number | null;
}) {
  const wrongCount = totalCount - correctCount;
  const up = improvement !== null && improvement > 0;
  const down = improvement !== null && improvement < 0;
  const impText =
    improvement === null || improvement === 0
      ? '+0점'
      : improvement > 0
        ? `+${improvement}점`
        : `${improvement}점`;
  // 디자인: 상승=파랑 / 하락=빨강 / 동일·비교불가=회색
  const impColor = up
    ? 'text-[#2F5DAA]'
    : down
      ? 'text-[#B91C1C]'
      : 'text-[#64748B]';
  const impBg = up
    ? 'bg-[#2F5DAA1a]'
    : down
      ? 'bg-[#B91C1C1a]'
      : 'bg-[#64748B1a]';

  const stats = [
    { label: '정답', value: `${correctCount}개`, color: 'text-[#16A34A]', bg: 'bg-[#16A34A1a]', icon: Icons.check },
    { label: '오답', value: `${wrongCount}개`, color: 'text-[#B91C1C]', bg: 'bg-[#B91C1C1a]', icon: Icons.x },
    { label: '향상도', value: impText, color: impColor, bg: impBg, icon: down ? Icons.down : Icons.up },
  ];

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col items-center">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#2F5DAA1a]">
          <span className="text-5xl font-bold text-[#2F5DAA]">{score}</span>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-[#1F2937]">총점</h2>
        <p className="mt-2 text-base text-[#4B5563]">
          {correctCount} / {totalCount} 정답
        </p>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-[#E2E8F0] pt-6">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center">
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-full ${s.bg} ${s.color}`}
            >
              {s.icon}
            </span>
            <p className="mt-3 text-sm text-[#4B5563]">{s.label}</p>
            <p className={`mt-1 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[#E2E8F0] pt-6 text-center text-sm text-[#4B5563]">
        {previousScore === null || improvement === null ? (
          <p>비교할 이전 데이터가 없습니다</p>
        ) : (
          <p>
            이전 퀴즈: {previousScore}점 · 지난 주보다{' '}
            <span className={`font-semibold ${impColor}`}>
              {Math.abs(improvement)}점{' '}
              {improvement > 0 ? '상승' : improvement < 0 ? '하락' : '동일'}
            </span>
            했습니다
          </p>
        )}
      </div>
    </section>
  );
}

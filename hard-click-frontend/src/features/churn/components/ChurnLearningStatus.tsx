import type { ChurnLearningStatus as Status } from '../types';

/** 누적 순공시간(분) → "N시간 M분"(1시간 미만은 "M분") */
function formatStudyMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}분`;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

/** 학습 현황 카드 (Server Component). progressRate/recentQuizAvg는 BE 미집계 시 null → "집계 전" 표시. */
export default function ChurnLearningStatus({ status }: { status: Status }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-[#1E293B]">학습 현황</h2>

      <dl className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-[#64748B]">진도율</dt>
          <dd className="font-semibold text-[#1E293B]">
            {status.progressRate === null ? '집계 전' : `${status.progressRate}%`}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-[#64748B]">마지막 접속</dt>
          <dd className="font-semibold text-[#1E293B]">
            {status.lastAccessLabel}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-[#64748B]">최근 퀴즈 평균</dt>
          <dd className="font-semibold text-[#1E293B]">
            {status.recentQuizAvg === null ? '집계 전' : `${status.recentQuizAvg}점`}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-[#64748B]">누적 순공시간</dt>
          <dd className="font-semibold text-[#1E293B]">
            {formatStudyMinutes(status.totalStudyMinutes)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

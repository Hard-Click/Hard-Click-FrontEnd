import type { ChurnLearningStatus as Status } from '../types';

/** 학습 현황 카드 (Server Component). */
export default function ChurnLearningStatus({ status }: { status: Status }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-[#1E293B]">학습 현황</h2>

      <dl className="space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-[#64748B]">진도율</dt>
          <dd className="font-semibold text-[#1E293B]">
            {status.progressRate}%{' '}
            <span className="font-normal text-[#94A3B8]">
              (목표 {status.targetRate}%)
            </span>
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
            {status.recentQuizAvg}점{' '}
            {status.recentQuizDelta !== 0 && (
              <span
                className={
                  status.recentQuizDelta < 0
                    ? 'text-[#DC2626]'
                    : 'text-[#16A34A]'
                }
              >
                {status.recentQuizDelta < 0 ? '↓' : '↑'}
                {Math.abs(status.recentQuizDelta)}
              </span>
            )}
          </dd>
        </div>

        <div className="flex items-center justify-between">
          <dt className="text-[#64748B]">누적 순공시간</dt>
          <dd className="font-semibold text-[#1E293B]">
            {status.totalStudyHours}시간
          </dd>
        </div>
      </dl>
    </div>
  );
}
